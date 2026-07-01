import fetch from 'node-fetch'
import mm from 'music-metadata'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`✰ Uso: ${usedPrefix + command} link\nEjemplo: ${usedPrefix + command} https://www.instagram.com/reel/DX8APTaICzm/`)

  if (!text.includes('instagram.com/reel/') && !text.includes('instagram.com/p/')) {
    return m.reply('✘ Manda un link de Reel o Post de IG válido')
  }

  let statusMsg = await m.reply('🧊 *Descargando...*')
  try {
    const api = `${global.APIs.light.url}/download/igdl?url=${encodeURIComponent(text)}`
    const res = await fetch(api)
    const json = await res.json()

    if (!json.status || !json.videos || json.videos.length === 0) {
      return conn.sendMessage(m.chat, {
        text: `✘ ${json.message || 'IG bloqueó o cambió estructura'}`,
        edit: statusMsg.key
      })
    }

    let videoUrl = json.videos[0]
    let username = json.username || 'desconocido'
    let type = json.type || 'video'
    let source = json.source || text

    let duracion = 'N/A'
    let segundos = 0
    let mb = 'N/A'
    
    try {
      const head = await fetch(videoUrl, { method: 'HEAD' })
      let bytes = parseInt(head.headers.get('content-length') || '0')
      mb = bytes ? (bytes / 1024 / 1024).toFixed(2) + ' MB' : 'N/A'

      const resVideo = await fetch(videoUrl, { 
        headers: { 'Range': 'bytes=0-524288' } 
      })
      
      if (resVideo.ok) {
        const buffer = Buffer.from(await resVideo.arrayBuffer())
        try {
          const metadata = await mm.parseBuffer(buffer, 'video/mp4', { duration: true })
          segundos = metadata.format.duration || 0
        } catch {
          segundos = 0
        }
      }

      if (segundos > 0) {
        const horas = Math.floor(segundos / 3600)
        const min = Math.floor((segundos % 3600) / 60)
        const seg = Math.floor(segundos % 60)
        duracion = horas > 0
          ? `${horas}:${min.toString().padStart(2, '0')}:${seg.toString().padStart(2, '0')}`
          : `${min}:${seg.toString().padStart(2, '0')}`
      }
    } catch (err) {
      console.error('Error obteniendo metadata:', err)
    }

    let caption = `🌱 *Título:* Instagram\n`
    caption += `🌵 *Formato:* ${type.toUpperCase()}\n`
    caption += `🥢 *Duración:* ${duracion}\n`
    caption += `🫒 *Peso:* ${mb}\n`
    caption += `🍃 *Author:* @${username}\n`
    caption += `🍜 *Enlace:* ${source}\n\n`

    await conn.sendMessage(m.chat, {
      video: { url: videoUrl },
      caption,
      mimetype: 'video/mp4'
    }, { quoted: m })

    await conn.sendMessage(m.chat, {
      text: `✅ *Descarga completa*\nVideo enviado con éxito.`,
      edit: statusMsg.key
    })

    await m.react('✅')

  } catch (e) {
    console.error('Error en igsd:', e)
    await conn.sendMessage(m.chat, {
      text: `✘ Error al descargar: ${e.message || 'Error desconocido'}`,
      edit: statusMsg.key
    })
  }
}

handler.help = ['igsd <link>']
handler.tags = ['download']
handler.command = ['igsd', 'igdl2']

export default handler