import { spawn } from 'child_process'
import fs from 'fs'
import fetch from 'node-fetch'

async function faststart(buffer) {
  const i = `./in_${Date.now()}.mp4`
  const o = `./out_${Date.now()}.mp4`
  fs.writeFileSync(i, buffer)

  const run = args =>
    new Promise((res, rej) => {
      spawn('ffmpeg', args)
        .on('close', c => (c === 0 ? res() : rej()))
    })

  try {
    await run(['-y', '-i', i, '-c', 'copy', '-movflags', '+faststart', o])
  } catch {
    await run([
      '-y', '-i', i,
      '-c:v', 'libx264',
      '-c:a', 'aac',
      '-movflags', '+faststart',
      o
    ])
  }

  const buffer2 = fs.readFileSync(o)
  fs.unlinkSync(i)
  fs.unlinkSync(o)
  return buffer2
}

async function downloadM3u8(url) {
  const i = `./in_${Date.now()}.m3u8`
  const o = `./out_${Date.now()}.mp4`

  const run = args =>
    new Promise((res, rej) => {
      spawn('ffmpeg', args)
        .on('close', c => (c === 0 ? res() : rej()))
    })

  try {
    await run(['-y', '-i', url, '-c', 'copy', '-bsf:a', 'aac_adtstoasc', o])
    const buffer = fs.readFileSync(o)
    fs.unlinkSync(o)
    return buffer
  } catch (e) {
    throw new Error(`Error descargando M3U8: ${e.message}`)
  }
}

async function downloadDirectLink(url) {
  const res = await fetch(url)
  return await res.buffer()
}

var shadow = async (m, { text, usedPrefix, command, conn }) => {
  if (!text) return m.reply(`ꕥ *Ingrese el término de búsqueda*\n\n*Ejemplo:* ${usedPrefix}${command} Tachibana`)

  await m.react('🔍')

  try {
    const url = `${global.APIs.light.url}/search/pinterest-video?q=${encodeURIComponent(text)}`
    const res = await fetch(url)
    const json = await res.json()

    if (!json.status || !json.videos || json.videos.length === 0) {
      return m.reply('No se encontraron videos para tu búsqueda.')
    }

    const maxVideos = json.videos.slice(0, 10)
    
    await m.react('⏳')
    const medias = []

    for (let i = 0; i < maxVideos.length; i++) {
      const videoData = maxVideos[i]
      
      try {
        let buffer
        if (videoData.video.includes('.m3u8')) {
          buffer = await downloadM3u8(videoData.video)
        } else {
          buffer = await downloadDirectLink(videoData.video)
        }

        buffer = await faststart(buffer)

        let caption = `╔═══════ ≪ ✿ ≫ ═══════╗\n`
        caption += `║ 🍄 *PINTEREST VIDEO (${i + 1}/${maxVideos.length})*\n`
        caption += `╠═════════════════════╣\n`
        caption += `║ ° *Author:* ${videoData.pinner || 'Anónimo'}\n`
        caption += `║ ° *Título:* ${videoData.title || 'Sin título'}\n`
        caption += `║ ° *Likes:* ${videoData.likes || 0}\n`
        caption += `║ ° *Enlace:* ${videoData.link}\n`
        caption += `╚═══════ ≪ ✿ ≫ ═══════╝`
        medias.push({
          type: 'video',
          data: buffer,
          caption: caption
        })

      } catch (err) {
        console.error(`[Error procesando video ${i + 1}]`, err)
      }
    }

    if (medias.length === 0) {
      return m.reply('No se pudo procesar ningún video correctamente.')
    }

    await conn.sendSylphy(m.chat, medias, { quoted: m })
    await m.react('✅')
    
  } catch (e) {
    m.reply(`Ocurrió un error: \`\`\`${e.message}\`\`\``)
  }
}

shadow.help = ['pinterestvid', 'pinvid']
shadow.tags = ['search']
shadow.command = ['pinterestvid', 'pinvid', 'pinterestvideo']

export default shadow