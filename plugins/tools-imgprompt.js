import fetch from 'node-fetch'
import FormData from 'form-data'
import path from 'path'
import axios from 'axios'

let handler = async (m, { conn, usedPrefix, command }) => {
  const quoted = m.quoted ? m.quoted : m
  const mime = quoted.mimetype || ''

  if (!/image\/(jpe?g|png|webp)/i.test(mime)) {
    return m.reply(`📸 Responde a una imagen`)
  }

  try {
    const buffer = await quoted.download()
    const form = new FormData()
    form.append('file', buffer, { 
      filename: `upload_${Date.now()}${path.extname(mime.split('/')[1] || '.png')}`,
      contentType: mime
    })

    const uploadRes = await fetch('https://phototourl.com/api/upload', {
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Referer': 'https://phototourl.com/',
        ...form.getHeaders()
      },
      body: form
    })

    const data = await uploadRes.json()
    
    if (!data?.url) throw new Error('No URL')

    const imgUrl = data.url
    const analysisRes = await axios.get(
      `${global.APIs.light.url}/tools/image-prompt?url=${encodeURIComponent(imgUrl)}&language=es`
    )

    const result = analysisRes.data.result

    await conn.sendMessage(m.chat, {
      text: `🌷 *PROMPT:*\n${result.prompt}`
    }, { quoted: m })

  } catch (err) {
    m.reply(`Error: ${err.message}`)
  }
}

handler.help = ['analizarimg']
handler.tags = ['tools']
handler.command = ['analizarimg']

export default handler
