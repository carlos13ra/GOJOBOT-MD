import axios from "axios"
import Jimp from "jimp"
import yts from "yt-search"

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
    let videoInfo = null

    // 🔍 TEXTO O URL
    if (!/^(https?:\/\/)/i.test(input)) {
      const search = await yts(input)
      if (!search.videos?.length)
        throw "No se encontraron resultados."

      videoInfo = search.videos[0]
      videoUrl = videoInfo.url
    } else {
      const search = await yts(videoUrl)
      videoInfo = search.videos?.[0]
    }

    // 🎵 API MP3
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

    // 🖼️ MINIATURA (VISIBLE)
    if (videoInfo?.thumbnail) {
      let thumb
      try {
        const img = await Jimp.read(videoInfo.thumbnail)
        img.resize(400, Jimp.AUTO).quality(80)
        thumb = await img.getBufferAsync(Jimp.MIME_JPEG)
      } catch {
        thumb = null
      }

      if (thumb) {
        await conn.sendMessage(
          m.chat,
          {
            image: thumb,
            caption: `🎧 *${result.title}*\n\n⏱ Duración: ${videoInfo.timestamp || "N/A"}`
          },
          { quoted: m }
        )
      }
    }

    // 📄 DOCUMENTO MP3
    await conn.sendMessage(
      m.chat,
      {
        document: { url: result.media.audio },
        mimetype: "audio/mpeg",
        fileName: `${result.title}.mp3`
      },
      { quoted: m }
    )

    await m.react("✅")
  } catch (e) {
    console.error(e)
    await m.react("❌")
    conn.reply(
      m.chat,
      `❌ *Error al descargar el audio*`,
      m
    )
  }
}

handler.help = ["ytmp3doc <texto|url>"]
handler.tags = ["downloader"]
handler.command = ["ytmp3doc"]

export default handler