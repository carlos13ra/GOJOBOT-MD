import axios from 'axios'
import fetch from 'node-fetch'
import { prepareWAMessageMedia } from '@whiskeysockets/baileys'

let handler = async (m, { conn, text }) => {
  if (!text)
    return conn.reply(m.chat, '`ꕥ` Ingrese el *nombre* de una canción de *soundcloud*.', m)

  try {
    const api = `${global.APIs.light.url}/api/play/soundcloud?q=${encodeURIComponent(text)}`
    const res = await axios.get(api, { timeout: 20000 })

    if (!res.data.status || !res.data.result)
      throw 'No se encontró la canción.'

    const data = res.data.result
    const { title, artist, duration, created, plays, likes, comments, genre, description, image, link, url
    } = data

    const linkPreview = image ? (await prepareWAMessageMedia({ image: { url: image }}, { upload: conn.waUploadToServer, mediaTypeOverride: 'thumbnail-link' }).then(({ imageMessage }) => ({ 
      'canonical-url': link, 
      'matched-text': link, 
      title: `✧ Soundcloud • Music ✧`, 
      description: `🍡 ${artist}`, 
      jpegThumbnail: imageMessage?.jpegThumbnail ? Buffer.from(imageMessage.jpegThumbnail) : undefined, 
      highQualityThumbnail: imageMessage || undefined 
    }))) : undefined

    await conn.sendMessage(m.chat, {
      text: `ׄ⬭ *Título :* ${title}
ׄ⬭ *Artista :* ${artist}
ׄ⬭ *Duración:* ${duration}
ׄ⬭ *Likes :* ${likes}
ׄ⬭ *Comentarios :* ${comments}
ׄ⬭ *Play :* ${plays}
ׄ⬭ *Genero :* ${genre}
ׄ⬭ *Publicado :* ${created}
ׄ⬭ *link :* ${link}`,
      linkPreview,
      contextInfo: {
        mentionedJid: [m.sender],
        isForwarded: true
      }
    }, { quoted: m })

    const audioRes = await fetch(url)

    if (!audioRes.ok) throw 'Error al descargar el audio.'

    const buffer = await audioRes.buffer()

    await conn.sendMessage(m.chat, {
      audio: buffer,
      mimetype: 'audio/mpeg',
      fileName: `${title}.mp3`,
      ptt: false,
      contextInfo: {
        externalAdReply: {
          title: title,
          body: artist,
          thumbnailUrl: image,
          sourceUrl: link,
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    conn.reply(m.chat, `Error al buscar o descargar en SoundCloud.`, m)
  }
}

handler.help = ['soundcloud']
handler.tags = ['download']
handler.command = ['soundcloud', 'scplay', 'scdl']

export default handler