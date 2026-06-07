import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`✰ Uso: ${usedPrefix + command} <url de YouTube>\nEjemplo: ${usedPrefix + command} https://youtube.com/watch?v=lCKU-tI-upI`)

  let statusMsg = await m.reply('🧊 *Descargando audio... espera*')

  try {
    const api = `https://api--shadowcorexyz.replit.app/download/ytdl/v2?url=${encodeURIComponent(text)}&format=mp3&quality=m4a`
    const res = await fetch(api, { timeout: 25000 })
    const json = await res.json()

    if (!json.status || !json.result?.download) {
      return conn.sendMessage(m.chat, {
        text: `✘ ${json.message || 'API falló o link inválido'}`,
        edit: statusMsg.key
      })
    }

    const r = json.result

    await conn.sendMessage(m.chat, {
      audio: { url: r.download },
      mimetype: 'audio/mpeg',
      fileName: `${r.title}.mp3`,
      ptt: false
    }, { quoted: m })

    await conn.sendMessage(m.chat, {
      text: `╭─❒ *YTMP3*
│🎵 *Título:* ${r.title}
│👤 *Canal:* ${r.uploader}
│⏱️ *Duración:* ${r.duration}
│👀 *Vistas:* ${r.views}
│📦 *Tamaño:* ${r.size}
│🎧 *Calidad:* ${r.quality} ${r.ext}
╰─❒\n\n✅ *Descarga completa*`,
      edit: statusMsg.key
    })

    await m.react('✅')

  } catch (e) {
    console.error(e)
    await conn.sendMessage(m.chat, {
      text: `✘ Error: ${e.message}\n\n• Replit dormido\n• YouTube bloqueó\n• Link inválido`,
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