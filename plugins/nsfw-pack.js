import fetch from 'node-fetch'

const handler = async (m, { conn, usedPrefix }) => {
  try {
    if (!db.data.chats[m.chat].nsfw && m.isGroup) {
      return m.reply(`ꕥ El contenido *NSFW* está desactivado en este grupo.\n\nUn *administrador* puede activarlo con:\n» *${usedPrefix}nsfw on*`)
    }

    await m.react('🕒')
    const res = await fetch(`${global.APIs.light.url}/random/nsfw/waifu?nsfw=true`)
    const json = await res.json()

    if (!json.status || !json.result) {
      throw new Error('No se obtuvo ninguna imagen')
    }

    const imageUrl = json.result

    await conn.sendFile(
      m.chat,
      imageUrl,
      'nsfw.jpg',
      '`Aquí tienes tu pack onichan 🥵`',
      m
    )

    await m.react('✔️')

  } catch (error) {
    await m.react('✖️')
    m.reply(`✘ Ocurrió un error al obtener la imagen NSFW.\n\n${error.message}`)
  }
}

handler.command = ['pack']
handler.tags = ['nsfw']
handler.help = ['pack']
handler.level = 50
handler.premium = true

export default handler