import axios from "axios"
import Jimp from "jimp"
import yts from "yt-search"

const youtubeRegex =
  /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([a-zA-Z0-9_-]{11})/

let handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    if (!text?.trim())
      return conn.reply(
        m.chat,
        `📌 Ingresa el nombre de la canción o un enlace de YouTube.\n\n> Ejemplo: ${usedPrefix + command} DJ Malam Pagi`,
        m
      )

    await m.react("🎶")

    let url = text.trim()
    let videoUrl = url

    if (!youtubeRegex.test(url)) {
      const search = await yts(url)
      if (!search.videos || !search.videos.length)
        throw "No se encontraron resultados."

      videoUrl = search.videos[0].url
    }

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

    let thumbDoc = null
    try {
      const img = await Jimp.read(result.thumbnail)
      img.resize(300, Jimp.AUTO).quality(70)
      thumbDoc = await img.getBufferAsync(Jimp.MIME_JPEG)
    } catch (err) {
      console.log("⚠️ Error al procesar miniatura:", err.message)
      thumbDoc = Buffer.alloc(0)
    }


    await conn.sendMessage(
      m.chat,
      {
        document: { url: audioUrl },
        mimetype: "audio/mpeg",
        fileName: `${result.title}.mp3`,
        jpegThumbnail: thumbDoc
      },
      { quoted: m }
    )

    await m.react("✅")
  } catch (e) {
    console.error(e)
    await m.react("❌")
    conn.reply(
      m.chat,
      `❌ *Error al descargar el audio*\n\nIntenta con otro enlace o nombre.`,
      m
    )
  }
}

handler.help = ["ytmp3 <texto|url>"]
handler.tags = ["downloader"]
handler.command = ["ytmp3doc"]

export default handler