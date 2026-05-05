import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
  try {
    if (!text) return m.reply('✰ Ingresa un link de Facebook')

    const isFacebook = /(?:facebook\.com|fb\.watch)/i.test(text)
    if (!isFacebook) {
      return m.reply('✘ Link inválido, ingresa un enlace de Facebook válido')
    }

    await m.reply('🍜 Descargando video...')

    const api = `${global.APIs.light.url}/download/facebook/v2?url=${encodeURIComponent(text)}`
    const res = await fetch(api)
    const json = await res.json()

    if (!json.status || !json.result?.length) {
      throw 'No se pudo obtener el video'
    }

    let video = json.result.find(v => v.quality === 'HD') || json.result[0]
    let url = video.url

    try {
      await conn.sendFile(
        m.chat,
        url,
        'fb.mp4',
        `🫒 Descarga completa.`,
        m
      )
    } catch (err) {
      console.log('Error en sendFile, reintentando...', err)

      await conn.sendFile(
        m.chat,
        url,
        'fb.mp4',
        `🫒 Descarga completa.`,
        m
      )
    }

  } catch (e) {
    console.error(e)

    try {
      const api = `${global.APIs.light.url}/download/facebook/v2?url=${encodeURIComponent(text)}`
      const res = await fetch(api)
      const json = await res.json()

      if (!json.status || !json.result?.length) {
        return m.reply('✘ No se pudo descargar el video')
      }

      let video = json.result[0]

      await conn.sendFile(
        m.chat,
        video.url,
        'fb.mp4',
        '🫒 Descarga completa.',
        m
      )
    } catch {
      m.reply('✘ Error al descargar el video')
    }
  }
}

handler.help = ['facebook', 'fb']
handler.tags = ['download']
handler.command = ['facebook', 'fb', 'fbdl']

export default handler