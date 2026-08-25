import fetch from 'node-fetch'
import yts from 'yt-search'
import axios from 'axios'

let handler = async (m, { conn, text, command }) => {
  try {
    if (!text?.trim())
      return conn.reply(m.chat, `《✧》Por favor, menciona el nombre o URL del audio que deseas descargar`, m)

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
     
      _🎋 Descargando audio..._
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

    const [dlRes1, dlRes2] = await Promise.allSettled([
      fetch(`${global.APIs.light.url}/download/savetube?url=${encodeURIComponent(video.url)}&type=audio`),
      fetch(`https://nexus-light-7uyb.onrender.com/download/cnvmp3.php?url=${encodeURIComponent(video.url)}&format=mp3&quality=128`)
    ])

    let dlJson = null
    let audioUrl = null

    if (dlRes1.status === 'fulfilled') {
      try {
        dlJson = await dlRes1.value.json()
        if (dlJson.status && dlJson.data?.dl) {
          audioUrl = dlJson.data.dl
        }
      } catch (e) {}
    }

    if (!audioUrl && dlRes2.status === 'fulfilled') {
      try {
        dlJson = await dlRes2.value.json()
        if (dlJson.status && dlJson.data?.download) {
          const fileRes = await axios.get(dlJson.data.download, {
            responseType: 'arraybuffer',
            timeout: 120000,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Linux; Android 10)',
              referer: 'https://cnvmp3.com/'
            }
          })
          audioUrl = fileRes.data
        }
      } catch (e) {}
    }

    if (!audioUrl)
      throw 'No se pudo obtener el audio de ningún servidor.'

    if (Buffer.isBuffer(audioUrl)) {
      await conn.sendFile(m.chat, audioUrl, `${video.title}.mp3`, '', m)
    } else {

      await conn.sendMessage(m.chat, {
        audio: { url: audioUrl },
        mimetype: 'audio/mpeg',
        fileName: `${video.title}.mp3`
      }, { quoted: m })
    }

    await m.react('✔️')

  } catch (e) {
    conn.reply(m.chat, ` Error:\n${e}`, m)
  }
}

handler.command = ['play', 'mp3', 'audio']
handler.tags = ['download']
handler.help = ['play + <query/url>']
handler.group = true
export default handler