import yts from 'yt-search'
import axios from 'axios'

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
    try {
      const api = `${global.APIs.light.url}/download/ytmp3?url=${encodeURIComponent(video.url)}`
      const { data } = await axios.get(api)

      if (!data.status) throw 'Error al obtener audio'

      const medias = data.result.medias || []
      const bestAudio = medias
        .filter(m => m.type === 'audio')
        .sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0))[0]

      if (!bestAudio?.url) throw 'No se encontró audio válido'

      await conn.sendMessage(m.chat, {
        audio: { url: bestAudio.url },
        mimetype: 'audio/mpeg',
        fileName: `${data.result.title || 'audio'}.mp3`
      }, { quoted: m })

    } catch (e) {
      console.log(e)
      m.reply('❌ Error al descargar el audio')
    }
  }

  if (command === 'playvideo') {
    try {
      const api = `${global.APIs.light.url}/download/ytvideo?url=${encodeURIComponent(video.url)}`
      const { data } = await axios.get(api)

      if (!data.status) throw 'Error al obtener video'

      await conn.sendMessage(m.chat, {
        video: { url: data.result.download },
        caption: `🎥 ${data.result.title}\n📺 Calidad: ${data.result.quality}`
      }, { quoted: m })

    } catch (e) {
      console.log(e)
      m.reply('❌ Error al descargar el video')
    }
  }

  await m.react('✅')
}

handler.command = ['playaudio', 'playvideo']
handler.help = ['playaudio <texto>', 'playvideo <texto>']
handler.tags = ['descargas']

export default handler