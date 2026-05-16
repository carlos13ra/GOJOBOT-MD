import axios from 'axios'
import FormData from 'form-data'

const handler = async (m, { conn }) => {
  try {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''

    if (!mime) {
      return m.reply('❀ Responde a un archivo.')
    }

    await m.react('🕒')

    const media = await q.download()

    const sizeMb = (media.length / 1024 / 1024).toFixed(2)

    const link = await uploadToCatbox(media, mime)

    await conn.reply(
      m.chat,
`🫒 *Catbox Upload*

🌳 *Link:* ${link}
🍃 *Tipo:* ${mime}
🍜 *Peso:* ${sizeMb} MB`,
      m
    )

    await m.react('✅')

  } catch (e) {
    console.log(e.response?.data || e)

    await m.react('✖️')

    m.reply(
`✘ Error:

${e.response?.data || e.message || e}`
    )
  }
}

handler.help = ['catbox']
handler.tags = ['tools']
handler.command = ['catbox']

export default handler

async function uploadToCatbox(buffer, mime) {
  const form = new FormData()

  form.append('reqtype', 'fileupload')

  form.append(
    'fileToUpload',
    buffer,
    {
      filename: generateUniqueFilename(mime),
      contentType: mime
    }
  )

  const res = await axios.post(
    'https://catbox.moe/user/api.php',
    form,
    {
      headers: {
        ...form.getHeaders(),
        origin: 'https://catbox.moe',
        referer: 'https://catbox.moe/',
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    }
  )

  if (
    !res.data ||
    typeof res.data !== 'string' ||
    !res.data.startsWith('https://')
  ) {
    throw new Error(res.data || 'Respuesta inválida de Catbox')
  }

  return res.data.trim()
}

function generateUniqueFilename(mime = 'application/octet-stream') {
  const ext = mime.split('/')[1] || 'bin'
  return `${Date.now()}.${ext}`
}