import yts from 'yt-search'
import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    if (!text?.trim())
      return conn.reply(
        m.chat,
        `🌱 Ingresa el nombre del video a buscar.\n\n> Ejemplo: ${usedPrefix + command} Rick Astley`,
        m
      )

    const search = await yts(text)
    const video = search.videos[0]
    if (!video) return conn.reply(m.chat, '❌ No se encontraron resultados.', m)

    const { title, duration, author, ago, url, views, thumbnail } = video

    const caption =
      `*🎵 Título:* ${title}\n` +
      `*⏱ Duración:* ${duration}\n` +
      `*📺 Canal:* ${author.name}\n` +
      `*📅 Publicado:* ${ago}\n` +
      `*👀 Vistas:* ${views.toLocaleString()}\n` +
      `*🔗 Link:* ${url}\n\n` +
      `🌱 Descargando audio...`

    await conn.sendMessage(
      m.chat,
      { image: { url: thumbnail }, caption },
      { quoted: m }
    )

    const apiUrl = `https://nexus-light-beryl.vercel.app/download/ytaudio?url=${encodeURIComponent(url)}`
    const res = await fetch(apiUrl)
    const json = await res.json()

    if (!json.status)
      return conn.reply(m.chat, '❌ No se pudo descargar el audio.', m)

    const audioUrl = json.data.download

    await conn.sendMessage(
      m.chat,
      {
        audio: { url: audioUrl },
        mimetype: 'audio/mpeg',
        fileName: `${json.data.title}.mp3`
      },
      { quoted: m }
    )

  } catch (e) {
    console.error(e)
    conn.reply(m.chat, '⚠️ Error al buscar o descargar el audio.', m)
  }
}

handler.help = ['ytmp3 <texto>']
handler.tags = ['download']
handler.command = ['ytmp3']

export default handler