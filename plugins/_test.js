import axios from 'axios'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import ytSearch from 'yt-search'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const downloadDir = path.join(__dirname, '..', 'tmp')

if (!fs.existsSync(downloadDir)) {
  fs.mkdirSync(downloadDir, { recursive: true })
}

async function youtubeDownload(url) {
  try {
    const res = await axios.post(
      'https://api.rifkyshre.biz.id/scrape/youtube-ytdlp',
      { url },
      {
        timeout: 30000,
        validateStatus: () => true,
        headers: {
          'Content-Type': 'application/json',
          Origin: 'https://code.rifkyshre.biz.id',
          Referer: 'https://code.rifkyshre.biz.id/'
        }
      }
    )
    const body = res.data
    if (!body?.status) throw new Error(body?.error ?? 'Unknown error')
    return body.data
  } catch (e) {
    throw new Error(e.message ?? String(e))
  }
}

let handler = async (m, { conn, usedPrefix, command, text }) => {
  try {

    if (command === 'ytaa') {
      if (!text) return await conn.reply(m.chat,
        `🎵 Uso: *${usedPrefix}ytaa <url o búsqueda>*\n\nEjemplo:\n${usedPrefix}ytaa anime\n${usedPrefix}ytaa https://youtube.com/watch?v=...`, m)

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

      const data = await youtubeDownload(url)
      if (!data?.bestAudio) throw new Error('No se obtuvo URL de audio')

      const dur = data.duration
      const mm = Math.floor(dur / 60)
      const ss = String(dur % 60).padStart(2, '0')

      await conn.sendMessage(m.chat, {
        audio: { url: data.bestAudio },
        mimetype: 'audio/mpeg',
        fileName: `${data.title || videoInfo.title}.mp3`,
        ptt: false
      }, { quoted: m })

      await m.react('✔️')

    } else if (command === 'ytvv') {
      if (!text) return await conn.reply(m.chat,
        `🎬 Uso: *${usedPrefix}ytvv <url|query>*\n\nEjemplo:\n${usedPrefix}ytvv despacito`, m)

      await m.react('🕒')

      const query = text.trim()
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
🔗 *URL:* ${videoInfo.url}

⏳ Descargando video...
      `.trim()

      await conn.reply(m.chat, infoMsg, m)

      const data = await youtubeDownload(url)
      if (!data?.best) throw new Error('No se obtuvo URL de video')

      // Estimar tamaño desde merged[0].filesize si existe
      const filesize = data.merged?.[0]?.filesize || 0
      const fileMB = filesize / 1024 / 1024

      if (fileMB > 100) {
        await conn.sendMessage(m.chat, {
          document: { url: data.best },
          mimetype: 'video/mp4',
          fileName: `${data.title || videoInfo.title}.mp4`,
          caption: `🍡 *MP4 Descargado*\n° Tamaño: ~${fileMB.toFixed(1)} MB`
        }, { quoted: m })
      } else {
        await conn.sendMessage(m.chat, {
          video: { url: data.best },
          mimetype: 'video/mp4',
          fileName: `${data.title || videoInfo.title}.mp4`,
          caption: `🍡 *MP4 Descargado*\n° Tamaño: ~${fileMB > 0 ? fileMB.toFixed(1) + ' MB' : 'N/A'}`
        }, { quoted: m })
      }

      await m.react('✔️')
    }

  } catch (error) {
    await m.react('✖️')
    await conn.reply(m.chat,
      `🍡 Se ha producido un problema.\n> Usa *${usedPrefix}report* para informarlo.\n\n\`\`\`${error.message}\`\`\``, m)
  }
}

handler.help = ['ytaa <url|query>', 'ytvv <url|query>']
handler.tags = ['downloader']
handler.command = ['ytaa', 'ytvv']
handler.group = true

export default handler