import fetch from 'node-fetch'

const handler = async (m, { conn }) => {
  try {
    const res = await fetch('https://nexus-light.onrender.com/random/nsfw/waifu?nsfw=true')
    const json = await res.json()

    if (!json.status || !json.result) {
      throw new Error('No se obtuvo ninguna imagen')
    }

    await conn.sendFile(
      m.chat,
      json.result,
      'nsfw.jpg',
      '`Aquí tienes tu pack onichan 🥵`',
      m
    )

  } catch (error) {
    console.error(error)
    m.reply('✘ Ocurrió un error al obtener la imagen NSFW.')
  }
}

handler.command = ['pack']
handler.tags = ['nsfw']
handler.help = ['pack']
handler.level = 50
handler.premium = true
handler.nsfw = true

export default handler