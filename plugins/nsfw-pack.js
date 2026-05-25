import fetch from 'node-fetch'

const apis = [
  'https://api.waifu.pics/nsfw/waifu',
  'https://api.waifu.im/search?included_tags=waifu'
]

const handler = async (m, { conn }) => {
  try {
    let image = null
    try {
      const res1 = await fetch(apis[0])
      const json1 = await res1.json()

      if (json1.url) {
        image = json1.url
      }
    } catch {}
    if (!image) {
      try {
        const res2 = await fetch(apis[1])
        const json2 = await res2.json()

        if (json2.images && json2.images.length > 0) {
          image = json2.images[0].url
        }
      } catch {}
    }

    if (!image) {
      throw new Error('No se obtuvo ninguna imagen')
    }

    await conn.sendFile(
      m.chat,
      image,
      'pack.jpg',
      '`Aquí tienes tu pack onichan 🥵`',
      m
    )

  } catch (error) {
    console.error(error)
    m.reply('✘ Ocurrió un error al obtener el pack.')
  }
}

handler.command = ['pack2']
handler.tags = ['nsfw']
handler.help = ['pack2']
handler.level = 50
handler.premium = true

export default handler