import axios from "axios"
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

    // TEXTO O URL
    if (!/^(https?:\/\/)/i.test(input)) {
      const search = await yts(input)
      if (!search.videos?.length)
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