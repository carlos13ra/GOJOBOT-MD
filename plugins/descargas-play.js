import fetch from "node-fetch"
import yts from "yt-search"

const youtubeRegexID = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/

const handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    if (!text?.trim())
      return conn.reply(m.chat, `☃️ *Por favor, ingresa el nombre o enlace del video.*`, m)

    let videoIdMatch = text.match(youtubeRegexID)
    let search = await yts(videoIdMatch ? 'https://youtu.be/' + videoIdMatch[1] : text)
    let video = videoIdMatch
      ? search.all.find(v => v.videoId === videoIdMatch[1]) || search.videos.find(v => v.videoId === videoIdMatch[1])
      : search.videos?.[0]

    if (!video)
      return conn.reply(m.chat, '✧ No se encontraron resultados para tu búsqueda.', m)

    const { title, thumbnail, timestamp, views, ago, url, author } = video
    const vistas = formatViews(views)
    const canal = author?.name || 'Desconocido'

    const infoMessage = ` *${title}*

> 📺 *Canal:* ${canal}
> 👁️ *Vistas:* ${vistas}
> ⏱ *Duración:* ${timestamp || 'Desconocido'}
> 📆 *Publicado:* ${ago || 'Desconocido'}
> 🔗 *Enlace:* ${url}`.trim()

    await conn.sendMessage(m.chat, {
      image: { url: thumbnail },
      caption: infoMessage,
      contextInfo: {
        externalAdReply: {
          title,
          body: "",
          thumbnailUrl: thumbnail,
          sourceUrl: url,
          mediaType: 1,
          renderLargerThumbnail: false
        }
      }
    }, { quoted: m })

    // ================= AUDIO =================
    if (command === 'playaudio') {
      try {
        const apiUrl = `https://nexus-light-beryl.vercel.app/download/ytaudio?url=${encodeURIComponent(url)}`
        const res = await fetch(apiUrl)
        const json = await res.json()

        if (!json.status || !json.result?.download)
          throw '⚠ No se obtuvo enlace de audio válido.'

        const audioUrl = json.result.download
        const titulo = json.result.title || title
        const filesizeMB = (json.result.filesize / 1024 / 1024).toFixed(2)

        await conn.sendMessage(m.chat, {
          audio: { url: audioUrl },
          mimetype: 'audio/mpeg',
          fileName: `${titulo}.mp3`,
          contextInfo: {
            externalAdReply: {
              title: `🎧 ${titulo}`,
              body: `Peso: ${filesizeMB} MB`,
              mediaType: 1,
              thumbnailUrl: thumbnail,
              sourceUrl: url,
              renderLargerThumbnail: false
            }
          }
        }, { quoted: m })

        await m.react('✅')
      } catch (e) {
        console.error(e)
        return conn.reply(m.chat, '*⚠ No se pudo enviar el audio. Puede ser pesado o la API falló.*', m)
      }
    }

    // ================= VIDEO =================
    else if (command === 'playvideo') {
      try {
        const apiUrl = `https://nexus-light-beryl.vercel.app/download/ytvideo?url=${encodeURIComponent(url)}`
        const res = await fetch(apiUrl)
        const json = await res.json()

        if (!json.status || !json.result?.download)
          throw '⚠ No se obtuvo enlace de video válido.'

        const videoUrl = json.result.download
        const titulo = json.result.title || title

        const caption = `> 🌾 *Título:* ${titulo}
> 📽️ *Calidad:* ${json.result.quality}`.trim()

        await conn.sendMessage(m.chat, {
          video: { url: videoUrl },
          caption,
          mimetype: 'video/mp4',
          fileName: `${titulo}.mp4`,
          contextInfo: {
            externalAdReply: {
              title: titulo,
              body: `📽️ Calidad ${json.result.quality}`,
              thumbnailUrl: thumbnail,
              sourceUrl: url,
              mediaType: 1,
              renderLargerThumbnail: true
            }
          }
        }, { quoted: m })

        await m.react('✅')
      } catch (e) {
        console.error(e)
        return conn.reply(m.chat, '⚠ No se pudo enviar el video. Puede ser pesado o la API falló.', m)
      }
    }

    else {
      return conn.reply(m.chat, '✧ Comando no reconocido.', m)
    }

  } catch (err) {
    console.error(err)
    return m.reply(`⚠ Ocurrió un error:\n${err}`)
  }
}

handler.command = handler.help = ['playaudio', 'playvideo']
handler.tags = ['descargas']
export default handler

function formatViews(views) {
  if (views === undefined) return "No disponible"
  if (views >= 1e9) return `${(views / 1e9).toFixed(1)}B (${views.toLocaleString()})`
  if (views >= 1e6) return `${(views / 1e6).toFixed(1)}M (${views.toLocaleString()})`
  if (views >= 1e3) return `${(views / 1e3).toFixed(1)}K (${views.toLocaleString()})`
  return views.toString()
}