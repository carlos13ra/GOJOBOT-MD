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
      image: { url: video.thumbnail },
      caption: `› \`𝗍í𝗍ᥙᥣ᥆ :\` ${video.title}
› \`ᥲᥙ𝗍᥆r :\` ${video.author?.name || 'Desconocido'}
› \`᥎іs𝗍ᥲs :\` ${formatViews(video.views)}
› \`ძᥙrᥲᥴіóᥒ :\` ${video.timestamp}
› \`⍴ᥙᑲᥣіᥴᥲძ᥆ :\` ${video.ago || '```'}
› \`ᥱᥒᥣᥲᥴᥱ :\` ${video.url}
     
      _🥢 Descargando video..._
      `, ...fake
    }, { quoted: m })

    const dlRes = await fetch(`${global.APIs.light.url}/download/ytdl?q=${encodeURIComponent(video.title)}&format=mp4&quality=480`)
    const dlJson = await dlRes.json()

    if (!dlJson.status || !dlJson.result?.dl_url)
      throw 'No se pudo obtener el video.'

    const videoUrl = dlJson.result.dl_url

    await conn.sendMessage(m.chat, {
      video: { url: videoUrl },
      mimetype: 'video/mp4',
      fileName: `${dlJson.result.title}.mp4`
    }, { quoted: m })

    await m.react('✔️')

  } catch (e) {
    conn.reply(m.chat, ` Error:\n${e}`, m)
  }
}

handler.command = ['play2', 'video']
handler.tags = ['download']
handler.help = ['play2 + <query/url>']
handler.group = true
export default handler