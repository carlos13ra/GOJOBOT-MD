import fetch from 'node-fetch'
import { format } from 'util'

const handler = async (m, { conn, text, usedPrefix, command }) => {

  if (!text) {
    return m.reply('《✧》 Ingresa un enlace para realizar la solicitud.')
  }

  if (!/^https?:\/\//.test(text)) {
    return m.reply('《✧》 Ingresa un enlace válido que comience con http o https')
  }

  try {

    const res = await fetch(text)

    const contentType = res.headers.get('content-type') || ''

    const buffer = await res.buffer()

    if (contentType.includes('application/json')) {

      try {

        const json = JSON.parse(buffer.toString())

        const pretty = JSON.stringify(json, null, 2)

        return m.reply(pretty.slice(0, 65536))

      } catch {

        return m.reply(buffer.toString().slice(0, 65536))
      }
    }

    if (/text/.test(contentType)) {

      return m.reply(buffer.toString().slice(0, 65536))
    }

    return conn.sendFile(
      m.chat,
      buffer,
      '✰ ɪ"ᴍ sʜᴀᴅᴏᴡ ꕥ',
      text,
      m
    )

  } catch (e) {

    console.error(e)

    return m.reply(
      `> Error en *${usedPrefix + command}*\n` +
      `> [${e.message}]`
    )
  }
}

handler.help = ['get', 'fetch']
handler.tags = ['tools']
handler.command = ['get', 'fetch']

export default handler