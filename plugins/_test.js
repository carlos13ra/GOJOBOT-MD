import axios from 'axios'

const YT_HEADERS = {
  'User-Agent': 'com.google.android.apps.youtube.vr.oculus/1.56.21 (Linux; U; Android 12; eureka-user Build/SQ3A.220605.009.A1) gzip',
  'Referer': 'https://www.youtube.com/',
  'Origin': 'https://www.youtube.com'
}

let handler = async (m, { conn, usedPrefix, command, text }) => {
  try {
    if (!text) return m.reply(`Uso: ${usedPrefix}${command} <url directa de googlevideo>`)

    await m.react('🕒')

    const videoRes = await axios.get(text.trim(), {
      responseType: 'arraybuffer',
      headers: YT_HEADERS,
      timeout: 120000
    })

    const videoBuffer = Buffer.from(videoRes.data)
    const fileMB = (videoBuffer.length / 1024 / 1024).toFixed(1)

    if (parseFloat(fileMB) > 100) {
      await conn.sendMessage(m.chat, {
        document: videoBuffer,
        mimetype: 'video/mp4',
        fileName: 'video.mp4',
        caption: `🍡 *MP4*\n° Tamaño: ${fileMB} MB`
      }, { quoted: m })
    } else {
      await conn.sendMessage(m.chat, {
        video: videoBuffer,
        mimetype: 'video/mp4',
        fileName: 'video.mp4',
        caption: `🍡 *MP4*\n° Tamaño: ${fileMB} MB`
      }, { quoted: m })
    }

    await m.react('✔️')

  } catch (error) {
    await m.react('✖️')
    m.reply(`🍡 Error.\n\`\`\`${error.message}\`\`\``)
  }
}

handler.help = ['gdl <url>']
handler.tags = ['downloader']
handler.command = ['gdl', 'gvideo']
handler.group = true

export default handler