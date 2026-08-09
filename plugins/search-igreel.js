import fetch from 'node-fetch'

async function downloadDirectLink(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  })
  return await res.buffer()
}

var shadow = async (m, { text, usedPrefix, command, conn }) => {
  if (!text) return m.reply(`ꕥ *Ingrese el término de búsqueda*\n\n*Ejemplo:* ${usedPrefix}${command} Umi`)

  await m.react('🔍')

  try {
    const searchUrl = `${global.APIs.light.url}/search/Reels?q=${encodeURIComponent(text)}`
    const searchRes = await fetch(searchUrl)
    const searchJson = await searchRes.json()

    if (!searchJson.status || !searchJson.result || searchJson.result.length === 0) {
      return m.reply('No se encontraron reels para tu búsqueda.')
    }

    const maxReels = searchJson.result.slice(0, 10)
    
    await m.react('⏳')
    const medias = []

    for (let i = 0; i < maxReels.length; i++) {
      const reelData = maxReels[i]
      
      try {
     
        const downloadUrl = `${global.APIs.light.url}/download/igdl/v2?url=${encodeURIComponent(reelData.url)}`
        const downloadRes = await fetch(downloadUrl)
        const downloadJson = await downloadRes.json()

        if (!downloadJson.status || !downloadJson.result.media.videos || downloadJson.result.media.videos.length === 0) {
          console.warn(`[Reel ${i + 1}] No tiene video disponible`)
          continue
        }

        const videoUrl = downloadJson.result.media.videos[0].url
        const buffer = await downloadDirectLink(videoUrl)

        let caption = `🌵 *INSTAGRAM REELS (${i + 1}/${maxReels.length})*\n\n`
        caption += ` ° *Usuario:* @${downloadJson.result.author.username}\n`
        caption += ` ° *Nombre:* ${downloadJson.result.author.fullName}\n`
        caption += ` ° *Likes:* ${downloadJson.result.metadata.likeCount}\n`
        caption += ` ° *Comentarios:* ${downloadJson.result.metadata.commentCount}\n`
        caption += ` ° *Fecha:* ${downloadJson.result.metadata.createTime}\n`
        caption += `\n_${reelData.title || 'Sin descripción'}_`
        
        medias.push({
          type: 'video',
          data: buffer,
          caption: caption
        })

      } catch (err) {
        console.error(`[Error procesando reel ${i + 1}]`, err.message)
      }
    }

    if (medias.length === 0) {
      return m.reply('No se pudo procesar ningún reel correctamente.')
    }

    await conn.sendSylphy(m.chat, medias, { quoted: m })
    await m.react('✅')
  } catch (e) {
    m.reply(`Ocurrió un error: \`\`\`${e.message}\`\`\``)
  }
}

shadow.help = ['igreel', 'instagramreel', 'igvid']
shadow.tags = ['search']
shadow.command = ['igreel', 'igvid', 'instagramreel']

export default shadow