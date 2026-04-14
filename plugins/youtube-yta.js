import axios from 'axios'

let handler = async (m, { conn, text, command }) => {
  if (!text) return m.reply('🍜 Envía link o nombre\nEj: yta https://youtu.be/... - yta -doc xd')

  await m.react('⏳')

  try {
    const isDoc = text.startsWith('-doc')
    const query = isDoc ? text.replace('-doc', '').trim() : text

    const api = `https://api--shadowcorexyz.replit.app/download/ytdl?q=${encodeURIComponent(query)}&format=mp3&quality=128`
    const { data } = await axios.get(api, { timeout: 20000 })

    if (!data.status) throw 'No se pudo descargar'

    const r = data.result

    await conn.sendMessage(m.chat, {
      image: { url: r.thumbnail },
      caption: `🌾 Título : ${r.title}\n🍜 Author : ${r.author || 'Desconocido'}\n🧊 Duración : ${r.duration}`
    }, { quoted: m })

    if (!isDoc) {
      await conn.sendMessage(m.chat, {
        audio: { url: r.dl_url },
        mimetype: 'audio/mpeg',
        fileName: `${r.title}.mp3`
      }, { quoted: m })
    }

    if (isDoc) {
      await conn.sendMessage(m.chat, {
        document: { url: r.dl_url },
        mimetype: 'audio/mpeg',
        fileName: `${r.title}.mp3`
      }, { quoted: m })
    }

    await m.react('✅')

  } catch (e) {
    console.error(e)
    m.reply('❌ Error al procesar el audio')
  }
}

handler.command = ['yta']

export default handler