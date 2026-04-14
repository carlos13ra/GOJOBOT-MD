import axios from 'axios'
import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
  if (!text)
    return conn.reply(
      m.chat,
      `🎧 *Ingresa el nombre de la canción (SoundCloud).*`,
      m
    )

  try {
    const api = `${global.APIs.light.url}/api/play/soundcloud?q=${encodeURIComponent(text)}`
    const res = await axios.get(api, { timeout: 20000 })

    if (!res.data.status || !res.data.result)
      throw 'No se encontró la canción.'

    const data = res.data.result
    const {
      title,
      artist,
      duration,
      created,
      plays,
      likes,
      comments,
      genre,
      description,
      image,
      link,
      url
    } = data

    const caption =
      `🎧 *${title}*\n\n` +
      `👤 Artista: ${artist}\n` +
      `⏱ Duración: ${duration}\n` +
      `📅 Creado: ${created}\n` +
      `🎶 Género: ${genre}\n` +
      `▶️ Plays: ${plays}\n` +
      `❤️ Likes: ${likes}\n` +
      `💬 Comentarios: ${comments}\n` +
      `🔗 Link: ${link}`

    await conn.sendMessage(m.chat, {
      image: { url: image },
      caption
    }, { quoted: m })

    const audioRes = await fetch(url)

    if (!audioRes.ok) throw 'Error al descargar el audio.'

    const buffer = await audioRes.buffer()

    await conn.sendMessage(m.chat, {
      audio: buffer,
      mimetype: 'audio/mpeg',
      fileName: `${title}.mp3`,
      ptt: false,
      contextInfo: {
        externalAdReply: {
          title: title,
          body: artist,
          thumbnailUrl: image,
          sourceUrl: link,
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    conn.reply(m.chat, `❌ Error al buscar o descargar en SoundCloud.`, m)
  }
}

handler.help = ['soundcloud']
handler.tags = ['download']
handler.command = ['soundcloud', 'scplay', 'scdl']

export default handler