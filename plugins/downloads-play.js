import fetch from "node-fetch"
import yts from "yt-search"
import crypto from "crypto"
import axios from "axios"

const handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    if (!text?.trim())
      return conn.reply(m.chat, `*▶️ Por favor, ingresa el nombre o enlace del video.* ☃️`, m, rcanal)

    await m.react('🎶')

    const videoMatch = text.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|shorts\/|v\/)?([a-zA-Z0-9_-]{11})/)
    const query = videoMatch ? `https://youtu.be/${videoMatch[1]}` : text

    const search = await yts(query)
    const allItems = (search?.videos?.length ? search.videos : search.all) || []
    const result = videoMatch
      ? allItems.find(v => v.videoId === videoMatch[1]) || allItems[0]
      : allItems[0]

    if (!result) throw 'No se encontraron resultados.'

    const { title = 'Desconocido', thumbnail, timestamp = 'N/A', views, ago = 'N/A', url = query, author = {} } = result
    const vistas = formatViews(views)

    const res3 = await fetch("https://files.catbox.moe/wfd0ze.jpg")
    const thumb3 = Buffer.from(await res3.arrayBuffer())

    const fkontak2 = {
      key: { fromMe: false, participant: "0@s.whatsapp.net" },
      message: {
        documentMessage: {
          title: "𝗗𝗘𝗦𝗖𝗔𝗥𝗚𝗔𝗡𝗗𝗢.... ..",
          fileName: global.botname || "Bot",
          jpegThumbnail: thumb3
        }
      }
    }

    const fkontak = {
      key: { fromMe: false, participant: "0@s.whatsapp.net" },
      message: {
        documentMessage: {
          title: `「 ${title} 」`,
          fileName: global.botname || "Bot",
          jpegThumbnail: thumb3
        }
      }
    }

    const info = `❄️ *Título:* ☃️ ${title}
> ▶️ *Canal:* ${author.name || 'Desconocido'}
> 💫 *Vistas:* ${vistas}
> ⏳ *Duración:* ${timestamp}
> ✨ *Publicado:* ${ago}
> 🌐 *Link:* ${url}`

    const thumb = (await conn.getFile(thumbnail)).data
    await conn.sendMessage(m.chat, { image: thumb, caption: info, ...fake }, { quoted: fkontak2 })

    if (['play', 'audio'].includes(command)) {
      await m.react('🎧')

      const audio = await getAudio(url)
      if (!audio?.status) throw `Error al obtener el audio: ${audio?.error || 'Desconocido'}`

      await conn.sendMessage(
        m.chat,
        {
          audio: { url: audio.result.download },
          mimetype: 'audio/mpeg',
          fileName: `${title}.mp3`
        },
        { quoted: fkontak }
      )

      await m.react('✔️')
    }

    else if (['play2', 'video'].includes(command)) {
      await m.react('🎬')

      const video = await getVid(url)
      if (!video?.url) throw 'No se pudo obtener el video.'

      await conn.sendMessage(
        m.chat,
        {
          video: { url: video.url },
          fileName: `${title}.mp4`,
          mimetype: 'video/mp4',
          caption: `> 🎵 *${title}*`
        },
        { quoted: fkontak }
      )

      await m.react('✔️')
    }

  } catch (e) {
    await m.react('✖️')
    console.error(e)
    const msg = typeof e === 'string'
      ? e
      : `⚠️ Ocurrió un error inesperado.\n> Usa *${usedPrefix}report* para informarlo.\n\n${e?.message || JSON.stringify(e)}`
    return conn.reply(m.chat, msg, m)
  }
}

handler.command = handler.help = ['play', 'play2', 'audio', 'video']
handler.tags = ['download']
export default handler


// ====================
// API ULTRAPLUS (OFICIAL)
// ====================

async function getVid(url) {
  try {
    const { data } = await axios.post(
      "https://api-sky.ultraplus.click/youtube/resolve",
      {
        url,
        type: "video",
        quality: "720"
      },
      {
        headers: {
          "Content-Type": "application/json",
          apikey: "sk_4b83fc27-8f8b-44f8-a17e-a2b078318f68"
        }
      }
    )

    if (!data?.status || !data?.result?.url) return null

    return {
      url: data.result.url,
      title: data.result.title || "video"
    }

  } catch (e) {
    console.log("Error getVid:", e?.response?.data || e.message)
    return null
  }
}

async function getAudio(url) {
  try {
    const { data } = await axios.post(
      "https://api-sky.ultraplus.click/youtube/resolve",
      {
        url,
        type: "audio",
        quality: "128"
      },
      {
        headers: {
          "Content-Type": "application/json",
          apikey: "sk_4b83fc27-8f8b-44f8-a17e-a2b078318f68"
        }
      }
    )

    if (!data?.status || !data?.result?.url)
      return { status: false, error: "No se pudo obtener audio" }

    return {
      status: true,
      result: {
        download: data.result.url,
        title: data.result.title || "audio"
      }
    }

  } catch (e) {
    return {
      status: false,
      error: e?.response?.data?.message || e.message
    }
  }
}

function formatViews(views) {
  if (views === undefined || views === null) return "No disponible"
  if (views >= 1_000_000_000) return `${(views / 1_000_000_000).toFixed(1)}B`
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M`
  if (views >= 1_000) return `${(views / 1_000).toFixed(1)}K`
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
