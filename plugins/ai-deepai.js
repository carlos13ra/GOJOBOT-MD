import fetch from 'node-fetch'
import FormData from 'form-data'

async function uploadImage(buffer, mime) {
  const body = new FormData()
  body.append('files[]', buffer, `file.${mime.split('/')[1]}`)
  const res = await fetch('https://uguu.se/upload.php', { method: 'POST', body, headers: body.getHeaders() })
  const json = await res.json()
  return json.files?.[0]?.url
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return conn.reply(m.chat, `Por favor ingresa el texto/prompt para editar la imagen.\n\n*Ejemplo:* ${usedPrefix + command} conviérte esta imagen a versión anime`, m)
  let q = m.quoted ? m.quoted : m
  let mimeType = (q.msg || q).mimetype || ''
  if (!/image\/(jest|jpeg|png|webp)/.test(mimeType)) return conn.reply(m.chat, `🥢 Por favor responde o etiqueta una **imagen** con el comando.`, m)

  await m.react('🕒')

  try {
    const imgBuffer = await q.download()
    const imgUrl = await uploadImage(imgBuffer, mimeType)
    if (!imgUrl) throw new Error('No se pudo subir la imagen a uguu.se')

    const apiUrl = `${global.APIs.light.url}/ai/deepai-edit?img=${encodeURIComponent(imgUrl)}&prompt=${encodeURIComponent(text)}`
    const res = await fetch(apiUrl)
    const json = await res.json()

    if (!json.status || !json.data?.output_url) {
      throw new Error(JSON.stringify(json))
    }

    const editedBuffer = await (await fetch(json.data.output_url)).buffer()
    await conn.sendFile(m.chat, editedBuffer, 'edited.jpg', `🌵 *¡Imagen editada con éxito!*\n\n*Prompt:* ${text}`, m)
    await m.react('✔️')

  } catch (error) {
    await m.react('✖️')
    await conn.reply(m.chat, `⚠︎ Error:\n\`\`\`${error.message}\`\`\``, m)
  }
}

handler.help = ['editia <prompt>']
handler.tags = ['ai', 'tools']
handler.command = ['editimg', 'editia', 'deepai']

export default handler