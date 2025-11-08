import fetch from "node-fetch"

function formatSize(bytes) {
  if (bytes === 0 || isNaN(bytes)) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    if (!text?.trim()) {
      return conn.reply(
        m.chat,
        `🎋 *Ingresa el enlace del video de YouTube que deseas descargar.*\n\nEjemplo:\n${usedPrefix + command} https://youtu.be/HWjCStB6k4o`,
        m
      )
    }

    await m.react('🕒')
    await conn.reply(m.chat, '*_👻 Descargando tu video onichan_*', m)

    const apiUrl = `https://api-shadowxyz.vercel.app/download/ytmp4V2?url=${encodeURIComponent(text)}`
    const response = await fetch(apiUrl)
    if (!response.ok) throw `No se pudo obtener información del video.`

    const data = await response.json()
    const res = data.result
    if (!res?.download_url) throw `No se pudo obtener el enlace de descarga.`

    const head = await fetch(res.download_url, { method: "HEAD" })
    const size = Number(head.headers.get("content-length") || 0)
    const sizeMB = size / 1024 / 1024

    let caption = `🍃 *Título:* ${res.title}
🕒 *Duración:* ${res.duration}
📺 *Enlace:* ${res.youtube_url}
💾 *Tamaño:* ${formatSize(size)}
────────────────────
✨ *Descarga Completa...*`

    let sendType = sizeMB > 100 ? "document" : "video"

    await conn.sendMessage(m.chat, {
      [sendType]: { url: res.download_url },
      mimetype: "video/mp4",
      fileName: `${res.title}.mp4`,
      caption,
      thumbnail: res.thumbnail ? await (await fetch(res.thumbnail)).buffer() : null
    }, { quoted: m })

    await m.react('✔️')

  } catch (e) {
    console.error(e)
    conn.reply(m.chat, `*Ocurrió un error:*\n${e}`, m)
  }
}

handler.help = ["ytmp4 <url>"]
handler.tags = ["download"]
handler.command = ["ytmp4", "playmp4"]
handler.group = true

export default handler