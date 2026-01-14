import fetch from "node-fetch"
import yts from "yt-search"
import { spawn } from "child_process"
import fs from "fs"


const yt = {
  static: Object.freeze({
    baseUrl: 'https://cnv.cx',
    headers: {
      'accept-encoding': 'gzip, deflate, br, zstd',
      'origin': 'https://frame.y2meta-uk.com',
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36'
    }
  }),

  resolvePayload(link, f) {
    const tipo = f.endsWith('k') ? 'mp3' : 'mp4'
    return {
      link,
      format: tipo,
      audioBitrate: tipo === 'mp3' ? f.replace('k', '') : '128',
      videoQuality: tipo === 'mp4' ? f.replace('p', '') : '720',
      filenameStyle: 'pretty',
      vCodec: 'h264'
    }
  },

  sanitize(name) {
    return name.replace(/[^a-z0-9]/gi, '_').toLowerCase()
  },

  async getKey() {
    const r = await fetch(this.static.baseUrl + '/v2/sanity/key', {
      headers: this.static.headers
    })
    return r.json()
  },

  async convert(url, f) {
    const { key } = await this.getKey()
    const payload = this.resolvePayload(url, f)
    const r = await fetch(this.static.baseUrl + '/v2/converter', {
      method: 'POST',
      headers: { ...this.static.headers, key },
      body: new URLSearchParams(payload)
    })
    return r.json()
  }
}


async function faststart(buffer) {
  const i = `./in_${Date.now()}.mp4`
  const o = `./out_${Date.now()}.mp4`
  fs.writeFileSync(i, buffer)

  await new Promise(res => {
    spawn('ffmpeg', [
      '-y', '-i', i,
      '-c', 'copy',
      '-movflags', '+faststart',
      o
    ]).on('close', res)
  })

  const out = fs.readFileSync(o)
  fs.unlinkSync(i)
  fs.unlinkSync(o)
  return out
}


const handler = async (m, { conn, text, command }) => {
  try {
    if (!text) return m.reply('▶️ Escribe el nombre o link del video')

    await m.react('🎶')

    const match = text.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/))([a-zA-Z0-9_-]{11})/)
    const query = match ? `https://youtu.be/${match[1]}` : text

    const search = await yts(query)
    const video = search.videos[0]
    if (!video) throw 'No se encontró nada'

    const { title, url, thumbnail, timestamp, views, ago, author } = video

    await conn.sendMessage(m.chat, {
      image: { url: thumbnail },
      caption: `❄️ *Título:* ☃️ ${title}
> ▶️ *Canal:* ${author.name || 'Desconocido'}
> 💫 *Vistas:* ${formatViews(views)}
> ⏳ *Duración:* ${timestamp}
> ✨ *Publicado:* ${ago}
> 🌐 *Link:* ${url}`
    }, { quoted: m })

    const isAudio = ['play', 'audio'].includes(command)
    const formato = isAudio ? '128k' : '480p'

    await m.react(isAudio ? '🎧' : '🎬')

    const data = await yt.convert(url, formato)
    const fileName = yt.sanitize(data.filename)

    const r = await fetch(data.url)
    const buffer = Buffer.from(await r.arrayBuffer())

    if (isAudio) {
      await conn.sendMessage(
        m.chat,
        { audio: buffer, mimetype: 'audio/mpeg', fileName: `${fileName}.mp3` },
        { quoted: m }
      )
    } else {
      const fixed = await faststart(buffer)
      await conn.sendMessage(
        m.chat,
        { video: fixed, mimetype: 'video/mp4', fileName: `${fileName}.mp4` },
        { quoted: m }
      )
    }

    await m.react('✔️')

  } catch (e) {
    console.error(e)
    await m.react('❌')
    m.reply('⚠️ Error al descargar')
  }
}

handler.command = ['play', 'audio', 'video', 'play2']
handler.help = handler.command
handler.tags = ['download']
export default handler