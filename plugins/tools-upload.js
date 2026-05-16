import fetch from 'node-fetch'
import FormData from 'form-data'

const handler = async (m, { conn }) => {
  try {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''

    if (!mime) {
      return m.reply('❀ Responde a un archivo, imagen, video o audio.')
    }

    await m.react('🕒')
    const media = await q.download()
    const sizeMb = (media.length / 1024 / 1024).toFixed(2)
    const ext = mime.split('/')[1] || 'bin'
    const form = new FormData()
    form.append('reqtype', 'fileupload')
    form.append(
      'fileToUpload',
      media,
      `file.${ext}`
    )

    const res = await fetch(
      'https://catbox.moe/user/api.php',
      {
        method: 'POST',
        body: form,
        headers: form.getHeaders()
      }
    )

    const link = await res.text()

    if (!link.startsWith('https://')) {
      throw link
    }

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
    m.reply(`✘ Error:\n${e.message || e}`)
  }
}

handler.help = ['catbox']
handler.tags = ['tools']
handler.command = ['catbox']

export default handler