import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix }) => {
  const fancyMode = true

  const fontMap = {
    'a':'ᥲ','b':'ᑲ','c':'ᥴ','d':'ძ','e':'ᥱ','f':'𝖿','g':'g','h':'һ','i':'і','j':'ȷ','k':'k','l':'ᥣ','m':'m','n':'ᥒ','o':'᥆','p':'⍴','q':'𝗊','r':'r','s':'s','t':'𝗍','u':'ᥙ','v':'᥎','w':'ᥕ','x':'᥊','y':'ᥡ','z':'z','1':'1','2':'2','3':'3','4':'4','5':'5','6':'6','7':'7','8':'8','9':'9','0':'0',
    'A':'ᥲ','B':'ᑲ','C':'ᥴ','D':'ძ','E':'ᥱ','F':'𝖿','G':'g','H':'һ','I':'і','J':'ȷ','K':'k','L':'ᥣ','M':'m','N':'ᥒ','O':'᥆','P':'⍴','Q':'𝗊','R':'r','S':'s','T':'𝗍','U':'ᥙ','V':'᥎','W':'ᥕ','X':'᥊','Y':'ᥡ','Z':'z'
  }
  
  const toFancy = (str) => fancyMode ? str.split('').map(c => fontMap[c] || c).join('') : str

  const formatDuration = (sec) => {
    const h = Math.floor(sec / 3600)
    const mn = Math.floor((sec % 3600) / 60)
    const s = sec % 60
    let str = ''
    if (h > 0) str += `${h} hora${h > 1 ? 's' : ''}, `
    if (mn > 0) str += `${mn} minuto${mn > 1 ? 's' : ''}, `
    str += `${s} segundo${s !== 1 ? 's' : ''}`
    return str
  }

  const getFileSize = async (url) => {
    try {
      const head = await fetch(url, { method: 'HEAD' })
      const size = head.headers.get('content-length')
      if (!size) return 'Desconocido'
      let bytes = Number(size)
      if (bytes >= 1024 * 1024 * 1024) return (bytes / 1024 / 1024 / 1024).toFixed(2) + ' GB'
      return (bytes / 1024 / 1024).toFixed(2) + ' MB'
    } catch {
      return 'Desconocido'
    }
  }

  const fetchVideo = async (url) => {
    try {
      const res = await fetch(`${global.APIs.light.url}/download/yt-dlp?url=${encodeURIComponent(url)}`, { timeout: 15000 })
      const json = await res.json()

      if (!json.status || !json.data) throw new Error('API sin datos')

      const data = json.data
      
      const dlUrl = data.best || data.bestAudio
      if (!dlUrl) throw new Error('No hay enlace de descarga disponible')

      const check = await fetch(dlUrl, { method: 'HEAD' })
      if (!check.ok) throw new Error(`Link caído (${check.status})`)

      return {
        title: data.title || 'Video sin título',
        duration: data.duration || 0,
        dlUrl: dlUrl,
        uploader: data.uploader || 'Desconocido',
        thumbnail: data.thumbnail,
        viewCount: data.viewCount || 0,
        likeCount: data.likeCount || 0,
        creator: json.creator || 'Shadow',
        source: data.source || 'yt-dlp'
      }
    } catch (e) {
      throw new Error(`Error en descarga: ${e.message}`)
    }
  }

  if (!text) return conn.reply(m.chat, toFancy(`❀ Manda el link de YouTube\nEj: ${usedPrefix}ytvdoc https://youtu.be/QqYRYtV_90c`), m)

  const startTime = Date.now()
  await m.react('🕒')
  let msg = await conn.sendMessage(m.chat, { text: toFancy(`乂 YT DOWNLOAD 乂\n✩ Procesando video...`) }, { quoted: m })

  try {
    const { title, duration, dlUrl, uploader, thumbnail, viewCount, likeCount, creator, source } = await fetchVideo(text.trim())

    await conn.sendMessage(m.chat, {
      text: toFancy(`乂 YOUTUBE - DOWNLOAD 乂\n✩ Descargando...\n✩ Título: ${title.slice(0, 40)}`),
      edit: msg.key
    })

    const sizeReal = await getFileSize(dlUrl)

    await conn.sendMessage(m.chat, {
      document: { url: dlUrl },
      mimetype: 'video/mp4',
      caption: toFancy(`\`乂 YOUTUBE  -  DOWNLOAD 乂\`
*✩ Título:* ${title}
*✩ Canal:* ${uploader}
*✩ Duración:* ${formatDuration(duration)}
*✩ Tamaño:* ${sizeReal}
*✩ Vistas:* ${viewCount.toLocaleString()}
*✩ Likes:* ${likeCount.toLocaleString()}
*✩ Source:* ${source}
> 🌱 Archivo enviado correctamente`),
      fileName: `${title.slice(0, 30)}.mp4`
    }, { quoted: m })

    const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2)
    await conn.sendMessage(m.chat, {
      text: toFancy(`\`乂 YOUTUBE  -  DOWNLOAD 乂\`
> ✅ Descarga completada
\`🥢 Tiempo:\` ${timeTaken} seg
\`🌵 Formato:\` MP4 (360p)
\`🧊 Tamaño:\` ${sizeReal}
🌱 ¡Disfruta tu video!`),
      edit: msg.key
    })

    await m.react('✔️')

  } catch (e) {
    await conn.sendMessage(m.chat, { delete: msg.key })
    await m.react('✖️')
    conn.reply(m.chat, toFancy(`⚠︎ Error: ${e.message}`), m)
  }
}

handler.help = ['ytvdoc <url>']
handler.tags = ['download']
handler.command = ['ytvdoc', 'ytdoc', 'yt']
handler.group = true

export default handler
