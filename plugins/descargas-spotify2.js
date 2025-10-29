import fetch from 'node-fetch'
import Jimp from 'jimp'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`🍂 *Uso correcto:*\n\n✦ \`${usedPrefix + command}\` <url o nombre de canción>\n\n📌 Ejemplo:\n${usedPrefix + command} https://open.spotify.com/track/3aPRjg26MXywx4V89uyjad`)
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: '🕓', key: m.key } })
    let info = null
    let json = {}

    if (text.includes('spotify.com/track')) {
      const apiUrl = `https://api-nv.ultraplus.click/api/download/spotify?url=${encodeURIComponent(text)}&key=IUHp9S4ExrywBB35`
      const res = await fetch(apiUrl)
      if (!res.ok) throw await res.text()
      const data = await res.json()
      if (!data.status || !data.result?.url_download) throw '❌ No pude obtener la descarga del audio.'

      const d = data.result
      json = {
        title: d.title || 'Desconocido',
        author: d.artist || 'Desconocido',
        image: d.image || null,
        duration: d.duration || 0,
        url: d.url_download,
        source: d.source
      }

      const query = encodeURIComponent(`${json.title} ${json.author}`)
      const resInfo = await fetch(`https://api.yupra.my.id/api/search/spotify?q=${query}`)
      if (resInfo.ok) {
        const jInfo = await resInfo.json()
        info = jInfo.result?.[0] || null
      }

    } else {

      const searchRes = await fetch(`https://api.yupra.my.id/api/search/spotify?q=${encodeURIComponent(text)}`)
      if (!searchRes.ok) throw await searchRes.text()
      const jSearch = await searchRes.json()
      if (!jSearch.result || !jSearch.result[0]) throw 'No encontré resultados.'

      info = jSearch.result[0]
      const url = info?.spotify_url || info?.spotify_preview
      if (!url) throw 'No se encontró enlace válido de Spotify.'

      const apiUrl = `https://api-nv.ultraplus.click/api/download/spotify?url=${encodeURIComponent(url)}&key=IUHp9S4ExrywBB35`
      const resDl = await fetch(apiUrl)
      if (!resDl.ok) throw await resDl.text()
      const dataDl = await resDl.json()
      if (!dataDl.status || !dataDl.result?.url_download) throw 'Error al obtener el audio.'

      const d = dataDl.result
      json = {
        title: d.title || 'Desconocido',
        author: d.artist || 'Desconocido',
        image: d.image || null,
        duration: d.duration || 0,
        url: d.url_download,
        source: d.source
      }
    }

    const duration = json.duration > 0
      ? new Date(json.duration).toISOString().substr(14, 5)
      : 'Desconocido'

    const moreInfo = info ? `
🎶 Álbum: ${info.album_name || 'Desconocido'}
📀 Lanzamiento: ${info.release_date || 'N/A'}
🔗 Preview: ${info.spotify_preview || 'N/A'}` : ''

    const caption = `\`\`\`🧪 Título: ${json.title}
👤 Artista: ${json.author}
⏱️ Duración: ${duration}\`\`\`${moreInfo}`

    // 🖼️ Miniatura
    let thumb = null
    if (json.image) {
      try {
        const img = await Jimp.read(json.image)
        img.resize(300, Jimp.AUTO)
        thumb = await img.getBufferAsync(Jimp.MIME_JPEG)
      } catch (err) {
        console.log('⚠️ Error al procesar miniatura:', err)
      }
    }

    await conn.sendMessage(m.chat, {
      document: { url: json.url },
      mimetype: 'audio/mpeg',
      fileName: `${json.title}.mp3`,
      caption,
      ...(thumb ? { jpegThumbnail: thumb } : {}),
      contextInfo: {
        externalAdReply: {
          title: json.title,
          body: `👤 ${json.author} • ⏱️ ${duration}`,
          mediaType: 2,
          thumbnailUrl: json.image,
          renderLargerThumbnail: true,
          sourceUrl: json.source || text
        }
      }
    }, { quoted: fkontak })
    
    await conn.sendMessage(m.chat, {
      audio: { url: json.url },
      mimetype: 'audio/mpeg',
      fileName: `${json.title}.mp3`,
      contextInfo: {
        externalAdReply: {
          title: json.title,
          body: `👤 ${json.author} • ⏱️ ${duration}`,
          mediaType: 2,
          thumbnailUrl: json.image,
          renderLargerThumbnail: true,
          sourceUrl: json.source || text
        }
      }
    }, { quoted: fkontak })

  } catch (e) {
    console.error(e)
    m.reply('Error al procesar la descarga de Spotify.')
  }
}

handler.help = ['music <url|nombre>']
handler.tags = ['download']
handler.command = ['music']

export default handler