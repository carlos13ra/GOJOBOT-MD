import fetch from 'node-fetch'
import yts from 'yt-search'
import axios from 'axios'

const MAX_FILE_SIZE_MB = 80
const CACHE_TIME = 10 * 60 * 1000
let ytCache = {}

function formatNumber(num) {
  return num.toLocaleString('en-US')
}

async function getSize(url) {
  try {
    const res = await axios.head(url)
    const len = res.headers['content-length']
    return len ? parseInt(len, 10) : 0
  } catch {
    return 0
  }
}

function formatSize(bytes) {
  const units = ['B', 'KB', 'MB', 'GB']
  let i = 0
  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024
    i++
  }
  return `${bytes.toFixed(2)} ${units[i]}`
}

async function getStellar(url) {
  try {
    const api = `https://api.stellarwa.xyz/dl/ytdl?url=${encodeURIComponent(url)}&format=mp3&key=Shadow_Core`
    const res = await fetch(api)
    const data = await res.json()

    if (data?.status && data?.data?.dl) {
      return {
        link: data.data.dl,
        title: data.data.title || 'Desconocido',
        format: 'mp3'
      }
    }

    throw new Error('No se pudo obtener el enlace de descarga')
  } catch (e) {
    console.error('Error en Stellar API:', e.message)
    return null
  }
}

async function getYupra(url) {
  try {
    const api = `https://api.yupra.my.id/api/downloader/ytmp4?url=${encodeURIComponent(url)}`
    const res = await fetch(api)
    const data = await res.json()

    if (data?.result?.formats?.[0]?.url) {
      return {
        link: data.result.formats[0].url,
        title: data.result.title || 'Desconocido',
        format: 'mp4'
      }
    }
    throw new Error('No se pudo obtener el enlace de descarga')
  } catch (e) {
    console.error('Error en Yupra API:', e.message)
    return null
  }
}

var handler = async (m, { text, conn }) => {
  if (!text) return conn.reply(m.chat, `🥭 *Ingresa el nombre o enlace de YouTube.*`, m)

  try {
    await m.react('🔍')
    const results = await yts(text)
    const videos = results.videos.slice(0, 15)
    if (!videos.length) return conn.reply(m.chat, '⚠️ No se encontraron resultados.', m)

    ytCache[m.sender] = { results: videos, timestamp: Date.now() }

    let caption = ` 🔎 𝚁𝙴𝚂𝚄𝙻𝚃𝙰𝙳𝙾𝚂 𝙳𝙴 𝙱𝚄𝚂𝚀𝚄𝙴𝙳𝙰\n`
    caption += `*Término:* ${text}\n\n`

    for (let i = 0; i < videos.length; i++) {
      const v = videos[i]
      caption += `📢 *${i + 1}.* ${v.title}\n`
      caption += `> 🌐 Canal: *${v.author.name}*\n`
      caption += `> ⏰ Duración: *${v.timestamp || 'Desconocida'}*\n`
      caption += `> 📆 Subido: *${v.ago || 'N/D'}*\n`
      caption += `> 🚀 Vistas: *${formatNumber(v.views)}*\n`
      caption += `> 🔗 Enlace » ${v.url}\n`
      caption += `\n${'•'.repeat(38)}\n\n`
    }

    caption += `🪷 *Responde con:*  
🎧 a1 - a15 → Descargar audio  
🎬 v1 - v15 → Descargar video`

    await conn.sendMessage(m.chat, {
      image: { url: videos[0].thumbnail },
      caption
    })

    await m.react('✔️')
  } catch (e) {
    await m.react('✖️')
    conn.reply(m.chat, `❌ Error al procesar: ${e.message}`, m)
  }
}

handler.before = async (m, { conn }) => {
  if (!m.text) return
  const match = m.text.trim().match(/^(a|v)(\d{1,2})$/i)
  if (!match) return

  const type = match[1].toLowerCase() === 'a' ? 'audio' : 'video'
  const index = parseInt(match[2]) - 1

  const userCache = ytCache[m.sender]
  if (!userCache || !userCache.results[index] || Date.now() - userCache.timestamp > CACHE_TIME)
    return conn.reply(m.chat, '👻 La lista expiró. Usa el comando nuevamente.', m, rcanal)

  const video = userCache.results[index]

  try {
    await m.react('🕒')

    const apiData = type === 'audio'
      ? await getStellar(video.url)
      : await getYupra(video.url)

    if (!apiData) return conn.reply(m.chat, `⚠️ Error al obtener enlace desde la API.`, m)

    const size = await getSize(apiData.link)
    const mb = size / (1024 * 1024)
    const sendAsDoc = mb > MAX_FILE_SIZE_MB

    const caption = `📡 *${apiData.title}*\n💫 *Duración:* ${video.timestamp || 'Desconocida'}\n🎶 *Tamaño:* ${formatSize(size)}`

    if (sendAsDoc) {
      await conn.sendMessage(
        m.chat,
        {
          document: { url: apiData.link },
          fileName: `${apiData.title}.${apiData.format}`,
          mimetype: type === 'audio' ? 'audio/mpeg' : 'video/mp4',
          caption: caption + `\n\n🔥 Enviado como documento (>${MAX_FILE_SIZE_MB} MB)`
        },
        { quoted: m }
      )
    } else if (type === 'audio') {
      await conn.sendMessage(
        m.chat,
        {
          audio: { url: apiData.link },
          fileName: `${apiData.title}.mp3`,
          mimetype: 'audio/mpeg',
          ptt: false,
          caption
        },
        { quoted: m }
      )
    } else {
      await conn.sendMessage(
        m.chat,
        {
          video: { url: apiData.link },
          fileName: `${apiData.title}.mp4`,
          mimetype: 'video/mp4',
          caption
        },
        { quoted: m }
      )
    }

    await m.react('✔️')
  } catch (e) {
    await m.react('✖️')
    conn.reply(m.chat, `❌ Error al descargar: ${e.message}`, m)
  }
}

handler.help = ['ytbuscar <texto>']
handler.tags = ['search']
handler.command = ['ytbuscar', 'yts', 'ytssearch']
handler.group = true

export default handler