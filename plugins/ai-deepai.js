import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return conn.reply(m.chat, `Por favor ingresa el texto/prompt para editar la imagen.\n\n*Ejemplo:* ${usedPrefix + command} conviértelo en anime`, m)
  let q = m.quoted ? m.quoted : m
  let mimeType = (q.msg || q).mimetype || ''
  if (!/image\/(jest|jpeg|png|webp)/.test(mimeType)) return conn.reply(m.chat, `🥢 Por favor responde o etiqueta una **imagen** con el comando.`, m)

  await m.react('🕒')

  try {
    const imgBuffer = await q.download()
    const ext = mimeType.split('/')[1] || 'jpeg'
    const base64 = `data:image/${ext};base64,${imgBuffer.toString('base64')}`

    const apiUrl = `${global.APIs.light.url}/ai/deepai-edit?img=${encodeURIComponent(base64)}&prompt=${encodeURIComponent(text)}`
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