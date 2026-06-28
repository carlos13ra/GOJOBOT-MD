import fetch from 'node-fetch'
import yts from 'yt-search'

let handler = async (m, { conn, text, command }) => {
  try {
    if (!text?.trim())
      return conn.reply(m.chat, `《✧》Por favor, menciona el nombre o URL del video que deseas descargar`, m)

    await m.react('🔍')
    const searchRes = await yts(text)
    if (!searchRes.videos || !searchRes.videos.length)
      throw 'No se encontraron resultados.'

    const video = searchRes.videos[0]
    const formatViews = (views) => {
      return views.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    }

    await conn.sendMessage(m.chat, {
        text: `› \`𝗍í𝗍ᥙᥣ᥆ :\` ${video.title}
› \`ᥲᥙ𝗍᥆r :\` ${video.author?.name || 'Desconocido'}
› \`᥎іs𝗍ᥲs :\` ${formatViews(video.views)}
› \`ძᥙrᥲᥴіóᥒ :\` ${video.timestamp}
› \`⍴ᥙᑲᥣіᥴᥲძ᥆ :\` ${video.ago || '```'}
› \`ᥱᥒᥣᥲᥴᥱ :\` ${video.url}
     
      _🥢 Descargando audio..._
      `,
        linkPreview: video.thumbnail ? (await global.shadow(
        { image: { url: video.thumbnail }}, 
        { upload: conn.waUploadToServer, mediaTypeOverride: 'thumbnail-link' }
      ).then(({ imageMessage }) => ({ 
        'canonical-url': video.url,
        'matched-text': video.url,
        title: `𖹭  ׄ  ְ 🍡 Y O U T U B E - M U S I C   ݁      ✩   ݂      ݁  `, 
        description: botname, 
        jpegThumbnail: imageMessage?.jpegThumbnail ? Buffer.from(imageMessage.jpegThumbnail) : undefined, 
        highQualityThumbnail: imageMessage || undefined 
      }))) : undefined,
        contextInfo: {
          mentionedJid: [m.sender],
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: channelRD.id,
            serverMessageId: '',
            newsletterName: channelRD.name
          },
        }
      }, { quoted: m });

    const dlRes = await fetch(`${global.APIs.light.url}/download/savetube?url=${encodeURIComponent(video.url)}&type=audio&quality=128`)
    const dlJson = await dlRes.json()

    if (!dlJson.status || !dlJson.data?.dl)
      throw 'No se pudo obtener el audio.'

    const audioUrl = dlJson.data.dl

    await conn.sendMessage(m.chat, {
      audio: { url: audioUrl },
      mimetype: 'audio/mpeg',
      fileName: `${video.title}.mp3`
    }, { quoted: m })

    await m.react('✔️')

  } catch (e) {
    conn.reply(m.chat, ` Error:\n${e}`, m)
  }
}

handler.command = ['play', 'audio']
handler.tags = ['download']
handler.help = ['play + <query/url>']
handler.group = true
export default handler