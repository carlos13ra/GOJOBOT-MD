import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
  try {
    if (!text) return m.reply('✰ Ingresa un link de Instagram')

    const isIG = /(?:instagram\.com)/i.test(text)
    if (!isIG) return m.reply('✘ Link inválido de Instagram')

    await m.reply('🍜 Descargando video...')

    const api = `${global.APIs.light.url}/download/igdl?url=${encodeURIComponent(text)}`
    const res = await fetch(api)
    const json = await res.json()

    if (!json.status) throw 'Error en la API'

    const caption = `🍜 Instagram Downloader

✰ Usuario: ${json.username}
☁︎ Tipo: ${json.type}`.trim()

    if (json.type === 'video' && json.videos?.length) {
      let video = json.videos[0]
      try {
        await conn.sendMessage(m.chat, {
          video: { url: video },
          caption: caption + '🫒 calidad: 720(HD)'
        }, { quoted: m })
      } catch {
        await conn.sendFile(
          m.chat,
          video,
          'ig.mp4',
          caption + `\n🎬 Calidad: 720p`,
          m
        )
      }

    } 

    else if (json.thumb) {
      await conn.sendMessage(m.chat, {
        image: { url: json.thumb },
        caption
      }, { quoted: m })
    } 
    else {
      throw 'No hay contenido disponible'
    }

  } catch (e) {
    console.error(e)
    m.reply('✘ Error al descargar Instagram')
  }
}

handler.help = ['instagram', 'ig']
handler.tags = ['download']
handler.command = ['instagram', 'ig', 'igdl']

export default handler