import fetch from "node-fetch"

let handler = async (m, { conn, text }) => {
  try {
    if (!text?.trim()) {
      return conn.reply(
        m.chat,
        "《✧》Por favor, ingresa el nombre de la canción que deseas buscar.",
        m
      )
    }

    await m.react("🔍")
    const searchUrl = `${global.APIs.light.url}/search/deezer?q=${encodeURIComponent(text)}&limit=1`
    const searchRes = await fetch(searchUrl)
    const searchJson = await searchRes.json()

    if (!searchJson.status || !searchJson.result?.length) {
      throw "No se encontraron resultados."
    }

    const song = searchJson.result[0]

    await conn.sendMessage(
      m.chat,
      {
        image: { url: song.thumbnail },
        caption: `
✦ *Deezer Downloader*

▢ *Título:* ${song.title}
▢ *Artista:* ${song.artist}
▢ *Álbum:* ${song.album}
▢ *Duración:* ${song.duration}
▢ *Link:* ${song.deezer_url}

> 🥢 Descargando audio...
`.trim()
      },
      { quoted: m }
    )

    const dlUrl = `${global.APIs.light.url}/download/deezer?url=${encodeURIComponent(song.deezer_url)}`
    const dlRes = await fetch(dlUrl)
    const dlJson = await dlRes.json()

    if (!dlJson.status || !dlJson.data?.dl) {
      throw "No se pudo obtener el audio."
    }

    await conn.sendMessage(
      m.chat,
      {
        audio: { url: dlJson.data.dl },
        mimetype: "audio/mpeg",
        fileName: dlJson.data.filename || `${song.title}.mp3`
      },
      { quoted: m }
    )

  } catch (e) {
    console.error(e)
    await conn.reply(
      m.chat,
      `❌ Error:\n${e}`,
      m
    )
  }
}

handler.command = ["deezer", "dz", "playdz"]
handler.tags = ["downloader"]
handler.help = ["deezer <canción>"]
handler.group = true

export default handler