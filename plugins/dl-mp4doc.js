import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {

  if (!text) {
    return m.reply(`❀ Ingresa un link de YouTube\n\n> Ejemplo:\n${usedPrefix + command} https://youtu.be/xxxx`)
  }

  if (!/youtu\.?be/.test(text)) {
    return m.reply('✘ Link inválido de YouTube')
  }

  try {
    await m.react('🕒')

    const api = `https://nexus-light.onrender.com/download/ytdl/v2?url=${encodeURIComponent(text)}&format=mp4`
    const res = await fetch(api)
    const json = await res.json()

    if (!json.status || !json.result?.download) {
      throw 'Error al obtener el video'
    }

    const data = json.result

    let caption =
`🎬 *YouTube MP4*

🧊 *Título:* ${data.title}
👤 *Autor:* ${data.uploader}
⏱️ *Duración:* ${data.duration}
👁️ *Vistas:* ${data.views}
📦 *Peso:* ${data.size}
📺 *Calidad:* ${data.quality}
🔗 *Link:* ${text}`

    await conn.sendMessage(m.chat, {
      image: { url: data.thumbnail },
      caption
    }, { quoted: m })

    const fileName = `${(data.title || 'video')
      .replace(/[\\/:*?"<>|]/g, '')}.mp4`

    await conn.sendMessage(m.chat, {
      document: { url: data.download },
      mimetype: 'video/mp4',
      fileName,
      caption: '🫒 Descarga completa'
    }, { quoted: m })

    await m.react('✅')

  } catch (e) {
    console.log(e)
    await m.react('✖️')
    m.reply(`✘ Error:\n${e.message || e}`)
  }
}

handler.help = ['mp4doc', 'ytmp4doc']
handler.tags = ['download']
handler.command = ['mp4doc', 'ytmp4doc']

export default handler