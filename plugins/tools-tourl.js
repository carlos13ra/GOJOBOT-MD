import fetch from 'node-fetch'
import FormData from 'form-data'
import path from 'path'

let handler = async (m, { conn, usedPrefix, command }) => {
  const quoted = m.quoted ? m.quoted : m
  const mime = quoted.mimetype || quoted.msg?.mimetype || ''

  if (!/image\/(jpe?g|png|webp)/i.test(mime)) {
    return m.reply(`🥢 Responde a una imagen con ${usedPrefix + command}`)
  }

  try {
    const buffer = await quoted.download()
    const form = new FormData()
    form.append('file', buffer, { 
      filename: `upload_${Date.now()}${path.extname(mime.split('/')[1] || '.png')}`,
      contentType: mime
    })

    const res = await fetch('https://phototourl.com/api/upload', {
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:150.0) Gecko/20100101 Firefox/150.0',
        'Referer': 'https://phototourl.com/',
        'Origin': 'https://phototourl.com',
        'Cookie': 'NEXT_LOCALE=en',
        ...form.getHeaders()
      },
      body: form
    })

    const data = await res.json()
    
    if (!data?.url) throw new Error('No se recibió URL')

    await conn.sendMessage(m.chat, {
      text: `🍜 *Link:*\n${data.url}\n\n🍃 Storage: ${data.storage || 'r2'}\n🥢 Plan: ${data.plan || 'free poble'}`
    }, { quoted: m })
  } catch (err) {
    console.error(err)
    m.reply(`🌵 Error: ${err.message}`)
  }
}

handler.help = ['tourl']
handler.tags = ['tools']
handler.command = ['tourl', 'url']

export default handler