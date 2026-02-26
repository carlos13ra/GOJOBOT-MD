import axios from 'axios'
import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
  if (!text)
    return conn.reply(
      m.chat,
      `🎋 *Por favor, proporciona el nombre de una canción o artista.*`,
      m
    )

  try {
    const searchUrl = `${global.APIs.delirius.url}/search/spotify?q=${encodeURIComponent(text)}&limit=1`
    const search = await axios.get(searchUrl, { timeout: 15000 })

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
      `「🌳」Descargando *<${title}>*\n\n` +
      `> 🍄 Autor » *${artist}*\n` +
      (album ? `> 🌾 Álbum » *${album}*\n` : '') +
      (duration ? `> 🎍 Duración » *${duration}*\n` : '') +
      (popularity ? `> 🎅 Popularidad » *${popularity}*\n` : '') +
      (publish ? `> 🌿 Publicado » *${publish}*\n` : '') +
      `> ☕ Enlace » ${spotifyUrl}`

    await conn.sendMessage(
      m.chat,
      {
        text: caption,
        contextInfo: {
          externalAdReply: {
            title: '🎇 ✧ Spotify • Music ✧ 🎇',
            body: artist,
            thumbnailUrl: image,
            sourceUrl: spotifyUrl,
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      },
      { quoted: m }
    )

    const apiDownload = `https://nexus-light-beryl.vercel.app/download/spotify?url=${encodeURIComponent(spotifyUrl)}`
    const dlRes = await axios.get(apiDownload, { timeout: 20000 })

    if (!dlRes.data.status || !dlRes.data.result?.download_url)
      throw 'No se pudo obtener el enlace de descarga.'

    const { download_url } = dlRes.data.result

    const audioRes = await fetch(download_url)
    if (!audioRes.ok) throw 'Error al descargar el audio.'

    const buffer = await audioRes.buffer()

    await conn.sendMessage(
      m.chat,
      {
        audio: buffer,
        mimetype: 'audio/mpeg',
        fileName: `${title}.mp3`,
        ptt: false,
        contextInfo: {
          externalAdReply: {
            title: title,
            body: '✿ Servidor: Nexus Light',
            thumbnailUrl: image,
            sourceUrl: spotifyUrl,
            mediaType: 1,
            renderLargerThumbnail: false
          }
        }
      },
      { quoted: m }
    )

  } catch (e) {
    console.error(e)
    conn.reply(
      m.chat,
      `☕ Error al buscar o descargar la canción.`,
      m
    )
  }
}

handler.help = ['spotify']
handler.tags = ['download']
handler.command = ['spotify', 'splay']
handler.group = true
handler.register = true

export default handler