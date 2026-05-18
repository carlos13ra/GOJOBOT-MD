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
      let dl = json?.data?.dl_url

      if (!json.status || !dl) {

        const api2 = `${global.APIs.light.url}/download/aplemate?url=${encodeURIComponent(text)}`
        const res2 = await fetch(api2)
        const json2 = await res2.json()

        if (
          !json2.status ||
          !json2.result?.success ||
          !json2.result?.download_link
        ) {
          throw 'No se pudo obtener el audio'
        }

        dl = json2.result.download_link

        return await conn.sendMessage(m.chat, {
          audio: { url: dl },
          mimetype: 'audio/mp4',
          fileName: `${json2.result.title}.m4a`
        }, { quoted: m })
      }

      return await conn.sendMessage(m.chat, {
        audio: { url: dl },
        mimetype: 'audio/mp4',
        fileName: `${json.data.title}.m4a`
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

    let dl = json2?.data?.dl_url
    let title = json2?.data?.title || d.title

    if (!json2.status || !dl) {

      const api3 = `${global.APIs.light.url}/download/aplemate?url=${encodeURIComponent(d.link)}`
      const res3 = await fetch(api3)
      const json3 = await res3.json()

      if (
        !json3.status ||
        !json3.result?.success ||
        !json3.result?.download_link
      ) {
        throw 'No se pudo obtener el audio'
      }

      dl = json3.result.download_link
      title = json3.result.title
    }

    await conn.sendMessage(m.chat, {
      audio: { url: dl },
      mimetype: 'audio/mp4',
      fileName: `${title}.m4a`
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