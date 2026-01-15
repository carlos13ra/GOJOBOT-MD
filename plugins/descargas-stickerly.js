import fetch from "node-fetch"
import { sticker } from "../lib/sticker.js"

const API_STICKERLY = `https://api.delirius.store/download/stickerly`

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) {
    return m.reply(
      `📌 Ingresa la URL de un pack de *Stickerly*.\n\n` +
      `🔗 Ejemplo:\n> ${usedPrefix + command} https://sticker.ly/s/4I2FC0`
    )
  }

  try {
    const res = await fetch(`${API_STICKERLY}?url=${encodeURIComponent(args[0])}`)
    if (!res.ok) throw new Error(`❌ Error API (${res.status})`)

    const json = await res.json()
    if (!json.status || !json.data?.stickers?.length)
      throw "⚠️ No se pudo obtener el pack."

    const data = json.data

    const info = `
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

    await conn.sendMessage(
      m.chat,
      {
        text: info,
        contextInfo: {
          externalAdReply: {
            title: data.name,
            body: `👤 Autor: ${data.author} • ${data.total} stickers`,
            thumbnailUrl: data.preview,
            sourceUrl: data.url,
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      },
      { quoted: m }
    )

    for (const stickUrl of data.stickers) {
      try {
        const img = await fetch(stickUrl)
        const buffer = Buffer.from(await img.arrayBuffer())
        const st = await sticker(
          buffer,
          false,
          global.packsticker || data.name,
          global.packsticker2 || data.author
        )

        await conn.sendMessage(m.chat, { sticker: st })
        await new Promise(r => setTimeout(r, 200)) // velocidad controlada
      } catch (e) {
        console.log("⚠️ Error en un sticker:", e.message)
      }
    }

    await m.react("✅")
  } catch (e) {
    console.error(e)
    await m.react("❌")
    m.reply("❌ Error al descargar los stickers del pack.")
  }
}

handler.help = ["stickerlydl <url>"]
handler.tags = ["sticker", "download"]
handler.command = ["stickerlydl", "stickerpack", "dls"]

export default handler