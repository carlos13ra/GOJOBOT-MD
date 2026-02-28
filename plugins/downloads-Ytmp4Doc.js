import axios from "axios"
import yts from "yt-search"
import fetch from "node-fetch"
import Jimp from "jimp"

let handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    if (!text?.trim()) {
      return conn.reply(
        m.chat,
        `📌 Ingresa el nombre del video o un enlace de YouTube.\n\n> Ejemplo: ${usedPrefix + command} Hola remix`,
        m
      )
    }

    await m.react("🎬")

    let input = text.trim()
    let videoData
    let videoUrl

    if (!/^https?:\/\//i.test(input)) {
      const search = await yts(input)
      if (!search.videos?.length) throw "No se encontraron resultados."
      videoData = search.videos[0]
      videoUrl = videoData.url
    } else {
      const search = await yts(input)
      videoData = search.videos?.[0]
      videoUrl = input
    }

    if (!videoData) throw "No se pudo obtener info del video."

    const { data } = await axios.get(
      "https://nexus-light-beryl.vercel.app/download/ytvideo",
      {
        params: {
          url: videoUrl
        }
      }
    )

    if (!data.status) throw "API falló"

    const result = data.result
    const videoDl = result.download

    const getFileSize = async (url) => {
      try {
        const res = await fetch(url, { method: "HEAD" })
        const size = res.headers.get("content-length")
        if (!size) return "Desconocido"
        return `${(Number(size) / 1024 / 1024).toFixed(2)} MB`
      } catch {
        return "Desconocido"
      }
    }

    const fileSize = await getFileSize(videoDl)

    let thumbDoc = null
    try {
      const img = await Jimp.read(videoData.thumbnail)
      img.resize(300, Jimp.AUTO).quality(70)
      thumbDoc = await img.getBufferAsync(Jimp.MIME_JPEG)
    } catch {}

    await conn.sendMessage(
      m.chat,
      {
        document: { url: videoDl },
        mimetype: "video/mp4",
        fileName: `${result.title}.mp4`,
        caption: `> 🎬 \`ᴛɪᴛᴜʟᴏ:\` *${result.title}*
> ⏱️ \`ᴅᴜʀᴀᴄɪᴏ́ɴ:\` *${videoData.timestamp}*
> 📦 \`ᴛᴀᴍᴀɴ̃ᴏ:\` *${fileSize}*
> 📺 \`ᴄᴀʟɪᴅᴀᴅ:\` *${result.quality || "360p"}*`,
        ...(thumbDoc ? { jpegThumbnail: thumbDoc } : {})
      },
      { quoted: m }
    )

    await m.react("✅")

  } catch (e) {
    console.error(e)
    await m.react("❌")
    conn.reply(m.chat, `❌ *Error al descargar el video*`, m)
  }
}

handler.help = ["ytmp4doc <texto|url>"]
handler.tags = ["downloader"]
handler.command = ["ytmp4doc"]

export default handler