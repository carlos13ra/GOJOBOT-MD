import axios from 'axios'
import FormData from 'form-data'

const cache = new Map()
const TTL = 60 * 1000

let handler = async (m, { conn, text, usedPrefix, command }) => {
  try {

    if (!text) {
      return m.reply(`❀ Ingresa un link de YouTube\n\n> Ejemplo:\n${usedPrefix + command} https://youtu.be/xxxx`)
    }

    if (!/youtu\.?be/.test(text)) {
      return m.reply('✘ Link inválido de YouTube')
    }

    await m.react('🕒')

    let result

    const c = cache.get(text)
    if (c && c.exp > Date.now()) {
      result = c.data
    } else {

      let data = new FormData()
      data.append('url', text)

      const res = await axios({
        method: 'post',
        url: 'https://tools.xrespond.com/api/youtube/video/downloader',
        headers: {
          origin: 'https://downsocial.io',
          referer: 'https://downsocial.io/',
          ...data.getHeaders()
        },
        data
      })

      const info = res.data?.data?.data

      const video = info?.links?.find(v =>
        v.type === 'video' &&
        /mp4/i.test(v.format || '')
      ) || info?.links?.find(v => v.type === 'video')

      if (!video) throw 'No se encontró video'

      result = {
        title: info?.title,
        uploader: info?.uploader,
        thumbnail: info?.thumbnail,
        duration: info?.duration,
        quality: video?.quality || 'Unknown',
        download: video.download_url
      }

      cache.set(text, {
        data: result,
        exp: Date.now() + TTL
      })
    }

    let caption =
`🎬 *YTMP4 Document*

✰ *Título:* ${result.title || '-'}
👤 *Uploader:* ${result.uploader || '-'}
⏱️ *Duración:* ${result.duration || '-'}
📺 *Calidad:* ${result.quality || '-'}

> Enviando video en documento...`

    await conn.sendMessage(m.chat, {
      document: { url: result.download },
      mimetype: 'video/mp4',
      fileName: `${result.title || 'video'}.mp4`,
      jpegThumbnail: await (await fetch(result.thumbnail)).buffer(),
      caption
    }, { quoted: m })

    await m.react('✅')

  } catch (e) {
    console.log(e)
    await m.react('✖️')
    m.reply(`✘ Error:\n${e.message || e}`)
  }
}

handler.help = ['ytmp4doc']
handler.tags = ['download']
handler.command = ['ytmp4doc', 'mp4doc']

export default handler