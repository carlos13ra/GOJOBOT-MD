// - 𝙲𝙾𝙳𝙸𝙶𝙾 𝙲𝚁𝙴𝙰𝙳𝙾 𝚇 𝚂𝙷𝙰𝙳𝙾𝚆-𝙽𝙴𝚇 𝚇𝙳 👑
// - https://github.com/Shadow-nex/
// - 𝙽𝙾 𝙴𝙳𝙸𝚃𝙰𝚁 𝙴𝙻 𝙲𝙾𝙳𝙸𝙶𝙾 

import fetch from 'node-fetch'
import Jimp from 'jimp'
import axios from 'axios'
import crypto from 'crypto'
import yts from 'yt-search'

const savetube = {
  api: {
    base: "https://media.savetube.me/api",
    cdn: "/random-cdn",
    info: "/v2/info",
    download: "/download"
  },
  headers: {
    'accept': '*/*',
    'content-type': 'application/json',
    'origin': 'https://yt.savetube.me',
    'referer': 'https://yt.savetube.me/',
    'user-agent': 'Postify/1.0.0'
  },
  crypto: {
    hexToBuffer: (hexString) => {
      const matches = hexString.match(/.{1,2}/g)
      return Buffer.from(matches.join(''), 'hex')
    },
    decrypt: async (enc) => {
      const secretKey = 'C5D58EF67A7584E4A29F6C35BBC4EB12'
      const data = Buffer.from(enc, 'base64')
      const iv = data.slice(0, 16)
      const content = data.slice(16)
      const key = savetube.crypto.hexToBuffer(secretKey)

      const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv)
      let decrypted = decipher.update(content)
      decrypted = Buffer.concat([decrypted, decipher.final()])

      return JSON.parse(decrypted.toString())
    }
  },
  isUrl: str => { 
    try { new URL(str); return true } catch { return false } 
  },
  youtube: url => {
    const patterns = [
      /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
      /youtu\.be\/([a-zA-Z0-9_-]{11})/
    ]
    for (let regex of patterns) {
      if (regex.test(url)) return url.match(regex)[1]
    }
    return null
  },
  request: async (endpoint, data = {}, method = 'post') => {
    try {
      const { data: response } = await axios({
        method,
        url: `${endpoint.startsWith('http') ? '' : savetube.api.base}${endpoint}`,
        data: method === 'post' ? data : undefined,
        params: method === 'get' ? data : undefined,
        headers: savetube.headers
      })
      return { status: true, code: 200, data: response }
    } catch (error) {
      return {
        status: false,
        code: error.response?.status || 500,
        error: error.message
      }
    }
  },
  getCDN: async () => {
    const response = await savetube.request(savetube.api.cdn, {}, 'get')
    if (!response.status) return response
    return { status: true, code: 200, data: response.data.cdn }
  },
  download: async (link) => {
    if (!link) return { status: false, code: 400, error: "Falta el enlace de YouTube." }
    if (!savetube.isUrl(link)) return { status: false, code: 400, error: "URL inválida de YouTube." }

    const id = savetube.youtube(link)
    if (!id) return { status: false, code: 400, error: "No se pudo extraer el ID del video." }

    try {
      const cdnRes = await savetube.getCDN()
      if (!cdnRes.status) return cdnRes
      const cdn = cdnRes.data

      const infoRes = await savetube.request(`https://${cdn}${savetube.api.info}`, {
        url: `https://www.youtube.com/watch?v=${id}`
      })
      if (!infoRes.status) return infoRes

      const decrypted = await savetube.crypto.decrypt(infoRes.data.data)

      const dl = await savetube.request(`https://${cdn}${savetube.api.download}`, {
        id: id,
        downloadType: 'audio',
        quality: '128',
        key: decrypted.key
      })

      return {
        status: true,
        code: 200,
        result: {
          title: decrypted.title || "Desconocido",
          thumbnail: decrypted.thumbnail || `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
          download: dl.data.data.downloadUrl,
          duration: decrypted.duration,
          quality: '128',
          id
        }
      }

    } catch (error) {
      return { status: false, code: 500, error: error.message }
    }
  }
}

let handler = async (m, { conn, args }) => {
  let q = args.join(" ").trim()
  if (!q) {
    return conn.reply(m.chat, `🍉 Ingresa el nombre del audio a descargar.`, m, rcanal)
  }

  try {
    let search = await yts(q)
    if (!search.videos || !search.videos.length) {
      return conn.reply(m.chat, `❌ No encontré resultados para *${q}*.`, m)
    }

    let vid = search.videos[0]

    let info = await savetube.download(vid.url)
    if (!info.status) {
      return conn.reply(m.chat, `❌ No se pudo descargar el audio.`, m)
    }

    let { result } = info

    let thumb = null
    try {
      const img = await Jimp.read(result.thumbnail)
      img.resize(300, Jimp.AUTO)
      thumb = await img.getBufferAsync(Jimp.MIME_JPEG)
    } catch {}

    await conn.sendMessage(m.chat, {
      document: { url: result.download },
      mimetype: "audio/mpeg",
      fileName: `${result.title}.mp3`,
      jpegThumbnail: thumb,
      caption: `🎧 *${result.title}*\n⏱️ ${vid.timestamp}\n📡 ${vid.author.name}\n🔗 ${vid.url}`
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    conn.reply(m.chat, `❌ Error: ${e.message}`, m)
  }
}

handler.command = ['ytmp3doc', 'ytadoc']
handler.help = ['ytmp3doc <texto>']
handler.tags = ['download']

export default handler