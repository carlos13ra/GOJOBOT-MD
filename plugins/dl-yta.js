
import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`✰ Uso: ${usedPrefix + command} <url de YouTube>\nEjemplo: ${usedPrefix + command} https://youtube.com/watch?v=lCKU-tI-upI`)

  let statusMsg = await m.reply('🧊 *Descargando audio... espera*')

  try {
    const api = `${global.APIs.light.url}/download/ytmp3?url=${encodeURIComponent(text)}`
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
      audio: { url: r.dl },
      mimetype: 'audio/mpeg',
      fileName: `${r.title}.mp3`,
      ptt: false
    }, { quoted: m })

    await conn.sendMessage(m.chat, {
      text: `╭─❒ *YTMP3*
│🎵 *Título:* ${r.title}
│⏱️ *Duración:* ${r.duration}s
│🎧 *Calidad:* ${r.quality}
│📦 *Formato:* ${r.format}
│💾 *Tamaño:* ${r.size}
╰─❒

✅ *Descarga completa*`,
      edit: statusMsg.key
    })

    await m.react('✅')

  } catch (e) {
    console.error(e)
    await conn.sendMessage(m.chat, {
      text: `✘ Error: ${e.message}\n\n• Servidor no disponible\n• YouTube bloqueó\n• Link inválido`,
      edit: statusMsg.key
    })
    await m.react('❌')
  }
}

handler.help = ['ytmp3 <url>', 'yta <url>']
handler.tags = ['downloader']
handler.command = ['ytmp3', 'yta']
handler.group = true

export default handler