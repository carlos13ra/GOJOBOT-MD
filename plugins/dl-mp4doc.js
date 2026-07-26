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
    const api = `${global.APIs.light.url}/download/ytmp4?url=${encodeURIComponent(text)}`
    const res = await fetch(api)
    const json = await res.json()

    if (!json.status || !json.data?.dl) {
      throw 'Error al obtener el video'
    }

    const data = json.data

    let caption =
`🎬 *YouTube MP4*

🧊 *Título:* ${data.title}
👤 *Autor:* ${data.channel}
⏱️ *Duración:* ${data.duration}s
🎬 *Calidad:* 720p
🔗 *Link:* ${text}`

    await conn.sendMessage(m.chat, {
      image: { url: data.thumbnail },
      caption
    }, { quoted: m })

    const fileName = `${(data.filename || 'video')
      .replace(/[\\/:*?"<>|]/g, '')}`

    await conn.sendMessage(m.chat, {
      document: { url: data.dl },
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

handler.help = ['mp4doc *« ᴜʀʟ »*']
handler.tags = ['download']
handler.command = ['mp4doc', 'ytmp4doc']

export default handler