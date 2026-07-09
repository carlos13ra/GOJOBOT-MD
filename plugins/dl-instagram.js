import fetch from 'node-fetch'

const formatNumber = (num) => {
  num = parseInt(num) || 0
  return num.toLocaleString('de-DE')
}

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply(`🍡 Ingrese un link de Instagram.`)

  if (!/instagram\.com\/(reel|p|tv)\//.test(text)) {
    return m.reply('✘ Manda un link de Reel o Post de IG válido')
  }

  let statusMsg = await m.reply('🍡 *Buscando información...*')

  try {
    const api = `${global.APIs.light.url}/download/igdl/v2/slide?url=${encodeURIComponent(text)}`
    const res = await fetch(api)
    const json = await res.json()

    console.log('IGDL RESPONSE:', JSON.stringify(json).slice(0, 1500))

    if (!json?.status || !json?.result) {
      return conn.sendMessage(m.chat, {
        text: `✘ ${json?.message || 'IG bloqueó o cambió estructura'}`,
        edit: statusMsg.key
      })
    }

    const metadata = json.result.metadata || {}
    const author = json.result.author || {}
    const media = json.result.media || {}
    const caption = metadata.caption || 'Sin descripción'
    const slides = Array.isArray(media.slides) ? media.slides : []

    if (slides.length === 0) {
      return conn.sendMessage(m.chat, {
        text: `✘ No se encontraron slides/medios en este post`,
        edit: statusMsg.key
      })
    }

    const videoSlides = slides.filter(s => Array.isArray(s?.videos) && s.videos.length > 0)
    const imageSlides = slides.filter(s => !(Array.isArray(s?.videos) && s.videos.length > 0))

    const tipo = videoSlides.length > 0
      ? (imageSlides.length > 0 ? 'Carrusel (Video + Imagen)' : 'Video')
      : (imageSlides.length > 1 ? 'Álbum de imágenes' : 'Imagen')

    // duración + bitrate + tamaño (sin ffprobe)
    let segundos = 0
    let bitrate = 0
    let bytes = 0

    const firstVideoUrl = videoSlides[0]?.videos?.[0]?.url
    if (firstVideoUrl) {
      try {
        const efgMatch = firstVideoUrl.match(/efg=([^&]+)/)
        if (efgMatch) {
          const efgDecoded = Buffer.from(decodeURIComponent(efgMatch[1]), 'base64').toString()
          const durationMatch = efgDecoded.match(/"duration_s":(\d+)/)
          if (durationMatch) segundos = parseInt(durationMatch[1])
        }
      } catch (e) {
        console.log('No se pudo extraer duración de efg:', e.message)
      }

      try {
        const bitrateMatch = firstVideoUrl.match(/bitrate=(\d+)/)
        if (bitrateMatch) bitrate = Math.round(parseInt(bitrateMatch[1]) / 1000)
      } catch (e) {
        console.log('No se pudo extraer bitrate:', e.message)
      }

      try {
        const head = await fetch(firstVideoUrl, {
          method: 'HEAD',
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
        })
        bytes = parseInt(head.headers.get('content-length') || '0')
      } catch (e) {
        console.log('HEAD falló:', e.message)
        if (bitrate > 0 && segundos > 0) {
          bytes = Math.round((bitrate * 1000 * segundos) / 8)
        }
      }
    }

    const minutos = Math.floor(segundos / 60)
    const segs = segundos % 60
    const duracion = segundos > 0 ? `${minutos}:${segs.toString().padStart(2, '0')}` : 'N/A'
    const tamaño = bytes > 0 ? (bytes / (1024 * 1024)).toFixed(2) : 'N/A'

    let infoMessage = `╭─ 🌱 *INSTAGRAM DOWNLOADER* 🌱\n`
    infoMessage += `├─ ｡ *Author:* @${author.username || 'desconocido'}\n`
    infoMessage += `├─ ｡ *Tipo:* ${tipo}\n`
    infoMessage += `├─ ｡ *Descripción:* ${caption.substring(0, 100)}...\n`
    infoMessage += `├─ ｡ *Likes:* ${formatNumber(metadata.likeCount)}\n`
    infoMessage += `├─ ｡ *Comentarios:* ${formatNumber(metadata.commentCount)}\n`
    infoMessage += `├─ ｡ *Duración:* ${segundos}s (${duracion})\n`
    infoMessage += `├─ ｡ *Tamaño:* ${tamaño} MB\n`
    infoMessage += `├─ ｡ *Slides:* ${media.total_slides || slides.length}\n`
    infoMessage += `├─ ｡ *Fecha:* ${metadata.createTime || 'N/A'}\n`
    infoMessage += `├─ ｡ *Enlace:* ${text}\n`
    infoMessage += `╰─ 🥢 *Enviando...*`

    // guard real: si no hay profilePic, manda solo texto
    if (author.profilePic && typeof author.profilePic === 'string') {
      await conn.sendMessage(m.chat, {
        image: { url: author.profilePic },
        caption: infoMessage
      }, { quoted: m })
    } else {
      await conn.sendMessage(m.chat, {
        text: infoMessage
      }, { quoted: m })
    }

    for (const slide of videoSlides) {
      const vUrl = slide?.videos?.[0]?.url
      if (!vUrl || typeof vUrl !== 'string') continue
      await conn.sendMessage(m.chat, {
        video: { url: vUrl },
        mimetype: 'video/mp4'
      }, { quoted: m })
    }

    if (imageSlides.length > 0) {
      const imgs = imageSlides
        .map(s => s?.images?.[0]?.url)
        .filter(u => typeof u === 'string' && u.length > 0)
        .map(url => ({ image: { url } }))

      if (imgs.length > 1 && typeof conn.sendAlbumMessage === 'function') {
        await conn.sendAlbumMessage(m.chat, imgs, { quoted: m })
      } else {
        for (const img of imgs) {
          await conn.sendMessage(m.chat, img, { quoted: m })
        }
      }
    }

  } catch (e) {
    console.log('IGDL ERROR:', e)
    await conn.sendMessage(m.chat, {
      text: `✘ Error al descargar: ${e.message || 'Error desconocido'}`,
      edit: statusMsg.key
    })
  }
}

handler.help = ['ig <link>']
handler.tags = ['download']
handler.command = ['ig', 'igdl', 'instagram']

export default handler