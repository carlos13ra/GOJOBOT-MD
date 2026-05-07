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
      const audio = info?.links?.find(v => v.type === 'audio')

      if (!audio) throw 'No se encontró audio'

      result = {
        title: info?.title,
        uploader: info?.uploader,
        thumbnail: info?.thumbnail,
        duration: info?.duration,
        download: audio.download_url
      }

      cache.set(text, {
        data: result,
        exp: Date.now() + TTL
      })
    }

    let caption =
`🎧 *YTMP3 Document*

✰ *Título:* ${result.title || '-'}
👤 *Uploader:* ${result.uploader || '-'}
⏱️ *Duración:* ${result.duration || '-'}

> Enviando audio en documento...`

    await conn.sendMessage(m.chat, {
      document: { url: result.download },
      mimetype: 'audio/mpeg',
      fileName: `${result.title || 'audio'}.mp3`,
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

handler.help = ['ytmp3doc < url >']
handler.tags = ['download']
handler.command = ['ytmp3doc']

export default handler