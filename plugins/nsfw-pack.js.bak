import fetch from 'node-fetch'

const apis = [
  {
    url: 'https://nexus-light.onrender.com/random/nsfw/waifu',
    type: 'direct'
  },
  {
    url: 'https://nexus-light.onrender.com/nsfw/hentai',
    type: 'nested'
  },
  {
    url: 'https://nexus-light.onrender.com/nsfw/yuri',
    type: 'nested'
  }
]

const handler = async (m, { conn }) => {
  try {
    let image = null

    for (const api of apis) {
      try {
        const res = await fetch(api.url)
        const json = await res.json()

        if (json.status) {
          image = api.type === 'direct' ? json.result : json.result.url
          if (image) break
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