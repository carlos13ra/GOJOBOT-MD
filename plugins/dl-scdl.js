import fetch from "node-fetch"
import jimp from "jimp"

const qualities = [
  '64',
  '96',
  '128',
  '160',
  '192',
  '224',
  '256',
  '320'
]

const fandoms = [
  '🌱 ძᥱsᥴᥲrgᥲᥒძ᥆ ᥲᥙძі᥆ ᥴᥲᥙsᥲ...',
  '🍃 ᥱs⍴ᥱrᥲ ᥙᥒ m᥆mᥱᥒ𝗍᥆ ᥴᥲᥙsᥲ...',
  '🎧 ᥴᥲrgᥲᥒძ᥆ 𝗍ᥙ ᥲᥙძі᥆...',
  '🌴 ᥴ᥆ᥒsіgᥙіᥱᥒძ᥆ ᥣᥲ mᥙsіᥴᥲ...',
  '🍄 ძᥱsᥴᥲrgᥲ ᥱᥒ ⍴r᥆ᥴᥱs᥆...',
  '💿 ᥆ᑲ𝗍ᥱᥒіᥱᥒძ᥆ ᥱᥣ ᥲᥙძі᥆...'
]

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

    const quality =
      qualities.find(v =>
        text.includes(v)
      ) ||
      qualities[
        Math.floor(
          Math.random() *
          qualities.length
        )
      ]

    await m.react("🕒")

    const fandom =
      fandoms[
        Math.floor(
          Math.random() *
          fandoms.length
        )
      ]

    m.reply(`*${fandom}*`)

    const api =
      `https://api--shadowcorexyz.replit.app/download/soundcloud/v2?url=${encodeURIComponent(text)}&quality=${quality}`

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
> 💿 *Calidad:* ${quality}kbps
> 📦 *Peso:* ${data.size}
> 🎵 *Formato:* ${data.format}
> 🔗 *Source:* ${data.source}`

    await conn.sendMessage(
      m.chat,
      {
        document: {
          url: data.download
        },

        mimetype: "audio/mpeg",

        fileName:
          data.filename ||
          `${data.title}.mp3`,

        caption,

        jpegThumbnail: thumbDoc
      },
      { quoted: m }
    )

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