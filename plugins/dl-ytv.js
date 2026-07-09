import fetch from "node-fetch"

let handler = async (m, { conn, text, command }) => {
  try {
    if (!text?.trim()) {
      return conn.reply(
        m.chat,
        `《✧》Por favor, proporciona la URL del video de YouTube.`,
        m
      )
    }

    const qualities = ["144p", "240p", "360p", "480p", "720p", "1080p"]
    const randomQuality = qualities[Math.floor(Math.random() * qualities.length)]
    
    const api = `${global.APIs.light.url}/download/ytmp4?url=${encodeURIComponent(text.trim())}&quality=${randomQuality}`
    const res = await fetch(api)
    const json = await res.json()
    
    if (!json.status || !json.data?.dl) {
      throw "¡Ups! No se pudo obtener el enlace de descarga de este video."
    }

    const videoUrl = json.data.dl
    const title = json.data.title || "video"
    const duration = json.data.duration || "Desconocida"
    
    await conn.sendFile(
      m.chat, 
      videoUrl, 
      `${title}.mp4`, 
      `🥢 \`Aquí tienes tu vídeo,\`\n🌵 *Título:* ${title}\n🍜 *Calidad:* ${randomQuality}\n🫒 *Duración*: ${duration}s\n🍃 *Canal*: ${json.data.channel}`, 
      m
    )

    await m.react("✅")

  } catch (e) {
    console.error(e)
    conn.reply(m.chat, `Ocurrió un error:\n${e}`, m)
  }
}

handler.command = ["ytmp4"]
handler.tags = ["downloader"]
handler.help = ["ytmp4 + <url>"]
handler.group = true

export default handler