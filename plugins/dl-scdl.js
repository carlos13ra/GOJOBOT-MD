import fetch from "node-fetch"
import jimp from "jimp"

const handler = async (m, { conn, text }) => {
  try {
    if (!text) {
      return m.reply(
        "🍃 Ingresa un link de SoundCloud"
      )
    }

    const regex =
      /^(https?:\/\/)?(www\.)?(soundcloud\.com)\/.+$/i

    if (!regex.test(text)) {
      return m.reply(
        "✘ Ingresa un link válido de SoundCloud"
      )
    }

    await m.react("🕒")
    m.reply(`*🌱 ძᥱsᥴᥲrgᥲᥒძ᥆ ᥲᥙძі᥆ ᥴᥲᥙsᥲ...*`)
    const api =
      `https://api--shadowcorexyz.replit.app/download/soundcloud/v2?url=${encodeURIComponent(text)}&quality=128`

    const res = await fetch(api)
    const json = await res.json()
    if (!json?.status || !json?.result) {
      throw new Error(
        "No se obtuvo resultado"
      )
    }

    const data = json.result
    let thumbDoc = null

    try {
      const img = await jimp.read(
        data.thumbnail
      )

      img
        .resize(300, jimp.AUTO)
        .quality(70)

      thumbDoc =
        await img.getBufferAsync(
          jimp.MIME_JPEG
        )

    } catch (err) {
      console.log(
        "⚠️ Error miniatura:",
        err.message
      )
    }

    const caption =
`🎧 *SoundCloud Downloader*

> 🌳 *Título:* ${data.title}
> 🍄 *Autor:* ${data.author}
> ⏳ *Duración:* ${data.duration}
> 👁️ *Views:* ${data.views}
> ❤️ *Likes:* ${data.likes}
> 📅 *Upload:* ${data.upload}
> 💿 *Calidad:* ${data.quality}
> 📦 *Peso:* ${data.size}
> 🎵 *Formato:* ${data.format}
> 🔗 *Source:* ${data.source}`
    await conn.sendMessage(m.chat, {
       document: { url: data.download },
       mimetype: "audio/mpeg",
       fileName: data.filename || `${data.title}.mp3`,
        caption,
        jpegThumbnail: thumbDoc
    },
    { quoted: m })

    await m.react("✅")

  } catch (e) {
    m.reply(
`✘ Error:

${e?.message || e}`
    )
  }
}

handler.command = ["scdl2", "sound2"]
handler.help = handler.command
handler.tags = ["download"]

export default handler