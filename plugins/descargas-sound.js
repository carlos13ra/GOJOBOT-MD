import fetch from 'node-fetch'

const handler = async (m, { conn, text }) => {
  if (!text)
    return m.reply('🎵 *Escribe el nombre de la canción a buscar en SoundCloud.*')

  try {
    const searchRes = await fetch(`${global.APIs.light.url}/search/soundcloud?q=${encodeURIComponent(text)}`)
    const searchJson = await searchRes.json()

    if (!searchJson.status || !searchJson.results?.length)
      return m.reply('❌ No se encontraron resultados.')

    const first = searchJson.results[0]

    const caption = `
╭━━━⬣ 🎧 *SoundCloud Result*
┃ *Título:* ${first.title}
┃ *Artista:* ${first.artist}
┃ *Duración:* ${first.duration}
┃ *Likes:* ${first.likes}
┃ *Reproducciones:* ${first.plays}
┃ *Comentarios:* ${first.comments}
┃ *Publicado:* ${first.created}
┃ *Enlace:* ${first.link || 'No disponible'}
╰━━━⬣

⬇️ Descargando audio...
`.trim()

    await conn.sendMessage(
      m.chat,
      { image: { url: first.image }, caption },
      { quoted: m }
    )

    if (!first.link)
      return m.reply('❌ Este resultado no tiene enlace válido para descargar.')

    const downloadRes = await fetch(`${global.APIs.light.url}/download/soundcloud?url=${encodeURIComponent(first.link)}`)
    const downloadJson = await downloadRes.json()

    if (!downloadJson.status || !downloadJson.result?.download_url)
      return m.reply('❌ No se pudo descargar el audio.')

    const track = downloadJson.result
    const totalSec = Math.floor(track.duration / 1000)
    const duration = `${Math.floor(totalSec / 60)}:${(totalSec % 60)
      .toString()
      .padStart(2, '0')}`

    await conn.sendMessage(
      m.chat,
      {
        audio: { url: track.download_url },
        mimetype: 'audio/mpeg',
        fileName: `${track.title}.mp3`,
        contextInfo: {
          externalAdReply: {
            title: track.title,
            body: null,
            thumbnailUrl: track.artwork,
            sourceUrl: track.permalink,
            mediaType: 1,
            renderLargerThumbnail: false
          }
        }
      },
      { quoted: m }
    )

  } catch (err) {
    console.error(err)
    m.reply('⚠️ Error al procesar la solicitud.')
  }
}

handler.command = ['sound', 'soundcloud']
handler.help = ['sound <nombre>']
handler.tags = ['download']

export default handler