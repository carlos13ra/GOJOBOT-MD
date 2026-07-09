import fetch from 'node-fetch'
import { exec } from 'child_process'
import { promisify } from 'util'

const execPromise = promisify(exec)

let handler = async (m, { conn, args }) => {
  try {
    if (!args.length) {
      return m.reply('《✧》 Ingresa un enlace de Facebook\n\nEjemplo: .fb https://www.facebook.com/share/r/1D4xJCtgNT/')
    }

    const url = args[0]
    if (!url.includes('facebook.com')) {
      return m.reply('《✧》 El enlace es invalido, envía un link de Facebook válido')
    }

    await m.reply('🍡 Descargando video...')

    const res = await fetch(
      `${global.APIs.light.url}/download/facebook/v4?url=${encodeURIComponent(url)}`
    )
    const data = await res.json()

    if (!data.status || !data.result?.download?.url) {
      return m.reply('《✧》 No se pudo descargar el video')
    }

    const result = data.result
    const videoUrl = result.download.url

    let bytes = 0
    let segundos = 0
    let bitrate = 0

    try {
      try {
        const efgMatch = videoUrl.match(/efg=([^&]+)/)
        if (efgMatch) {
          const efgEncoded = efgMatch[1]
          const efgDecoded = Buffer.from(decodeURIComponent(efgEncoded), 'base64').toString()
          const durationMatch = efgDecoded.match(/"duration_s":(\d+)/)
          if (durationMatch) {
            segundos = parseInt(durationMatch[1])
          }
        }
      } catch (e) {
        console.log('No se pudo extraer de efg:', e.message)
      }
      try {
        const bitrateMatch = videoUrl.match(/bitrate=(\d+)/)
        if (bitrateMatch) {
          bitrate = Math.round(parseInt(bitrateMatch[1]) / 1000)
        }
      } catch (e) {
        console.log('No se pudo extraer bitrate:', e.message)
      }

      try {
        const head = await fetch(videoUrl, { 
          method: 'HEAD', 
          timeout: 10000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        })
        bytes = parseInt(head.headers.get('content-length') || '0')
      } catch (e) {
        console.log('HEAD falló:', e.message)
        if (bitrate > 0 && segundos > 0) {
          bytes = Math.round((bitrate * 1000 * segundos) / 8)
        }
      }

      if (segundos === 0) {
        try {
          const { stdout } = await execPromise(
            `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${videoUrl}"`
          )
          segundos = parseFloat(stdout.trim()) || 0
        } catch (e) {
          console.log('ffprobe falló:', e.message)
        }
      }
    } catch (e) {
      console.log('Error al extraer info:', e.message)
    }

    const mb = bytes ? (bytes / 1024 / 1024).toFixed(2) : 'N/A'
    const horas = Math.floor(segundos / 3600)
    const min = Math.floor((segundos % 3600) / 60)
    const seg = Math.floor(segundos % 60)
    const duracion = horas > 0
      ? `${horas}:${min.toString().padStart(2, '0')}:${seg.toString().padStart(2, '0')}`
      : `${min}:${seg.toString().padStart(2, '0')}`

    const info = `   🍡 *Facebook Download 𑜅* 
> 🌵 ${result.description?.replace(/&#x[0-9A-Fa-f]+;/g, '') || 'Sin descripción'}

 *｡ Vistas:* ${result.views || '0'}
 *｡ Likes:* ${result.likes || '0'}
 *｡ Comments:* ${result.comments || '0'}
 *｡ Shares:* ${result.shares || '0'}
 *｡ Duración:* ${segundos}s (${duracion})
 *｡ Tamaño:* ${mb} MB
 *｡ Calidad:* 720p (HD)
 *｡ Enlace:* ${result.facebook || url}
 
> ${dev}`

    await conn.sendFile(m.chat, videoUrl, 'Miku_sakura.mp4', info, m)

  } catch (e) {
    await m.reply(`🥢 Error: ${e.message}`)
  }
}

handler.help = ['fb *« ᴜʀʟ »*', 'facebook *« ᴜʀʟ »*']
handler.tags = ['downloader']
handler.command = ['fb', 'facebook', 'fbdl']

export default handler