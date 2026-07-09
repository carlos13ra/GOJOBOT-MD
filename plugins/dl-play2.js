import fetch from 'node-fetch'
import yts from 'yt-search'

let handler = async (m, { conn, text, command }) => {
  try {
    if (!text?.trim())
      return conn.reply(m.chat, `《✧》Por favor, menciona el nombre o URL del video que deseas descargar`, m)

    await m.react('🔍')
    const searchRes = await yts(text)
    if (!searchRes.videos || !searchRes.videos.length)
      throw 'No se encontraron resultados.'

    const video = searchRes.videos[0]
    const formatViews = (views) => {
      return views.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    }

    await conn.sendMessage(m.chat, {
        text: ` *｡ Título :* ${video.title}
 *｡ Author :* ${video.author?.name || 'Desconocido'}
 *｡ Vistas :* ${formatViews(video.views)}
 *｡ Duración :* ${video.timestamp}
 *｡ Publicado :* ${video.ago || '```'}
 *｡ Enlace :* ${video.url} 
     
      _🎋 Descargando Video..._
      `,
        linkPreview: video.thumbnail ? (await gojo(
        { image: { url: video.thumbnail }}, 
        { upload: conn.waUploadToServer, mediaTypeOverride: 'thumbnail-link' }
      ).then(({ imageMessage }) => ({ 
        'canonical-url': video.url,
        'matched-text': video.url,
        title: `𖹭  ׄ  ְ 🍡 Y O U T U B E - M U S I C   ݁      ✩   ݂      ݁  `, 
        description: botname, 
        jpegThumbnail: imageMessage?.jpegThumbnail ? Buffer.from(imageMessage.jpegThumbnail) : undefined, 
        highQualityThumbnail: imageMessage || undefined 
      }))) : undefined,
        contextInfo: {
          mentionedJid: [m.sender],
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: channelRD.id,
            serverMessageId: '',
            newsletterName: channelRD.name
          },
        }
      }, { quoted: m });

    const dlRes = await fetch(`${global.APIs.light.url}/download/ytvideo?url=${encodeURIComponent(video.url)}`)
    const dlJson = await dlRes.json()

    if (!dlJson.status || !dlJson.data?.dl)
      throw 'No se pudo obtener el video.'

    await conn.sendMessage(m.chat, {
      video: { url: dlJson.data.dl },
      mimetype: 'video/mp4',
      fileName: `${dlJson.data.title}.mp4`
    }, { quoted: m })

    await m.react('✔️')

  } catch (e) {
    conn.reply(m.chat, ` Error:\n${e}`, m)
  }
}

handler.command = ['play2', 'video']
handler.tags = ['download']
handler.help = ['play2 + <query/url>']
handler.group = true
export default handler