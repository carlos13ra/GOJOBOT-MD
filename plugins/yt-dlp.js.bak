import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import ytSearch from 'yt-search'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const downloadDir = path.join(__dirname, '..', 'tmp')
const ytdlpPath = path.join(__dirname, '..', 'yt-dlp')

async function downloadMedia(url, type, quality = 'best') {
  return new Promise((resolve, reject) => {
    let args = []
    const filename = `${Date.now()}_%(title)s.%(ext)s`
    const outputPath = path.join(downloadDir, filename)

    if (type === 'mp3') {
      args = [
        '-x',
        '--audio-format', 'mp3',
        '--audio-quality', '0',
        '--progress',
        '-o', outputPath,
        url
      ]
    } else if (type === 'mp4') {
      if (quality === '360p') args = ['-f', '18']
      else if (quality === '720p') args = ['-f', '22']
      else args = ['-f', 'best[ext=mp4]']

      args.push('--progress', '-o', outputPath, url)
    }

    const proc = spawn(ytdlpPath, args, { cwd: downloadDir })
    let output = ''

    proc.stdout.on('data', (data) => { output += data.toString() })
    proc.stderr.on('data', (data) => { output += data.toString() })

    proc.on('close', (code) => {
      if (code === 0) {
        const files = fs.readdirSync(downloadDir)
        const latestFile = files
          .map(f => ({
            name: f,
            time: fs.statSync(path.join(downloadDir, f)).mtime.getTime()
          }))
          .sort((a, b) => b.time - a.time)[0]

        if (latestFile) {
          resolve(path.join(downloadDir, latestFile.name))
        } else {
          reject(new Error('No se encontró el archivo descargado'))
        }
      } else {
        reject(new Error(`Error en descarga: ${output}`))
      }
    })

    proc.on('error', reject)
  })
}

let handler = async (m, { conn, usedPrefix, command, text }) => {
  try {

    if (command === 'ytaa') {
      if (!text) {
        return await conn.reply(m.chat,
          `🎵 Uso: *${usedPrefix}ytaa <url o búsqueda>*\n\nEjemplo:\n${usedPrefix}ytaa anime\n${usedPrefix}ytaa https://youtube.com/watch?v=...`, m)
      }

      await m.react('🕒')

      let url = text
      let videoInfo = null

      if (!text.includes('youtube.com') && !text.includes('youtu.be')) {
        const result = await ytSearch(text)
        if (!result.videos.length) {
          await m.react('✖️')
          return await conn.reply(m.chat, '❌ No se encontraron resultados', m)
        }
        videoInfo = result.videos[0]
        url = videoInfo.url
      } else {
        const result = await ytSearch(text)
        videoInfo = result.videos[0]
      }

      const infoMsg = `
📌 *Título:* ${videoInfo.title}
👤 *Canal:* ${videoInfo.author.name}
⏱️ *Duración:* ${videoInfo.timestamp}
👁️ *Vistas:* ${videoInfo.views.toLocaleString()}
🍡 *Fecha:* ${videoInfo.ago}
🔗 *URL:* ${videoInfo.url}

⏳ Descargando audio...
      `.trim()

      await conn.reply(m.chat, infoMsg, m)

      const filePath = await downloadMedia(url, 'mp3')
      const fileSize = (fs.statSync(filePath).size / 1024 / 1024).toFixed(2)

      await conn.sendFile(m.chat, filePath, 'audio.mp3',
        `🍡 *MP3 Descargado*\n📊 Tamaño: ${fileSize} MB`, m)

      fs.unlinkSync(filePath)
      await m.react('✔️')

    } else if (command === 'ytvv') {
      if (!text) {
        return await conn.reply(m.chat,
          `🎬 Uso: *${usedPrefix}ytvv <url|query> [calidad]*\n\nCalidades: 360p, 720p, best\n\nEjemplo:\n${usedPrefix}ytvv despacito|720p`, m)
      }

      await m.react('🕒')

      const args = text.split('|')
      const query = args[0].trim()
      const quality = args[1]?.trim() || 'best'

      let url = query
      let videoInfo = null

      if (!query.includes('youtube.com') && !query.includes('youtu.be')) {
        const result = await ytSearch(query)
        if (!result.videos.length) {
          await m.react('✖️')
          return await conn.reply(m.chat, '❌ No se encontraron resultados', m)
        }
        videoInfo = result.videos[0]
        url = videoInfo.url
      } else {
        const result = await ytSearch(query)
        videoInfo = result.videos[0]
      }

      const infoMsg = `
📌 *Título:* ${videoInfo.title}
👤 *Canal:* ${videoInfo.author.name}
⏱️ *Duración:* ${videoInfo.timestamp}
👁️ *Vistas:* ${videoInfo.views.toLocaleString()}
🍡 *Fecha:* ${videoInfo.ago}
🎬 *Calidad:* ${quality}
🔗 *URL:* ${videoInfo.url}

⏳ Descargando video...
      `.trim()

      await conn.reply(m.chat, infoMsg, m)

      const filePath = await downloadMedia(url, 'mp4', quality)
      const fileSize = (fs.statSync(filePath).size / 1024 / 1024).toFixed(2)

      if (parseFloat(fileSize) > 100) {
        await conn.sendMessage(m.chat, {
          document: { url: filePath },
          mimetype: 'video/mp4',
          fileName: `video_${quality}.mp4`,
          caption: `🍡 *MP4 Descargado*\n° Tamaño: ${fileSize} MB\n° Calidad: ${quality}`
        }, { quoted: m })
      } else {
        await conn.sendFile(m.chat, filePath, 'video.mp4',
          `🍡 *MP4 Descargado*\n° Tamaño: ${fileSize} MB\n° Calidad: ${quality}`, m)
      }

      fs.unlinkSync(filePath)
      await m.react('✔️')
    }

  } catch (error) {
    await m.react('✖️')
    await conn.reply(m.chat,
      `🍡 Se ha producido un problema.\n> Usa *${usedPrefix}report* para informarlo.\n\n\`\`\`${error.message}\`\`\``, m)
  }
}

handler.help = ['ytaa <url|query>', 'ytvv <url|query> [calidad]']
handler.tags = ['downloader']
handler.command = ['ytaa', 'ytvv']
handler.group = true

export default handler