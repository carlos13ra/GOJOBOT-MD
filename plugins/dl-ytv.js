import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`✰ Uso: ${usedPrefix + command} <url de YouTube>\nEjemplo: ${usedPrefix + command} https://youtube.com/watch?v=KJoYBw5tJOc`)

  let statusMsg = await m.reply('🍡 *Descargando video... espera*')

  try {
    const api = `${global.APIs.light.url}/download/ytmp3?url=${encodeURIComponent(text)}&format=mp4`
    const res = await fetch(api, { timeout: 25000 })
    const json = await res.json()

    if (!json.status || !json.data?.dl) {
      return conn.sendMessage(m.chat, {
        text: `✘ ${json.message || 'API falló o link inválido'}`,
        edit: statusMsg.key
      })
    }

    const r = json.data

    await conn.sendMessage(m.chat, {
      video: { url: r.dl },
      mimetype: 'video/mp4',
      fileName: `${r.title}.mp4`,
      caption: `🍄 *Título:* ${r.title}`
    }, { quoted: m })

    await conn.sendMessage(m.chat, {
      text: `✅ *Descarga completa*`,
      edit: statusMsg.key
    })

    await m.react('✅')

  } catch (e) {
    console.error(e)
    await conn.sendMessage(m.chat, {
      text: `✘ Error: ${e.message}\n\n• Servidor no disponible\n• YouTube bloqueó\n• Link inválido`,
      edit: statusMsg.key
    })
  }
}

handler.help = ['ytv <url>', 'ytmp4 <url>']
handler.tags = ['downloader']
handler.command = ['ytv', 'ytmp4']
handler.group = true

export default handler