import yts from 'yt-search'
import axios from 'axios'

function convertid(url) {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|embed|watch|shorts)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:[&?]|$)/
  const match = url.match(regex)
  return match ? match[1] : null
}

function mapaudioquality(bitrate) {
  if (bitrate == 320) return 0
  if (bitrate == 256) return 1
  if (bitrate == 128) return 4
  if (bitrate == 96) return 5
  return 4
}

async function request(url, data) {
  return axios.post(url, data, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10)',
      'Content-Type': 'application/json',
      origin: 'https://cnvmp3.com',
      referer: 'https://cnvmp3.com/v51'
    }
  })
}

async function cnvmp3(yturl, quality = 128) {
  const youtube_id = convertid(yturl)
  if (!youtube_id) throw new Error('Invalid yt url')

  const finalQuality = mapaudioquality(parseInt(quality))
  const yturlfull = `https://www.youtube.com/watch?v=${youtube_id}`

  const viddata = await request(
    'https://cnvmp3.com/get_video_data.php',
    { url: yturlfull, token: "1234" }
  )

  const download = await request(
    'https://cnvmp3.com/download_video_ucep.php',
    {
      url: yturlfull,
      quality: finalQuality,
      title: viddata.data.title,
      formatValue: 1
    }
  )

  return {
    title: viddata.data.title,
    download: download.data.download_link
  }
}

const handler = async (m, { conn, text, command }) => {
  if (!text) return m.reply('🔎 Ingresa nombre o link de YouTube')

  await m.react('⏳')

  let search = await yts(text)
  let video = search.videos[0]

  if (!video) return m.reply('❌ No se encontró el video')

  const info = `
🎬 *${video.title}*

👤 Canal: ${video.author.name}
⏱ Duración: ${video.timestamp}
👁 Vistas: ${video.views.toLocaleString()}
📅 Publicado: ${video.ago}
🔗 Link: ${video.url}
`.trim()

  await conn.sendMessage(m.chat, {
    image: { url: video.thumbnail },
    caption: info
  }, { quoted: m })

  if (command === 'playaudio') {

    const audio = await cnvmp3(video.url, 128)

    await conn.sendMessage(m.chat, {
      audio: { url: audio.download },
      mimetype: 'audio/mpeg',
      fileName: `${audio.title}.mp3`
    }, { quoted: m })

  }

  if (command === 'playvideo') {

    await conn.sendMessage(m.chat, {
      video: { url: video.url },
      caption: `🎥 ${video.title}`
    }, { quoted: m })

  }

  await m.react('✅')
}

handler.command = ['playaudio', 'playvideo']
handler.help = ['playaudio <texto>', 'playvideo <texto>']
handler.tags = ['descargas']

export default handler