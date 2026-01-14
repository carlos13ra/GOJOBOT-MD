import axios from "axios"

let handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    if (!text?.trim())
      return conn.reply(
        m.chat,
        `📌 Ingresa el nombre de la canción o un enlace de YouTube.\n\n> Ejemplo: ${usedPrefix + command} DJ Malam Pagi`,
        m
      )

    await m.react("🎶")
    const url = text.trim()

    const { data } = await axios.post(
      "https://api-sky.ultraplus.click/youtube-mp3",
      { url },
      {
        headers: {
          "Content-Type": "application/json",
          apikey: "Shadow"
        }
      }
    )

    if (!data.status) throw "No se pudo obtener el audio."

    const res = data.result
    const audioUrl = res.media.audio
    await conn.sendMessage(
      m.chat,
      {
        audio: { url: audioUrl },
        mimetype: "audio/mpeg",
        fileName: `${res.title}.mp3`
      },
      { quoted: m }
    )

    await m.react("✅")
  } catch (e) {
    console.error(e)
    await m.react("❌")
    conn.reply(
      m.chat,
      `❌ *Error al descargar el audio*\n\nIntenta con otro enlace.`,
      m
    )
  }
}

handler.help = ["ytmp3 <url>"]
handler.tags = ["downloader"]
handler.command = ["ytmp3"]

export default handler