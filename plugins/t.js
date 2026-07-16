const BASE_URL = "https://api.kyzzz.eu.cc"
const API_KEY = "ambil_sendiri"

let handler = async (m, { conn, usedPrefix, command }) => {
    const q = m.quoted || m
    const mime = (q.msg || q).mimetype || ""

    if (!/image/i.test(mime)) {
        return m.reply(
            `Reply atau kirim gambar dengan caption:\n${usedPrefix + command}`
        )
    }

    try {
        await m.reply("⏳ Processing...")

        const buffer = await q.download()

        const form = new FormData()
        form.append(
            "image",
            new Blob([buffer], { type: mime }),
            "image.jpg"
        )

        const res = await fetch(
            `${BASE_URL}/api/ai-image/toanime?apikey=${API_KEY}`,
            {
                method: "POST",
                body: form
            }
        )

        if (!res.ok) {
            throw new Error(await res.text())
        }

        const result = Buffer.from(await res.arrayBuffer())

        await conn.sendMessage(
            m.chat,
            {
                image: result,
                caption: "✨ Done"
            },
            { quoted: m }
        )

    } catch (e) {
        console.error(e)
        m.reply(`❌ ${e.message}`)
    }
}

handler.help = ["toanime"]
handler.tags = ["image"]
handler.command = /^(toanime|animefy)$/i
handler.limit = true
handler.register = true

export default handler