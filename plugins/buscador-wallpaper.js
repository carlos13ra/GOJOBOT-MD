import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text)
    return m.reply(`✳️ Ejemplo de uso:\n${usedPrefix + command} Naruto`)

  try {
    let res = await fetch(`https://xrljosedevapi.vercel.app/search/wallpaper?query=${encodeURIComponent(text)}`)
    let data = await res.json()

    if (!data.status || !data.data?.length)
      return m.reply(`No se encontraron wallpapers para "${text}"`)

    let result = data.data[Math.floor(Math.random() * data.data.length)]

    let txt = `
🎨 *Wallpaper encontrado* 🌲
🪴 *Título:* ${result.title || "Sin título"}


🪺 *Descargar:* 
${result.downloadUrl}
`

    await conn.sendFile(
      m.chat,
      result.previewUrl || result.imageUrl,
      'wallpaper.jpg',
      txt,
      m
    )

  } catch (e) {
    console.error(e)
    m.reply(" Ocurrió un error al buscar wallpapers.")
  }
}

handler.help = ['wallpaper <texto>']
handler.tags = ['internet', 'img']
handler.command = ['wallpaper', 'fondos', 'wall']

export default handler