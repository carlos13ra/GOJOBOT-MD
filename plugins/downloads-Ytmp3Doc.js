import axios from "axios"
import yts from "yt-search"
import fetch from "node-fetch"
import Jimp from "jimp"

let handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    if (!text?.trim()) {
      return conn.reply(
        m.chat,
        `📌 Ingresa el nombre de la canción o un enlace de YouTube.\n\n> Ejemplo: ${usedPrefix + command} Hola`,
        m
      )
    }

    await m.react("🎶")

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

    let result
    try {
      const { data } = await axios.get(
        "https://nexus-light-beryl.vercel.app/download/ytdlV2",
        {
          params: {
            q: videoData.title,
            format: "mp3",
            quality: "128"
          }
        }
      )

      if (!data.status) throw "API principal falló"
      result = data.result
    } catch (e) {
  
      const { data } = await axios.get(-
        "https://nexus-light-beryl.vercel.app/download/ytdl",
        {
          params: {
            url: videoUrl,
            type: "audio",
            quality: "128"
          }
        }
      )

      if (!data.status) throw "API de respaldo falló"
      result = data.result
    }

    const audioUrl = result.dl_url

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

    const fileSize = await getFileSize(audioUrl)

    let thumbDoc = null
    try {
      const img = await Jimp.read(result.thumbnail || videoData.thumbnail)
      img.resize(300, Jimp.AUTO).quality(70)
      thumbDoc = await img.getBufferAsync(Jimp.MIME_JPEG)
    } catch {}

    await conn.sendMessage(
      m.chat,
      {
        document: { url: audioUrl },
        mimetype: "audio/mpeg",
        fileName: `${result.title}.mp3`,
        caption: `> 🌾 \`ᴛɪᴛᴜʟᴏ:\` *${result.title}*
> 🌿 \`ᴛᴀᴍᴀɴ̃ᴏ:\` *${fileSize}*
> 🎧 \`ᴄᴀʟɪᴅᴀᴅ:\` *${result.quality || "128"} kbps*`,
        ...(thumbDoc ? { jpegThumbnail: thumbDoc } : {})
      },
      { quoted: m }
    )

    await m.react("✅")

  } catch (e) {
    console.error(e)
    await m.react("❌")
    conn.reply(m.chat, `❌ *Error al descargar el audio*`, m)
  }
}

handler.help = ["ytmp3doc <texto|url>"]
handler.tags = ["downloader"]
handler.command = ["ytmp3doc"]

export default handler