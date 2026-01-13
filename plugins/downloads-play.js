import fetch from "node-fetch"
import yts from "yt-search"
import axios from "axios"

const handler = async (m, { conn, text, command }) => {
  try {
    if (!text?.trim())
      return conn.reply(m.chat, `*▶️ Por favor, ingresa el nombre o enlace del video.* ☃️`, m)

    await m.react('🎶')

    const videoMatch = text.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/))([a-zA-Z0-9_-]{11})/)
    const query = videoMatch ? `https://youtu.be/${videoMatch[1]}` : text

    const search = await yts(query)
    const result = search.videos?.[0]
    if (!result) throw 'No se encontraron resultados.'

    const { title, thumbnail, timestamp, views, ago, url, author } = result

    const thumb = (await conn.getFile(thumbnail)).data

    await conn.sendMessage(
      m.chat,
      {
        image: thumb,
        caption: `❄️ *Título:* ☃️ ${title}
> ▶️ *Canal:* ${author.name || 'Desconocido'}
> 💫 *Vistas:* ${formatViews(views)}
> ⏳ *Duración:* ${timestamp}
> ✨ *Publicado:* ${ago}
> 🌐 *Link:* ${url}`
      },
      { quoted: m }
    )

    if (['play', 'audio'].includes(command)) {
      await m.react('🎧')

      const api = `https://sylphy.xyz/download/ytmp3?url=${encodeURIComponent(url)}&api_key=sylphy-aJPapTL76Z_1768347962499_h55ioq6hw`
      const res = await fetch(api)
      const json = await res.json()

      if (!json.status || !json.result?.dl_url)
        throw 'No se pudo obtener el audio.'

      await conn.sendMessage(
        m.chat,
        {
          audio: { url: json.result.dl_url },
          mimetype: 'audio/mpeg',
          fileName: `${title}.mp3`
        },
        { quoted: m }
      )

      await m.react('✔️')
    }

    if (['play2', 'video'].includes(command)) {
      await m.react('🎬')

      const { data } = await axios.post(
        "https://api-sky.ultraplus.click/youtube/resolve",
        {
          url,
          type: "video",
          quality: "720"
        },
        {
          headers: {
            "Content-Type": "application/json",
            apikey: "Shadow"
          }
        }
      )

      if (!data?.status || !data?.result?.url)
        throw 'No se pudo obtener el video.'

      await conn.sendMessage(
        m.chat,
        {
          video: { url: data.result.url },
          mimetype: 'video/mp4',
          fileName: `${title}.mp4`
        },
        { quoted: m }
      )

      await m.react('✔️')
    }

  } catch (e) {
    await m.react('✖️')
    console.error(e)
    conn.reply(m.chat, `⚠️ Error:\n${e}`, m)
  }
}

handler.command = handler.help = ['play', 'play2', 'audio', 'video']
handler.tags = ['download']
export default handler

function formatViews(v) {
  if (!v) return 'N/A'
  if (v >= 1e9) return (v / 1e9).toFixed(1) + 'B'
  if (v >= 1e6) return (v / 1e6).toFixed(1) + 'M'
  if (v >= 1e3) return (v / 1e3).toFixed(1) + 'K'
  return v.toString()
}