import axios from "axios"
import yts from "yt-search"
import fetch from "node-fetch"
import Jimp from "jimp"

let handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    if (!text?.trim())
      return conn.reply(
        m.chat,
        `📌 Ingresa el nombre de la canción o un enlace de YouTube.\n\n> Ejemplo: ${usedPrefix + command} DJ Malam Pagi`,
        m
      )

    await m.react("🎶")

    let input = text.trim()
    let videoUrl = input
    let videoData = null

    if (!/^(https?:\/\/)/i.test(input)) {
      const search = await yts(input)
      if (!search.videos?.length)
        throw "No se encontraron resultados."

      videoData = search.videos[0]
      videoUrl = videoData.url
    } else {
      const search = await yts(videoUrl)
      videoData = search.videos?.[0]
    }

    if (!videoData) throw "No se pudo obtener información del video."

    const { data } = await axios.post(
      "https://api-sky.ultraplus.click/youtube-mp3",
      { url: videoUrl },
      {
        headers: {
          "Content-Type": "application/json",
          apikey: "Shadow"
        }
      }
    )

    if (!data.status) throw "No se pudo obtener el audio."

    const result = data.result
    const audioUrl = result.media.audio

    const getFileSize = async (url) => {
      try {
        const head = await fetch(url, { method: "HEAD" })
        const size = head.headers.get("content-length")
        if (!size) return "Desconocido"
        return `${(Number(size) / 1024 / 1024).toFixed(2)} MB`
      } catch {
        return "Desconocido"
      }
    }

    const fileSize = await getFileSize(audioUrl)

    let thumbDoc = null
    try {
      const img = await Jimp.read(videoData.thumbnail)
      img.resize(300, Jimp.AUTO).quality(70)
      thumbDoc = await img.getBufferAsync(Jimp.MIME_JPEG)
    } catch {
      thumbDoc = null
    }

    await conn.sendMessage(
      m.chat,
      {
        document: { url: audioUrl },
        mimetype: "audio/mpeg",
        fileName: `${result.title}.mp3`,
        caption: `> 🌾 \`ᴛɪᴛᴜʟᴏ:\` *${result.title}*
> 🌿 \`ᴛᴀᴍᴀɴ̃ᴏ:\` *${fileSize}*`,
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