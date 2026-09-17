import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`《✧》 Manda link de Mediafire\n*Ejemplo:* ${usedPrefix + command} https://www.mediafire.com/file/xxx/file`)

  await m.react('⏳')

  try {
    const apiUrl = `${global.APIs.light.url}/download/mediafire?url=${encodeURIComponent(text)}`
    const res = await fetch(apiUrl)
    const json = await res.json()

    if (!json.status || !json.data) {
      await m.react('❌')
      return m.reply('《✧》 No se pudo obtener el archivo')
    }

    const { filename, filetype, filesize, uploaded, owner_name, download_url } = json.data

    await m.reply(` 🍡 *MEDIAFIRE Download er*
 ° *Nombre:* ${filename}
 ° *Tipo:* ${filetype}
 ° *Peso:* ${filesize}
 ° *Subido:* ${uploaded}
 ° *Owner:* ${owner_name}`)

    await conn.sendMessage(m.chat, {
      document: { url: download_url },
      fileName: filename,
      mimetype: 'application/octet-stream',
    }, { quoted: m })

    await m.react('✅')

  } catch (e) {
    m.reply(`《✧》 Error: ${e.message}`)
  }
}

handler.help = ['md <link>']
handler.tags = ['download']
handler.command = ['mf', 'mediafire']

export default handler