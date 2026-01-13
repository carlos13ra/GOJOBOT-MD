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

    if (!video) return conn.reply(m.chat, '✧ No se encontraron resultados para tu búsqueda.', m)

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
          title: title,
          body: "",
          thumbnailUrl: thumbnail,
          sourceUrl: url,
          mediaType: 1,
          renderLargerThumbnail: false
        }
      }
    }, { quoted: m })

    if (command === 'playaudio') {
      try {
        const apiUrl = `https://api.nekolabs.my.id/downloader/youtube/v1?url=${encodeURIComponent(url)}&format=mp3`
        const res = await fetch(apiUrl)
        const json = await res.json()

        if (!json.success || !json.result?.downloadUrl)
          throw '*⚠ No se obtuvo un enlace de audio válido.*'

        const audioUrl = json.result.downloadUrl
        const titulo = json.result.title || title
        const cover = json.result.cover || thumbnail

        await conn.sendMessage(m.chat, {
          audio: { url: audioUrl },
          mimetype: 'audio/mpeg',
          fileName: `${titulo}.mp3`,
          contextInfo: {
            externalAdReply: {
              title: `🎧 ${titulo}`,
              body: 'Descarga Completa ♻️',
              mediaType: 1,
              thumbnailUrl: cover,
              sourceUrl: url,
              renderLargerThumbnail: false
            }
          }
        }, { quoted: m })

        await m.react('✅')
      } catch (e) {
        console.error(e)
        return conn.reply(m.chat, '*⚠ No se pudo enviar el audio. Puede ser muy pesado o hubo un error en la API.*', m)
      }
    }

    else if (command === 'playvideo') {
      try {
        const apiUrl = `https://api.nekolabs.web.id/downloader/youtube/v1?url=${encodeURIComponent(url)}&format=360`
        const res = await fetch(apiUrl)
        const json = await res.json()

        if (!json.success || !json.result?.downloadUrl)
          throw '⚠ No se obtuvo enlace de video válido.'

        const videoUrl = json.result.downloadUrl
        const titulo = json.result.title || title

        const caption = `> ♻️ *Titulo:* ${titulo}
> 🎋 *Duración:* ${json.result.duration || timestamp || 'Desconocido'}`.trim()

        await conn.sendMessage(m.chat, {
          video: { url: videoUrl },
          caption,
          mimetype: 'video/mp4',
          fileName: `${titulo}.mp4`,
          contextInfo: {
            externalAdReply: {
              title: titulo,
              body: '📽️ Descarga Completa',
              thumbnailUrl: json.result.cover || thumbnail,
              sourceUrl: url,
              mediaType: 1,
              renderLargerThumbnail: true
            }
          }
        }, { quoted: m })

        await m.react('✅')
      } catch (e) {
        console.error(e)
        return conn.reply(m.chat, '⚠ No se pudo enviar el video. Puede ser muy pesado o hubo un error en la API.', m)
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



api
https://api-adonix.ultraplus.click/download/ytaudio?apikey=shadow.xyz&url=https%3A%2F%2Fyoutube.com%2Fwatch%3Fv%3DcerCJyAR5jw

Json
{
  "status": true,
  "creator": "Ado",
  "data": {
    "title": "30 Minutes of the Best Fonk of 2024 | Drift fonk | Brazilian fonk",
    "url": "https://s11.ytcontent.com/v3/d/audio/cerCJyAR5jw/1734462670201252/YTDown.com_YouTube_30-Minutes-of-the-Best-Fonk-of-2024-Drif_Media_cerCJyAR5jw_007_48k.m4a?token=1768345489cc75179fcea4cb3702b429c922243f12",
    "ext": "m4a"
  }
}


api vídeo


Dashboard
YOUTUBE DOWNLOADER
Usuario:
ׅ𝃤𝃤𓂂 ɪ'ᴍ sʜᴀᴅᴏᴡ's xʏᴢ 彡★
API Key:
Shad••••••••••
👁️
📋
🚀 Probador en Vivo
https://www.youtube.com/watch?v=WFbgcAxrQ50
OBTENER
VER JSON
Procesando…
thumbnail
Alex Otaola en vivo, noticias de Cuba - Hola! Ota-Ola (martes 13 de enero del 2026)
Cubanos por el Mundo - Live
Video

144p

240p

360p

720p

1080p

1440p

4kp
Audio

MP3

M4A

WEBM

AACC

FLAC

APUS

OGG

WAV
{
  "status": true,
  "result": {
    "title": "Alex Otaola en vivo, noticias de Cuba - Hola! Ota-Ola (martes 13 de enero del 2026)",
    "author": {
      "name": "Cubanos por el Mundo - Live",
      "username": ""
    },
    "thumbnail": "https://i.ytimg.com/vi/WFbgcAxrQ50/hqdefault.jpg",
    "defaults": {
      "video_quality": "360",
      "audio_format": "mp3"
    },
    "options": {
      "video": [
        {
          "quality": "144",
          "label": "144p"
        },
        {
          "quality": "240",
          "label": "240p"
        },
        {
          "quality": "360",
          "label": "360p"
        },
        {
          "quality": "720",
          "label": "720p"
        },
        {
          "quality": "1080",
          "label": "1080p"
        },
        {
          "quality": "1440",
          "label": "1440p"
        },
        {
          "quality": "4k",
          "label": "4K"
        }
      ],
      "audio": [
        {
          "format": "mp3",
          "label": "MP3"
        },
        {
          "format": "m4a",
          "label": "M4A"
        },
        {
          "format": "webm",
          "label": "WEBM"
        },
        {
          "format": "aacc",
          "label": "AACC"
        },
        {
          "format": "flac",
          "label": "FLAC"
        },
        {
          "format": "apus",
          "label": "APUS"
        },
        {
          "format": "ogg",
          "label": "OGG"
        },
        {
          "format": "wav",
          "label": "WAV"
        }
      ]
    },
    "source": {
      "url": "https://www.youtube.com/watch?v=WFbgcAxrQ50"
    }
  }
}
💻 Documentación API
cURL

curl -X POST "https://api-sky.ultraplus.click/youtube/resolve" \
  -H "Content-Type: application/json" \
  -H "apikey: Shadow" \
  -d '{"url":"https://www.youtube.com/watch?v=dQw4w9WgXcQ","type":"video","quality":"720"}'
Node.js

const axios = require("axios");

async function youtube(url) {
  const { data } = await axios.post("https://api-sky.ultraplus.click/youtube/resolve", { 
    url, 
    type: "video", 
    quality: "720" 
  }, {
    headers: { apikey: "Shadow" }
  });
  
  if (data.status) return data.result;
  throw new Error(data.message || "Error");
}

para el vídeo calidad 720
