import fetch from "node-fetch"

let handler = async (m, { conn, text }) => {
  try {
    if (!text?.trim()) {
      return conn.reply(m.chat, "《✧》Por favor, ingresa el nombre de la canción que deseas buscar.", m)
    }
    const searchRes = await fetch(`${global.APIs.light.url}/search/deezer?q=${encodeURIComponent(text)}&limit=1`)
    const searchJson = await searchRes.json()
    if (!searchJson.status || !searchJson.data?.length) {
      throw "No se encontraron resultados."
    }

    const song = searchJson.data[0]
    await conn.sendMessage(m.chat, { image: { url: song.thumbnail }, caption: `✦ *Deezer Downloader*

▢ *Título:* ${song.title}
▢ *Artista:* ${song.artist}
▢ *Álbum:* ${song.album}
▢ *Duración:* ${song.duration}
▢ *Fecha:* ${song.date}
▢ *Rank:* ${song.rank}
▢ *Explícito:* ${song.explicit ? "Sí" : "No"}
▢ *ID:* ${song.id}
▢ *Link:* ${song.link}

> 🥢 Descargando audio...`.trim() }, { quoted: m })

    const dlRes = await fetch(`${global.APIs.light.url}/download/deezer?url=${encodeURIComponent(song.link)}`)
    const dlJson = await dlRes.json()

    if (!dlJson.status || !dlJson.data?.downloadUrl) {
      throw "No se pudo obtener el audio."
    }

    const d = dlJson.data
    const fileName = `${d.artist} - ${d.title}.mp3`

    await conn.sendMessage(m.chat, {
      audio: { url: d.downloadUrl },
      mimetype: "audio/mpeg",
      fileName
    }, { quoted: m })

    await m.react("✔️")

  } catch (e) {
    await conn.reply(m.chat, `🌷 Error:\n${e}`, m)
  }
}

handler.command = ["deezer", "dz", "playdz"]
handler.tags = ["downloader"]
handler.help = ["deezer *« ǫᴜᴇʀʏ »*"]
handler.group = true

export default handler