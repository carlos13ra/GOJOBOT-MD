import yts from 'yt-search'

let handler = async (m, { conn, text, usedPrefix, command }) => {

  if (!text) {
    return m.reply(`❀ Ingresa lo que quieres buscar\n\n> Ejemplo:\n${usedPrefix + command} stellar`)
  }

  try {
    const search = await yts(text)
    const videos = search.videos.slice(0, 15)

    if (!videos.length) {
      throw 'No se encontraron resultados'
    }

    let caption = `🫒 *YouTube Search*\n`
    caption += `🍜 *Búsqueda:* ${text}\n`
    caption += `🌳 *Resultados:* ${videos.length}\n\n`

    for (let i = 0; i < videos.length; i++) {

      let v = videos[i]

      caption +=
`*[ ${i + 1}. ${v.title} ]*

*👤 Autor :* ${v.author.name}
*⏱️ Duración :* ${v.timestamp}
*👁️ Vistas :* ${v.views.toLocaleString()}
*📅 Subido :* ${v.ago}
*🔗 Link :* ${v.url}\n\n\n`
    }

    await conn.sendMessage(m.chat, {
      image: { url: videos[0].thumbnail },
      caption
    }, { quoted: m })

  } catch (e) {
    console.log(e)
    m.reply(`✘ Error:\n${e.message || e}`)
  }
}

handler.help = ['ytsearch *« ǫᴜᴇʀʏ »*']
handler.tags = ['search']
handler.command = ['yts', 'ytsearch']

export default handler