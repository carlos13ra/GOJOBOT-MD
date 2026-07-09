import fetch from 'node-fetch'

const handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    if (!text) {
      return m.reply(`❀ Uso correcto del comando : *${usedPrefix}${command}* <url>\n\n🍡 Plataformas soportadas:

⚥︎ Tiktok
⚥︎ Douyin
⚥︎ Capcut
⚥︎ Threads
⚥︎ Instagram
⚥︎ Facebook
⚥︎ Espn
⚥︎ Pinterest
⚥︎ imdb
⚥︎ imgur
⚥︎ ifunny
⚥︎ Izlesene
⚥︎ Reddit
⚥︎ Youtube
⚥︎ Twitter
⚥︎ Vimeo
⚥︎ Snapchat
⚥︎ Bilibili
⚥︎ Dailymotion
⚥︎ Sharechat
⚥︎ Likee
⚥︎ Linkedin
⚥︎ Tumblr
⚥︎ Hipi
⚥︎ Telegram
⚥︎ Getstickerpack
⚥︎ Bitchute
⚥︎ Febspot
⚥︎ 9GAG
⚥︎ ok.ru
⚥︎ Rumble
⚥︎ Streamable
⚥︎ Ted
⚥︎ SohuTv
⚥︎ Xvideos
⚥︎ Xnxx
⚥︎ Xiaohongshu
⚥︎ Ixigua
⚥︎ Weibo
⚥︎ Miaopai
⚥︎ Meipai
⚥︎ Xiaoying
⚥︎ National Video
⚥︎ Yingke
⚥︎ Sina
⚥︎ Vk-vkvideo
⚥︎ Soundcloud
⚥︎ Mixcloud
⚥︎ Spotify
⚥︎ Zingmp3
⚥︎ Bandcamp`)
    }

    const url = text.trim()
    try {
      new URL(url)
    } catch {
      return m.reply('🥢 La URL no es válida')
    }
    const res = await fetch(`${global.APIs.light.url}/download/aio/v2?url=${encodeURIComponent(url)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    const json = await res.json()
    if (!json.status || !json.result || json.result.error) {
      throw new Error(json.result?.error || 'Error al procesar la URL')
    }

    const { data } = json.result
    if (!data.medias || data.medias.length === 0) {
      throw new Error('No se encontraron archivos para descargar')
    }

    let infoText = `\`乂 DOWNLOAD AIO 乂\`\n\n`
    infoText += `🍡 *Plataforma:* ${data.source.toUpperCase()}\n`
    infoText += `🌵 *Autor:* ${data.author || 'Desconocido'}\n`
    infoText += `🌱 *Título:* ${data.title}\n`
    infoText += `🍃 *Duración:* ${data.duration || 'N/A'}\n`
    infoText += `🌷 *Tipo:* ${data.type}\n\n`
    infoText += `🍄 *Descargando...*`

    const msg = await conn.sendMessage(m.chat, { text: infoText }, { quoted: m })

    for (let i = 0; i < data.medias.length; i++) {
      const media = data.medias[i]
      
      try {
        const mediaRes = await fetch(media.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer': data.url
          }
        })

        if (!mediaRes.ok) {
          console.log(`Error descargando media ${i + 1}:`, mediaRes.statusText)
          continue
        }

        const buffer = await mediaRes.buffer()
        const fileName = `${data.title.replace(/[<>:"/\\|?*]/g, '')}.${media.extension}`

        if (media.type === 'audio' || media.type === 'music') {
          await conn.sendMessage(m.chat, {
            audio: buffer,
            mimetype: 'audio/mpeg',
            ptt: false,
            fileName: fileName
          }, { quoted: m })
        } else if (media.type === 'video') {
          await conn.sendMessage(m.chat, {
            video: buffer,
            mimetype: 'video/mp4',
            fileName: fileName,
            caption: `🍡 ${data.title}`
          }, { quoted: m })
        } else if (media.type === 'image') {
          await conn.sendMessage(m.chat, {
            image: buffer,
            caption: `🖼️ ${data.title}`
          }, { quoted: m })
        } else {
          await conn.sendMessage(m.chat, {
            document: buffer,
            fileName: fileName,
            mimetype: media.mimetype || 'application/octet-stream'
          }, { quoted: m })
        }

      } catch (err) {
        console.log(`Error enviando media ${i + 1}:`, err.message)
      }
    }

    let finalText = `\`乂 DOWNLOADER AIO 乂\`\n\n`
    finalText += ` ｡ *Plataforma:* ${data.source.toUpperCase()}\n`
    finalText += ` ｡ *Autor:* ${data.author || 'Desconocido'}\n`
    finalText += ` ｡ *Título:* ${data.title}\n`
    finalText += ` ｡ *Duración:* ${data.duration || 'N/A'}\n`
    finalText += ` ｡ *Tipo:* ${data.type}\n`
    finalText += `🍡 *Descarga completada*`

    await conn.sendMessage(m.chat, { text: finalText, edit: msg.key })
  } catch (error) {
    m.reply(`🍡 Error: ${error.message}`)
  }
}

handler.help = ['aio <url>']
handler.tags = ['downloader']
handler.command = ['aio', 'download', 'dl']

export default handler