import fetch from 'node-fetch'

const apis = [
  'https://api.waifu.im/search?included_tags=waifu&is_nsfw=true',
  'https://api.waifu.im/search?included_tags=hentai&is_nsfw=true'
]

const handler = async (m, { conn }) => {
  try {
    let image = null

    for (const api of apis) {
      try {
        const res = await fetch(api)
        const json = await res.json()

        if (json.images && json.images.length > 0) {
          image = json.images[0].url
          break
        }
      } catch {}
    }

    if (!image) {
      throw new Error('No se obtuvo ninguna imagen')
    }

    await conn.sendFile(
      m.chat,
      image,
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