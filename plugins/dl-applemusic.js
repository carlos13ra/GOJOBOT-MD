import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
  try {
    if (!text) return m.reply('✰ Ingresa nombre o link de Apple Music')

    const isLink = /music\.apple\.com/i.test(text)

    if (isLink) {
      await m.reply('🍜 Enviando audio...')

      const api = `${global.APIs.light.url}/download/applemusic?url=${encodeURIComponent(text)}`
      const res = await fetch(api)
      const json = await res.json()

      if (!json.status || !json.data?.dl_url) {
        throw 'No se pudo obtener el audio'
      }

      const audio = json.data

      return await conn.sendMessage(m.chat, {
        audio: { url: audio.dl_url },
        mimetype: 'audio/mp4',
        fileName: `${audio.title}.m4a`
      }, { quoted: m })
    }

    await m.reply('🍜 Buscando en Apple Music...')

    const searchApi = `${global.APIs.light.url}/search/applemusic?q=${encodeURIComponent(text)}&limit=1`
    const res = await fetch(searchApi)
    const json = await res.json()

    if (!json.status || !json.results?.length) {
      throw 'No se encontraron resultados'
    }

    const d = json.results[0]

    const caption = `✰ Título: ${d.title}
✿ Artista: ${d.artist}
❀ Álbum: ${d.album}
☁︎ Género: ${d.genre}
🎧 Duración: ${d.duration}
📅 Fecha: ${d.release_date}
🫒 Link : ${d.link}
`.trim()

    await conn.sendMessage(m.chat, {
      image: { url: d.cover },
      caption
    }, { quoted: m })

    const dlApi = `${global.APIs.light.url}/download/applemusic?url=${encodeURIComponent(d.link)}`
    const res2 = await fetch(dlApi)
    const json2 = await res2.json()

    if (!json2.status || !json2.data?.dl_url) {
      throw 'No se pudo obtener el audio'
    }

    const audio = json2.data

    await conn.sendMessage(m.chat, {
      audio: { url: audio.dl_url },
      mimetype: 'audio/mp4',
      fileName: `${audio.title}.m4a`
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    m.reply('✘ Error en Apple Music')
  }
}

handler.help = ['applemusic', 'apple']
handler.tags = ['search']
handler.command = ['applemusic', 'apple', 'applesearch']

export default handler