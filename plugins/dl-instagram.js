import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
  try {
    if (!text) return m.reply('✰ Ingresa un link de Instagram')

    if (!/instagram\.com/i.test(text)) {
      return m.reply('✘ Link inválido de Instagram')
    }

    await m.react('🕒')
    const infoApi = `${global.APIs.light.url}/download/igdl/v2?url=${encodeURIComponent(text)}`
    const infoRes = await fetch(infoApi)
    const info = await infoRes.json()

    if (!info.status) throw 'Error en la API de info'

    const meta = info.metadata || {}
    const author = info.author || {}
    const media = info.media || {}

    const caption =
`🍜 *Instagram Downloader*

✰ *Autor:* ${author.fullName || author.username || '-'} (@${author.username || '-'})
🔗 *Link:* https://www.instagram.com/${author.username || ''}

✎ *Caption:*
${meta.caption || '-'}

❤ *Likes:* ${meta.likes || '0'}
💬 *Comentarios:* ${meta.comments || '0'}
📅 *Fecha:* ${meta.created_at || '-'}
🎬 *Tipo:* ${info.type || '-'}
`.trim()

    const videoApi = `${global.APIs.light.url}/download/igdl?url=${encodeURIComponent(text)}`
    const videoRes = await fetch(videoApi)
    const videoJson = await videoRes.json()

    if (videoJson.status && videoJson.videos?.length) {
      let video = videoJson.videos[0]

      return await conn.sendMessage(m.chat, {
        video: { url: video },
        caption
      }, { quoted: m })
    }

    if (author.profilePic) {
      return await conn.sendMessage(m.chat, {
        image: { url: author.profilePic },
        caption
      }, { quoted: m })
    }

    throw 'No hay contenido disponible'

  } catch (e) {
    console.error(e)
    m.reply('✘ Error al descargar Instagram')
  }
}

handler.help = ['instagram', 'ig']
handler.tags = ['download']
handler.command = ['instagram', 'ig', 'igdl']

export default handler