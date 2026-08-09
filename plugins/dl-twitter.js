import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix }) => {
  if (!text) {
    return conn.reply(m.chat, `❀ Te faltó el link de una imagen/video de twitter.`, m)
  }

  try {
    await m.react('🕒')
    const api = `${global.APIs.light.url}/download/twitter?url=${encodeURIComponent(text)}`
    const res = await fetch(api)
    const result = await res.json()

    if (!result.status) {
      return conn.reply(m.chat, `ꕥ No se pudo obtener el contenido de Twitter`, m)
    }

    const data = result
    const video = data.videos?.[0]
    const autor = data.autor
    const stats = data.stats

    const formatNumber = (num) => {
      if (!num) return "0"
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    }

    const formatDate = (dateStr) => {
      if (!dateStr) return "N/A"
      const date = new Date(dateStr)
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const formatDuration = (dur) => {
      return dur || "N/A"
    }

    let statsCaption = `╭─ 𝗧𝗪𝗜𝗧𝗧𝗘𝗥/𝗫 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗘𝗥
│
│ ° Autor: ${autor?.nombre || 'Desconocido'}
│ ° @${autor?.username || 'N/A'} ${autor?.verificado ? '✓' : ''}
│ ° Seguidores: ${formatNumber(autor?.seguidores)}
│ ° Siguiendo: ${formatNumber(autor?.siguiendo)}
│
│ ° Likes: ${formatNumber(stats?.likes)}
│ ° Retweets: ${formatNumber(stats?.retweets)}
│ ° Replies: ${formatNumber(stats?.replies)}
│ ° Citas: ${formatNumber(stats?.citas)}
│ ° Vistas: ${formatNumber(stats?.vistas)}
│
│ ° Fecha: ${formatDate(data.fecha)}
│ ° URL: ${data.url_tweet}
│
╰─────────────────

📝 Texto:
${data.texto || 'Sin texto'}
`
    await conn.sendFile(m.chat, video.thumbnail, 'xd.jpg', statsCaption, m)
    
    if (data.tiene_video && video) {
      try {
        const downloadUrl = video.url
        const title = data.texto?.substring(0, 50) || 'video'

        await conn.sendMessage(m.chat, {
          video: { url: downloadUrl },
          mimetype: 'video/mp4',
          fileName: `${title}.mp4`,
          caption: `╭𖹭╮𝅄𖹠  _Twitter Downloader_
│🍡│  Duración : ${formatDuration(video.duracion)}
│🍃│  Resolución : ${video.resolucion?.ancho}x${video.resolucion?.alto}
│🌷│  Bitrate : ${video.bitrate}
╰──────────𖹭╯`
        }, { quoted: m })

        await m.react('✅')
      } catch (err) {
        console.log("Error descargando video:", err.message)
        await m.react('⚠️')
      }
    } else {
      await m.react('⚠️')
    }

  } catch (e) {
    await m.react('✖️')
    return conn.reply(
      m.chat,
      `⚠︎ Se ha producido un problema.
> Usa *${usedPrefix}report* para informarlo.

${e.message || e}`,
      m
    )
  }
}

handler.command = ['x', 'twitter', 'xdl', 'twdl']
handler.help = ['twitter <url>']
handler.tags = ['download']
handler.group = true

export default handler