import fetch from 'node-fetch'
import Jimp from 'jimp'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    if (!text) {
      return m.reply(`《✧》 Ingresa el nombre de la canción\n\nEjemplo: ${usedPrefix}${command} goth slowed`)
    }

    const res = await fetch(
      `${global.APIs.light.url}/api/play/spotify?q=${encodeURIComponent(text)}`
    )
    const data = await res.json()

    if (!data.status || !data.result) {
      return m.reply('《✧》 No se encontraron canciones')
    }

    const track = data.result

    const info = `╔═══════ ≪ - ≫ ═══════╗
║ 🍡 *SPOTIFY - MUSIC*
╠═════════════════════╣
║ ° *Título:* ${track.title}
║ ° *Artista:* ${track.artist}
║ ° *Álbum:* ${track.album}
║ ° *Duración:* ${track.duration}
║ ° *Publicado:* ${track.publish}
║ ° *Tamaño:* ${track.size}
║ ° *Link:* ${track.link}
╚═══════ ≪ - ≫ ═══════╝`

    await conn.sendFile(m.chat, track.image, 'spotify.jpg', info, m, fake)
    let thumbDoc = null;
    try {
      const img = await Jimp.read(track.image);
      img.resize(300, Jimp.AUTO).quality(70);
      thumbDoc = await img.getBufferAsync(Jimp.MIME_JPEG);
    } catch (err) {
      console.log("⚠️ Error al procesar miniatura:", err.message);
      thumbDoc = Buffer.alloc(0);
    }

    await conn.sendMessage(m.chat, { 
      document: { url: track.download },
      mimetype: 'audio/mpeg',
      fileName: `${track.title}.mp3`,
      jpegThumbnail: thumbDoc
    }, { quoted: m })
    
  } catch (e) {
    m.reply(`《✧》 Error: \`\`\`${e.message}\`\`\``)
  }
}

handler.help = ['spotifyplay <canción>', 'spplay <canción>']
handler.tags = ['music']
handler.command = ['spotifyplay', 'spplay']
handler.limit = true

export default handler