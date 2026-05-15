import fetch from 'node-fetch'

const handler = async (m, { conn }) => {
  try {
    const res = await fetch('https://nekobot.xyz/api/image?type=waifu')

    if (!res.ok) {
      throw new Error('No se pudo obtener la imagen')
    }

    const json = await res.json()

    if (!json.message) {
      throw new Error('La API no devolvió imagen')
    }

    await conn.sendFile(
      m.chat,
      json.message,
      'pack.jpg',
      '`Aquí tienes tu pack`',
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
handler.level = 10
handler.register = true
handler.premium = true

export default handler