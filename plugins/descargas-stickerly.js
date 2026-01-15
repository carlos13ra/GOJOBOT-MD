/*import fetch from "node-fetch"
import { sticker } from "../lib/sticker.js"

const API_STICKERLY = "https://delirius-apiofc.vercel.app/download/stickerly"

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) {
    return m.reply(`📌 Ingresa la URL de un pack de *Stickerly*.\n\n🔗 Ejemplo:\n> ${usedPrefix + command} https://sticker.ly/s/4I2FC0`)
  }

  try {
    let url = `${API_STICKERLY}?url=${encodeURIComponent(args[0])}`
    let res = await fetch(url)
    if (!res.ok) throw new Error(`❌ Error al conectar con la API (${res.status})`)
    let json = await res.json()

    if (!json.status || !json.data || !json.data.stickers) {
      throw "⚠️ No se pudo obtener el pack. Verifica el enlace."
    }

    let data = json.data

    let info = `
╭━━━〔 🌐 *STICKERLY PACK* 🌐 〕━━⬣
┃ 📢 *Nombre:* ${data.name}
┃ 👤 *Autor:* ${data.author}
┃ 📦 *Stickers:* ${data.total}
┃ 👀 *Vistas:* ${data.viewCount}
┃ 📤 *Exportados:* ${data.exportCount}
┃ 🎭 *Animado:* ${data.isAnimated ? "Sí" : "No"}
┃ 🔗 *Pack:* ${data.url}
╰━━━━━━━━━━━━━━━━━━⬣
👥 *Usuario:* ${data.username}
👤 *Followers:* ${data.followers}
    `.trim()

    await conn.sendMessage(m.chat, {
      text: info,
      contextInfo: {
        externalAdReply: {
          title: `${data.name}`,
          body: `👤 Autor: ${data.author || "Desconocido"} • ${data.total} stickers`,
          thumbnailUrl: data.preview,
          sourceUrl: data.url,
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m })

    for (let stick of data.stickers) {
      try {
        let img = await fetch(stick)
        let buffer = await img.buffer()
        let stiker = await sticker(buffer, false, global.packsticker, global.packsticker2)
        await conn.sendFile(m.chat, stiker, "sticker.webp", "", m, { asSticker: true })
      } catch (e) {
        console.log("⚠️ Error en un sticker:", e)
      }
    }

    await m.react("✅")

  } catch (e) {
    console.error(e)
    m.reply("❌ Error al descargar los stickers del pack.")
  }
}

handler.help = ["stickerlydl <url>"]
handler.tags = ["sticker", "download"]
handler.command = ["stickerlydl", "stickerpack", "dls"]

export default handler*/


import fetch from "node-fetch"
import { sticker } from "../lib/sticker.js"

const API_STICKERLY = `${global.APIs.delirius.url}/download/stickerly`

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0])
    return m.reply(
      `🌾 Ingresa la URL de un pack de *Stickerly*.\n\n🌱 Ejemplo:\n> ${usedPrefix + command} https://sticker.ly/s/4I2FC0`
    )

  await m.react("🕓")

  try {
    const res = await fetch(`${API_STICKERLY}?url=${encodeURIComponent(args[0])}`)
    if (!res.ok) throw "Error API"

    const json = await res.json()
    if (!json.status || !json.data?.stickers?.length)
      throw "Pack inválido"

    const data = json.data

    const info = `
🌱 test
`.trim()

    await conn.sendMessage(
      m.chat,
      {
        text: info,
        contextInfo: {
          externalAdReply: {
            title: data.name,
            body: `🍃 ${data.total} stickers`,
            thumbnailUrl: data.preview,
            sourceUrl: data.url,
            mediaType: 1,
            renderLargerThumbnail: true,
          },
        },
      },
      { quoted: m }
    )

    let success = 0
    let failed = 0

 
    const BATCH_SIZE = 8
    const DELAY = 100   

    for (let i = 0; i < data.stickers.length; i += BATCH_SIZE) {
      const batch = data.stickers.slice(i, i + BATCH_SIZE)

      await Promise.all(
        batch.map(async (url) => {
          try {
            const r = await fetch(url)
            if (!r.ok) throw 0

            const buf = Buffer.from(await r.arrayBuffer())
            const st = await sticker(buf, false, data.name, data.author)

            await conn.sendMessage(
              m.chat,
              { sticker: st },
              { quoted: m }
            )

            success++
          } catch {
            failed++
          }
        })
      )

      await new Promise(r => setTimeout(r, DELAY))
    }

 

  } catch (e) {
    console.error(e)
    await m.react("❌")
    m.reply("⚠️ Error al descargar el pack.")
  }
}

handler.help = ["stickerlydl <url>"]
handler.tags = ["sticker", "download"]
handler.command = ["stickerlydl", "stickerpack", "dls"]
handler.group = true

export default handler