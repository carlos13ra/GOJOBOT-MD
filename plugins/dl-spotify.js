import axios from 'axios'
import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
  if (!text)
    return conn.reply(m.chat, `ꕥ *Por favor, proporciona el nombre de una canción o artista.*`, m)

  try {
    const searchUrl = `${global.APIs.delirius.url}/search/spotify?q=${encodeURIComponent(text)}&limit=1`
    const search = await axios.get(searchUrl, { timeout: 2000 })

    if (!search.data.status || !search.data.data?.length)
      throw 'No se encontró la canción.'

    const data = search.data.data[0]
    const {
      title,
      artist,
      album,
      duration,
      popularity,
      publish,
      url: spotifyUrl,
      image
    } = data

    const caption =
      `✰ Descargando *<${title}>*\n\n` +
      `> • Autor » *${artist}*\n` +
      (album ? `> • Álbum » *${album}*\n` : '') +
      (duration ? `> • Duración » *${duration}*\n` : '') +
      (popularity ? `> • Popularidad » *${popularity}*\n` : '') +
      (publish ? `> • Publicado » *${publish}*\n` : '') +
      `> • Enlace » ${spotifyUrl}`

    const linkPreview = image ? (await gojo({ image: { url: image }}, { upload: conn.waUploadToServer, mediaTypeOverride: 'thumbnail-link' }).then(({ imageMessage }) => ({ 
      'canonical-url': spotifyUrl, 
      'matched-text': spotifyUrl, 
      title: `✧ Spotify • Music ✧`, 
      description: `🍡 ${artist}`, 
      jpegThumbnail: imageMessage?.jpegThumbnail ? Buffer.from(imageMessage.jpegThumbnail) : undefined, 
      highQualityThumbnail: imageMessage || undefined 
    }))) : undefined

    await conn.sendMessage(m.chat, {
      text: caption.trim(),
      linkPreview,
      contextInfo: {
        mentionedJid: [m.sender],
        isForwarded: true
      }
    }, { quoted: m })

    const apis = [
      {
        url: `${global.APIs.light.url}/download/spotify/v3?url=${encodeURIComponent(spotifyUrl)}`,
        getDl: (d) => d.data?.dl
      },
      {
        url: `${global.APIs.light.url}/download/spotify/v2?url=${encodeURIComponent(spotifyUrl)}`,
        getDl: (d) => d.data?.dl
      },
      {
        url: `${global.APIs.light.url}/download/spotify?url=${encodeURIComponent(spotifyUrl)}`,
        getDl: (d) => d.data?.download
      }
    ]

    let download_url = null
    let lastError = 'Todas las APIs fallaron'

    for (const api of apis) {
      try {
        const dlRes = await axios.get(api.url, { timeout: 5000 })
        const dl = api.getDl(dlRes.data)
        if (dlRes.data.status && dl) {
          download_url = dl
          break
        }
      } catch (e) {
        lastError = e.message
        continue
      }
    }

    if (!download_url) throw lastError

    const audioRes = await fetch(download_url)
    if (!audioRes.ok) throw 'Error al descargar el audio.'

    const buffer = await audioRes.buffer()

    await conn.sendMessage(m.chat, { 
      audio: buffer, 
      mimetype: 'audio/mpeg', 
      fileName: `${title}.mp3` 
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    conn.reply(m.chat, `> 🍜 Error al buscar o descargar la canción.`, m)
  }
}

handler.help = ['spotify *« query/url »*']
handler.tags = ['download']
handler.command = ['spotify', 'splay', 'spdl']
handler.group = true

export default handler