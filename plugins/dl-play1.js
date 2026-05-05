import fetch from "node-fetch"
import { spawn } from "child_process"
import fs from "fs"

const shadow = async (m, { conn, text, command }) => {
  try {
    if (!text) return m.reply('✰ Ingrese un *nombre* o *link* de YouTube.')

    const isAudio = ['playaudio', 'play-a', 'ytaudio'].includes(command)

    let url = text
    if (!text.includes('youtu')) {
      const search = await fetch(`https://api--shadowcorexyz.replit.app/search/yts?q=${encodeURIComponent(text)}`)
      const json = await search.json()

      if (!json.status || !json.result?.length) throw 'No se encontró nada'
      url = json.result[0].url
    }

    const bitrates = [128, 192, 256, 320]
    const randomBitrate = bitrates[Math.floor(Math.random() * bitrates.length)]

    const format = isAudio ? 'mp3' : 'mp4'
    const quality = isAudio ? randomBitrate : 480

    const api = `${global.APIs.light.url}/download/ytdl?q=${encodeURIComponent(url)}&format=${format}&quality=${quality}`
    const res = await fetch(api)
    const data = await res.json()

    if (!data.status) throw 'Error al convertir'

    const { title, author, duration, thumbnail, dl_url } = data.result

    await conn.sendMessage(m.chat, {
      image: { url: thumbnail },
      caption: `
 *[ ${title} ]*

» ✰ *Canal :* ${author}
» ꕥ *Duración :* ${duration}
» ✿ *Calidad :* ${isAudio ? randomBitrate + 'k' : '480p'}
» ☁︎ *Formato :* ${isAudio ? 'OGG' : 'MP4'}
`
    }, { quoted: m })

    await m.reply('🍜 Procesando...')

    const file = await fetch(dl_url)
    const buffer = Buffer.from(await file.arrayBuffer())

    if (isAudio) {
      const input = `./in_${Date.now()}.mp3`
      const output = `./out_${Date.now()}.ogg`
      fs.writeFileSync(input, buffer)

      await new Promise((resolve, reject) => {
        spawn('ffmpeg', [
          '-y',
          '-i', input,
          '-vn',
          '-c:a', 'libopus',
          '-b:a', '128k',
          output
        ])
        .on('close', code => code === 0 ? resolve() : reject('ffmpeg error'))
      })

      const ogg = fs.readFileSync(output)
      fs.unlinkSync(input)
      fs.unlinkSync(output)

      await conn.sendMessage(m.chat, {
        audio: ogg,
        mimetype: 'audio/ogg; codecs=opus',
        ptt: true
      }, { quoted: m })

    } else {
      await conn.sendMessage(m.chat, {
        video: buffer,
        mimetype: 'video/mp4',
        fileName: `${title}.mp4`
      }, { quoted: m })
    }

  } catch (e) {
    console.error(e)
    m.reply('> 🍜 error:\n' + e)
  }
}

shadow.command = ['playaudio', 'play-a', 'ytaudio', 'playvideo', 'play-v', 'ytvideo']
shadow.help = shadow.command
shadow.tags = ['download']

export default shadow