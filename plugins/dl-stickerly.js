import fetch from "node-fetch"
import { sticker } from "../lib/sticker.js"

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) {
    return m.reply(
      `✰ Ingresa la URL de un pack de *Stickerly*.\n\n` +
      `❀ Ejemplo:\n> ${usedPrefix + command} https://sticker.ly/s/4I2FC0`
    )
  }

  try {
    const res = await fetch(`${global.APIs.delirius.url}/download/stickerly?url=${encodeURIComponent(args[0])}`)
    if (!res.ok) throw new Error(`ꕥ Error API (${res.status})`)

    const json = await res.json()
    if (!json.status || !json.data?.stickers?.length)
      throw "No se pudo obtener el pack."

    const data = json.data

    const info = `  *￼ STICKERLY - DOWNLOAD ᩔ*

*» Nombre :* ${data.name}
*» Author :* ${data.author}
*» Usuario :* ${data.username}
*» Followers :* ${data.followers}
*» Stickers :* ${data.total}
*» Vistas :* ${data.viewCount}
*» Exportados :* ${data.exportCount}
*» Animado :* ${data.isAnimated ? "Sí" : "No"}
*» Link :* ${data.url}`.trim()

    await conn.sendMessage(
      m.chat,
      {
        text: info,
        contextInfo: {
          externalAdReply: {
            title: data.name,
            body: `ꕥ Autor: ${data.author} • ${data.total} stickers`,
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
        await new Promise(r => setTimeout(r, 200))
      } catch (e) {
        console.log("Error en un sticker:", e.message)
      }
    }

    await m.react("✅")
  } catch (e) {
    console.error(e)
    m.reply("ꕥ Error al descargar los stickers del pack.")
  }
}

handler.help = ["stickerlydl *« url »*"]
handler.tags = ["sticker", "download"]
handler.command = ["stickerlydl", "stickerpack", "dls"]

export default handler