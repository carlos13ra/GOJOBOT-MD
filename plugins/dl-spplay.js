import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    if (!text) {
      return m.reply(`《✧》 Ingresa el nombre de la canción\n\nEjemplo: ${usedPrefix}${command} goth slowed`)
    }

    const quality = text.includes('320') ? '320' : '128'
    const query = text.replace(/320|128/g, '').trim()

    await m.react('🔍')

    const res = await fetch(
      `${global.APIs.light.url}/api/play/spotify?q=${encodeURIComponent(query)}&quality=${quality}`
    )
    const data = await res.json()

    if (!data.status || !data.shadow || data.shadow.length === 0) {
      await m.react('❌')
      return m.reply('《✧》 No se encontraron canciones')
    }

    const track = data.shadow[0]

    const info = `╔═══════ ≪ - ≫ ═══════╗
║ 🍡 *SPOTIFY - MUSIC*
╠═════════════════════╣
║ ° *Título:* ${track.title}
║ ° *Artista:* ${track.artist}
║ ° *Álbum:* ${track.album}
║ ° *Duración:* ${track.duration}
║ ° *Calidad:* ${track.bitrate}
║ ° *Publicado:* ${track.publish}
║ ° *Tamaño:* ${track.size}
║ ° *Link:* ${track.url}
╚═══════ ≪ - ≫ ═══════╝`

    await conn.sendFile(m.chat, track.image, 'spotify.jpg', info, m)
    
    await m.react('⏳')
    await conn.sendMessage(m.chat, { 
     audio: { url: track.dl },
     mimetype: 'audio/mpeg',
     fileName: `${track.title}.mp3` },
   { quoted: m })
    
    await m.react('✅')

  } catch (e) {
    m.reply(`《✧》 Error: \`\`\`${e.message}\`\`\``)
  }
}

handler.help = ['spotifyplay <canción> [128|320]', 'spplay <canción> [128|320]']
handler.tags = ['downloader', 'music']
handler.command = ['spotifyplay', 'spplay', 'song', 'music']

export default handler