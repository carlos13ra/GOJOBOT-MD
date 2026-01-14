import axios from "axios"

let handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    if (!text?.trim())
      return conn.reply(
        m.chat,
        `✳️ Uso:\n${usedPrefix + command} <url> [calidad]\n\n📌 Ejemplo:\n${usedPrefix + command} https://youtu.be/O179dcpDiF8 720`,
        m
      )

    await m.react("🎥")

    let args = text.split(" ")
    let url = args[0]
    let quality = args[1] || "360"

    const optionsRes = await axios.post(
      "https://api-sky.ultraplus.click/youtube-mp4",
      { url },
      {
        headers: {
          "Content-Type": "application/json",
          apikey: "Shadow"
        }
      }
    )

    if (!optionsRes.data.status)
      throw "No se pudieron obtener las calidades."

    const info = optionsRes.data.result
    const available = info.options.video.map(v => v.quality)
    if (!available.includes(quality))
      return conn.reply(
        m.chat,
        `🥗 *Calidad no disponible*\n\n📺 Disponibles:\n${available.join(", ")}`,
        m
      )

    const resolveRes = await axios.post(
      "https://api-sky.ultraplus.click/youtube-mp4/resolve",
      {
        url,
        type: "video",
        quality
      },
      {
        headers: {
          "Content-Type": "application/json",
          apikey: "Shadow"
        }
      }
    )

    if (!resolveRes.data.status)
      throw "No se pudo generar el video."

    const media = resolveRes.data.result.media

 
    await conn.sendMessage(
      m.chat,
      {
        video: { url: media.dl_inline || media.dl_download },
        caption: `🌾 ${info.title}\n🌱 ${quality}p`
      },
      { quoted: m }
    )

    await m.react("✅")
  } catch (e) {
    console.error(e)
    await m.react("❌")
    conn.reply(
      m.chat,
      `❌ *Error al descargar el video*\n\nIntenta nuevamente.`,
      m
    )
  }
}

handler.help = ["ytmp4 <url> [calidad]"]
handler.tags = ["downloader"]
handler.command = ["ytmp4"]

export default handler