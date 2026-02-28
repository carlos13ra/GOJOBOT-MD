import yts from 'yt-search'
import axios from 'axios'
import Jimp from 'jimp'

const MAX_MB = 100

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!conn.ytv2) conn.ytv2 = {}

  if (command === 'ytdl') {
    if (!text) {
      return m.reply(`🌱 *Uso correcto:*\n\n${usedPrefix + command} <búsqueda>`)
    }

    const res = await yts.search(text)
    const video = res.videos[0]
    if (!video) return m.reply('❌ Sin resultados.')

    let msg = `📺 *RESULTADO DE YOUTUBE*\n\n`
    msg += `🎬 ${video.title}\n`
    msg += `⏱ ${video.timestamp}\n`
    msg += `👤 ${video.author.name}\n\n`
    msg += `📥 *Responde:*\n`
    msg += `*1* ➜ Video 🎥\n`
    msg += `*2* ➜ Audio 🎵`

    const sent = await conn.sendMessage(
      m.chat,
      { image: { url: video.thumbnail }, caption: msg },
      { quoted: m }
    )

    conn.ytv2[m.chat] = {
      step: 'type',
      msgId: sent.key.id,
      url: video.url,
      title: video.title
    }
  }
}

handler.all = async function (m) {
  if (!this.ytv2) this.ytv2 = {}
  const ses = this.ytv2[m.chat]
  if (!ses) return
  if (!m.quoted || m.quoted.id !== ses.msgId) return

  if (ses.step === 'type') {
    if (m.text === '1') {
      const { data } = await axios.get(
        `https://api-shadow-xyz.onrender.com/download/ytdl`,
        {
          params: {
            url: ses.url,
            type: 'video',
            quality: '360'
          }
        }
      )

      const qualities = data.result.available_qualities

      let txt = `🎥 *ELIGE CALIDAD DE VIDEO*\n\n`
      qualities.forEach((q, i) => {
        txt += `*${i + 1}* ➜ ${q}p\n`
      })

      const sent = await m.reply(txt)

      ses.step = 'video_quality'
      ses.qualities = qualities
      ses.msgId = sent.key.id
      return
    }

    if (m.text === '2') {
      const { data } = await axios.get(
        `https://api-shadow-xyz.onrender.com/download/ytdl`,
        {
          params: {
            url: ses.url,
            type: 'audio',
            quality: '128'
          }
        }
      )

      const qualities = data.result.available_qualities

      let txt = `🎵 *ELIGE CALIDAD DE AUDIO*\n\n`
      qualities.forEach((q, i) => {
        txt += `*${i + 1}* ➜ ${q} kbps\n`
      })

      const sent = await m.reply(txt)

      ses.step = 'audio_quality'
      ses.qualities = qualities
      ses.msgId = sent.key.id
      return
    }
  }

  if (ses.step === 'video_quality') {
    const quality = ses.qualities[Number(m.text) - 1]
    if (!quality) return m.reply('❌ Opción inválida.')

    await m.reply('📥 Descargando video...')

    const { data } = await axios.get(
      `https://api-shadow-xyz.onrender.com/download/ytdl`,
      {
        params: {
          url: ses.url,
          type: 'video',
          quality
        }
      }
    )

    const result = data.result

    let thumbDoc = null
    try {
      const img = await Jimp.read(result.thumbnail)
      img.resize(300, Jimp.AUTO).quality(70)
      thumbDoc = await img.getBufferAsync(Jimp.MIME_JPEG)
    } catch {
      thumbDoc = Buffer.alloc(0)
    }

    const head = await axios.head(result.url)
    const sizeMB = Number(head.headers['content-length'] || 0) / 1024 / 1024

    if (sizeMB > MAX_MB) {
      await conn.sendMessage(
        m.chat,
        {
          document: { url: result.url },
          mimetype: 'video/mp4',
          fileName: `${result.title}.mp4`,
          jpegThumbnail: thumbDoc
        },
        { quoted: m }
      )
    } else {
      await conn.sendMessage(
        m.chat,
        {
          video: { url: result.url },
          caption: `🎬 *${result.title}*\n📺 ${quality}p`,
          jpegThumbnail: thumbDoc
        },
        { quoted: m }
      )
    }

    delete this.ytv2[m.chat]
  }

  if (ses.step === 'audio_quality') {
    const quality = ses.qualities[Number(m.text) - 1]
    if (!quality) return m.reply('❌ Opción inválida.')

    await m.reply('🎧 Descargando audio...')

    const { data } = await axios.get(
      `https://api-shadow-xyz.onrender.com/download/ytdl`,
      {
        params: {
          url: ses.url,
          type: 'audio',
          quality
        }
      }
    )

    const result = data.result

    const head = await axios.head(result.url)
    const sizeMB = Number(head.headers['content-length'] || 0) / 1024 / 1024

    if (sizeMB > MAX_MB) {
      await conn.sendMessage(
        m.chat,
        {
          document: { url: result.url },
          mimetype: 'audio/mpeg',
          fileName: `${result.title}.mp3`
        },
        { quoted: m }
      )
    } else {
      await conn.sendMessage(
        m.chat,
        {
          audio: { url: result.url },
          mimetype: 'audio/mpeg'
        },
        { quoted: m }
      )
    }

    delete this.ytv2[m.chat]
  }
}

handler.help = ['ytdl <búsqueda>']
handler.tags = ['youtube']
handler.command = ['ytdl']

export default handler
