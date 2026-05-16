import axios from 'axios'
import FormData from 'form-data'
import crypto from 'crypto'

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

    const ext = mime.split('/')[1] || 'bin'
    const fileName = `${crypto.randomBytes(5).toString('hex')}.${ext}`

    const form = new FormData()

    form.append('reqtype', 'fileupload')

    form.append(
      'fileToUpload',
      media,
      fileName
    )

    const { data } = await axios.post(
      'https://catbox.moe/user/api.php',
      form,
      {
        headers: {
          ...form.getHeaders(),
          'User-Agent': 'Mozilla/5.0'
        }
      }
    )

    if (!String(data).startsWith('https://')) {
      throw new Error(data)
    }

    await conn.reply(
      m.chat,
`🫒 *Catbox Upload*

🌳 *Link:* ${data}
🍃 *Tipo:* ${mime}
🍜 *Peso:* ${sizeMb} MB`,
      m
    )

    await m.react('✅')

  } catch (e) {
    console.log(e)
    await m.react('✖️')
    m.reply(`✘ Error:\n${e.message || e}`)
  }
}

handler.help = ['catbox']
handler.tags = ['tools']
handler.command = ['catbox']

export default handler