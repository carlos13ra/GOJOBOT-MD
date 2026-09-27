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
        { image: { url: video.thumbnail } },
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
    }, { quoted: m })

    const dlJson = await fetch(
      `${global.APIs.light.url}/download/ytmp4?url=${encodeURIComponent(video.url)}`
    ).then(r => r.json())

    const dl = dlJson?.data?.download
    if (!dl?.url) throw dlJson?.message || 'No se pudo obtener el enlace de descarga'

    const videoBuffer = await fetch(dl.url).then(r => r.buffer())
    const fileSize = videoBuffer.length / (1024 * 1024)

    if (fileSize > 150) {
      throw `El video es muy pesado (${fileSize.toFixed(2)}MB). Límite: 150MB | Use /mp4doc`
    }

    const title    = dlJson.data.title || video.title
    const quality  = dl.quality || dl.label || 'N/A'
    const res      = dl.resolution ? ` (${dl.resolution})` : ''
    const sizeMb   = fileSize.toFixed(2)
    const caption = `    -ˏ͛⑅🍜.⃟꩜‹— 𝗬𝗢𝗨𝗧𝗨𝗕𝗘 𝗠𝗣𝟰  ˚₊·—̳͟͞͞♡ 
 ᰔ ִ ׄ *Título:* ${title}
 ᰔ ִ ׄ *Calidad:* ${quality}${res}
 ᰔ ִ ׄ *Peso:* ${sizeMb} MB`

    const fileName = `${title}.mp4`
    await conn.sendFile(m.chat, videoBuffer, fileName, caption, m)

    await m.react('✔️')
  } catch (e) {
    conn.reply(m.chat, ` Error:\n${e}`, m)
  }
}

handler.command = ['play2', 'video', 'mp4']
handler.tags = ['download']
handler.help = ['play2 + <query/url>']
handler.group = true
export default handler