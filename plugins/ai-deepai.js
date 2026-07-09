import { extname } from 'path'
import crypto from 'crypto'
import fetch from 'node-fetch'
import { FormData, Blob } from 'formdata-node'

const AGENT = "Mozilla/5.0 (Linux; Android 8.0; Pixel 2 Build/OPD3.170816.012) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36"
const SALT = "hackers_become_a_little_stinkier_every_time_they_hack"

const md5 = s => crypto.createHash("md5").update(s).digest("hex")
const reverse = s => s.split("").reverse().join("")
const generateRandomIP = () => Array.from({ length: 4 }, () => 1 + Math.floor(Math.random() * 254)).join(".")
const mime = ext => ({ ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp" }[ext.toLowerCase()] || "application/octet-stream")

function genKEY() {
    const r = String(Math.floor(Math.random() * 1e11))
    const h1 = reverse(md5(AGENT + r + SALT))
    const h2 = reverse(md5(AGENT + h1))
    const h3 = reverse(md5(AGENT + h2))
    return `tryit-${r}-${h3}`
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return conn.reply(m.chat, `Por favor ingresa el texto/prompt para editar la imagen.\n\n*Ejemplo:* ${usedPrefix + command} conviértelo en anime`, m)
    let q = m.quoted ? m.quoted : m
    let mimeType = (q.msg || q).mimetype || ''
    if (!/image\/(jest|jpeg|png|webp)/.test(mimeType)) return conn.reply(m.chat, `🥢 Por favor responde o etiqueta una **imagen** con el comando.`, m)

    await m.react('🕒')
    
    try {
        let imgBuffer = await q.download()
        let extension = '.' + mimeType.split('/')[1]
        let filename = `image${extension}`

        let lastError = "Request failed"
        let outputUrl = null
        for (let i = 0; i < 6; i++) {
            const form = new FormData()
            form.append("image", new Blob([imgBuffer], { type: mime(extension) }), filename)
            form.append("text", text)
            form.append("image_generator_version", "standard")

            try {
                const res = await fetch("https://api.deepai.org/api/image-editor", {
                    method: "POST",
                    headers: {
                        accept: "*/*",
                        origin: "https://deepai.org",
                        referer: "https://deepai.org/",
                        "user-agent": AGENT,
                        "api-key": genKEY(),
                        "x-forwarded-for": generateRandomIP()
                    },
                    body: form
                })

                const json = await res.json().catch(() => null)
                if (json?.output_url) {
                    outputUrl = json.output_url
                    break
                }
                lastError = json?.status || `HTTP ${res.status}`
            } catch (e) { 
                lastError = e.message 
            }
        }

        if (!outputUrl) throw new Error(lastError)

        let editedBuffer = await (await fetch(outputUrl)).buffer()
        await conn.sendFile(m.chat, editedBuffer, 'edited.jpg', `🌵 *¡Imagen editada con éxito..\n\n*Prompt:* ${text}`, m)
        await m.react('✔️')

    } catch (error) {
        await conn.reply(m.chat, `⚠︎ Se ha producido un problema al procesar la imagen.\n\n${error.message}`, m)
    }
}

handler.help = ['editia <prompt>']
handler.tags = ['ai', 'tools']
handler.command = ['editimg', 'editia', 'deepai']

export default handler