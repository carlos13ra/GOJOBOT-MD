import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {

  if (!text) {
    return m.reply(`❀ Ingresa lo que quieres buscar\n\n> Ejemplo:\n${usedPrefix + command} stellar`)
  }

  try {
    await m.react('🕒')

    const api = `${global.APIs.light.url}/search/yts?q=${encodeURIComponent(text)}`
    const res = await fetch(api)
    const json = await res.json()

    if (!json.status || !Array.isArray(json.result) || !json.result.length) {
      throw 'No se encontraron resultados'
    }

    const data = json.result[0]

    let caption =
`🎧 *YouTube Downloader*

🧊 *Título:* ${data.title}
👤 *Autor:* ${data.author}
⏱️ *Duración:* ${data.duration}
👁️ *Vistas:* ${data.views}
📅 *Subido:* ${data.uploaded}

🔗 *link:* ${data.url}`

    await conn.sendMessage(m.chat, {
      image: { url: data.thumbnail },
      caption
    }, { quoted: m })

    const api2 = `https://nexus-light.onrender.com/download/ytmp3?url=${encodeURIComponent(data.url)}`
    const res2 = await fetch(api2)
    const json2 = await res2.json()

    if (!json2.status || !json2.data?.download) {
      throw 'Error al obtener el audio'
    }

    const fileName = `${(json2.data.title || 'audio')
      .replace(/[\\/:*?"<>|]/g, '')}.mp3`

    await conn.sendMessage(m.chat, {
      document: { url: json2.data.download },
      mimetype: 'audio/mpeg',
      fileName,
      caption: `🫒 Descarga completa`
    }, { quoted: m })

    await m.react('✅')

  } catch (e) {
    console.log(e)
    await m.react('✖️')
    m.reply(`✘ Error:\n${e.message || e}`)
  }
}

handler.help = ['ytmp3doc']
handler.tags = ['download']
handler.command = ['ytmp3doc']

export default handler