import axios from 'axios'
import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
  if (!text)
    return conn.reply(m.chat, `🍎 Ingresa el nombre de una canción`, m)

  try {
    const searchApi =
      `https://api--shadowcorexyz.replit.app/search/applemusic?q=${encodeURIComponent(text)}&limit=1`

    const search = await axios.get(searchApi, { timeout: 20000 })

    if (!search.data.status || !search.data.data)
      throw 'No encontrado'

    const data = search.data.data
    const info =
      `🍎 ${data.title}\n` +
      `👤 ${data.artist}\n` +
      `💿 ${data.album}\n` +
      `⏱ ${data.duration}\n` +
      `🔞 ${data.explicit ? 'Sí' : 'No'}`

    await conn.reply(m.chat, info, m)

    const dlApi =
      `https://api--shadowcorexyz.replit.app/download/applemusic?url=${encodeURIComponent(data.apple_url)}`

    const dl = await axios.get(dlApi, { timeout: 20000 })

    if (!dl.data.status || !dl.data.data?.dl_url)
      throw 'No se pudo obtener audio'

    const audioUrl = dl.data.data.dl_url

    const audioRes = await fetch(audioUrl)
    if (!audioRes.ok) throw 'Error al descargar audio'

    const buffer = await audioRes.buffer()

    await conn.sendMessage(m.chat, {
      audio: buffer,
      mimetype: 'audio/mpeg',
      fileName: `${data.title}.mp3`,
      ptt: false
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    conn.reply(m.chat, `❌ Error al reproducir Apple Music`, m)
  }
}

handler.help = ['applemusic']
handler.tags = ['download']
handler.command = ['applemusic', 'amplay']

export default handler