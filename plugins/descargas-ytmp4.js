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
      `*🎬 Título:* ${title}\n` +
      `*⏱ Duración:* ${duration}\n` +
      `*📺 Canal:* ${author.name}\n` +
      `*📅 Publicado:* ${ago}\n` +
      `*👀 Vistas:* ${views.toLocaleString()}\n` +
      `*🔗 Link:* ${url}\n\n` +
      `🌱 Descargando video...`

    await conn.sendMessage(
      m.chat,
      { image: { url: thumbnail }, caption },
      { quoted: m }
    )

    const apiUrl = `https://api-yume.vercel.app/download/ytmp4v2?url=${encodeURIComponent(url)}`
    const res = await fetch(apiUrl)
    const json = await res.json()

    if (!json.status)
      return conn.reply(m.chat, '❌ No se pudo descargar el video.', m)

    const videoUrl = json.data.dl_url
    const safeTitle = json.data.title.replace(/[\\/:"*?<>|]/g, '')

    const head = await fetch(videoUrl, { method: 'HEAD' })
    const contentLength = head.headers.get('content-length')
    const sizeMB = contentLength ? Number(contentLength) / 1024 / 1024 : 0

    if (sizeMB > 100) {
    
      await conn.sendMessage(
        m.chat,
        {
          document: { url: videoUrl },
          mimetype: 'video/mp4',
          fileName: safeTitle,
          caption: `💣 *${title}*\n🌿 Video grande (${sizeMB.toFixed(2)} MB)\n📺 Calidad: ${json.data.quality}`
        },
        { quoted: m }
      )
    } else {
      // 🎥 Video normal
      await conn.sendMessage(
        m.chat,
        {
          video: { url: videoUrl },
          mimetype: 'video/mp4',
          fileName: safeTitle,
          caption: `💣 *${title}*\n📺 Calidad: ${json.data.quality}`
        },
        { quoted: m }
      )
    }

  } catch (e) {
    console.error(e)
    conn.reply(m.chat, '⚠️ Ocurrió un error al buscar o descargar el video.', m)
  }
}

handler.help = ['ytmp4 <texto>']
handler.tags = ['download']
handler.command = ['ytmp4']

export default handler