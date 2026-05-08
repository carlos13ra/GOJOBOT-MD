import fetch from 'node-fetch'
import fs from 'fs'
import { exec } from 'child_process'
import { promisify } from 'util'

const execPromise = promisify(exec)

let handler = async (m, { conn, text, usedPrefix, command }) => {

  if (!text) {
    return m.reply(`❀ Ingresa lo que quieres buscar\n\n> Ejemplo:\n${usedPrefix + command} worry`)
  }

  const tmpMp3 = `./tmp/${Date.now()}.mp3`
  const tmpOgg = `./tmp/${Date.now()}.ogg`

  try {
    await m.react('🕒')

    const api = `https://api--shadowcorexyz.replit.app/search/yt-search?q=${encodeURIComponent(text)}`
    
    const res = await fetch(api)
    const json = await res.json()

    if (!json.status || !json.result) {
      throw 'No se encontraron resultados'
    }

    const data = json.result

    let caption =
`🎧 *Play Audio*

🧊 *Título:* ${data.title}
👤 *Autor:* ${data.author}
⏱️ *Duración:* ${data.duration}
👁️ *Vistas:* ${data.views}

🔗 *Link:* ${data.url}`

    await conn.sendMessage(m.chat, {
      image: { url: data.thumbnail },
      caption
    }, { quoted: m })

    // API AUDIO
    const api2 = `https://nexus-light.onrender.com/download/ytdl?q=${encodeURIComponent(data.url)}&format=mp3&quality=128`

    const res2 = await fetch(api2)
    const json2 = await res2.json()

    if (!json2.status || !json2.result?.dl_url) {
      throw 'Error al obtener el audio'
    }

    // DESCARGAR MP3
    const audioRes = await fetch(json2.result.dl_url)
    const buffer = Buffer.from(await audioRes.arrayBuffer())

    fs.writeFileSync(tmpMp3, buffer)

    // CONVERTIR A OGG OPUS
    await execPromise(`ffmpeg -i "${tmpMp3}" -c:a libopus -b:a 128k "${tmpOgg}" -y`)

    // ENVIAR PPT / AUDIO
    await conn.sendMessage(m.chat, {
      audio: fs.readFileSync(tmpOgg),
      mimetype: 'audio/ogg; codecs=opus',
      ptt: true
    }, { quoted: m })

    // BORRAR TMP
    fs.unlinkSync(tmpMp3)
    fs.unlinkSync(tmpOgg)

    await m.react('✅')

  } catch (e) {
    console.log(e)

    if (fs.existsSync(tmpMp3)) fs.unlinkSync(tmpMp3)
    if (fs.existsSync(tmpOgg)) fs.unlinkSync(tmpOgg)

    await m.react('✖️')
    m.reply(`✘ Error:\n${e.message || e}`)
  }
}

handler.help = ['playaudio']
handler.tags = ['download']
handler.command = ['playaudio']

export default handler