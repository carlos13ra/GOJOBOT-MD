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
 
    const songRes = await fetch(
      `https://spotdown.org/api/song-details?url=${encodeURIComponent(spotifyUrl)}`,
      {
        headers: {
          Accept: 'application/json, text/plain, */*'
        }
      }
    )

    if (!songRes.ok) throw 'Error al obtener datos de descarga.'

    const songData = await songRes.json()
    if (!songData.songs?.length) throw 'No se pudo procesar la canción.'

    const song = songData.songs[0]

    const downloadRes = await fetch('https://spotdown.org/api/download', {
      method: 'POST',
      headers: {
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url: song.url })
    })

    if (!downloadRes.ok || !downloadRes.body)
      throw 'Error al descargar el audio.'

    const buffer = await downloadRes.buffer()
  
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
            body: '✿ Servidor: SpotDown',
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
