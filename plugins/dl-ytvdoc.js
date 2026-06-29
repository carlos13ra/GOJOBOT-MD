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

  // Intenta con API primaria (aio/v2), si falla o da 403 usa la secundaria (ytmp4)
  const fetchVideo = async (url) => {
    // ── API PRIMARIA ──
    try {
      const res = await fetch(`https://api--shadowcorexyz.replit.app/download/aio/v2?url=${encodeURIComponent(url)}`, { timeout: 15000 })
      const json = await res.json()

      if (!json.status || !json.result?.data?.medias) throw new Error('sin datos')

      const data = json.result.data
      const video360 = data.medias.find(v => v.quality === 'mp4 (360p)' && v.type === 'video')
      if (!video360) throw new Error('sin 360p')

      // Verificar que el link no dé 403
      const check = await fetch(video360.url, { method: 'HEAD' })
      if (!check.ok) throw new Error(`link 403 o caído (${check.status})`)

      return {
        title: data.title,
        duration: data.duration,
        dlUrl: video360.url,
        creator: json.creator || 'Shadow',
        source: 'API1'
      }
    } catch (e1) {
      console.log('[ytv] API1 falló:', e1.message, '— intentando API2...')
    }

    // ── API SECUNDARIA ──
    const res2 = await fetch(`https://api--shadowcorexyz.replit.app/download/ytmp4?url=${encodeURIComponent(url)}&quality=360p`, { timeout: 15000 })
    const json2 = await res2.json()

    if (!json2.status || !json2.data?.dl) throw new Error('API2 sin datos')

    return {
      title: json2.data.title,
      duration: json2.data.duration,
      dlUrl: json2.data.dl,
      creator: json2.creator || 'Shadow',
      source: 'API2'
    }
  }

  if (!text) return conn.reply(m.chat, toFancy(`❀ Manda el link de YouTube\nEj: ${usedPrefix}ytvdoc https://youtube.com/shorts/xxx`), m)

  const startTime = Date.now()
  await m.react('🕒')
  let msg = await conn.sendMessage(m.chat, { text: toFancy(`乂 YT DOWNLOAD 乂\n✩ Buscando 360p...`) }, { quoted: m })

  try {
    const { title, duration, dlUrl, creator, source } = await fetchVideo(text.trim())

    await conn.sendMessage(m.chat, {
      text: toFancy(`\`乂 YOUTUBE - DOWNLOAD 乂\`\n✩ Enviando 360p...\n✩ Título: ${title.slice(0, 40)}`),
      edit: msg.key
    })

    const sizeReal = await getFileSize(dlUrl)

    await conn.sendMessage(m.chat, {
      document: { url: dlUrl },
      mimetype: 'video/mp4',
      caption: toFancy(`\`乂 YOUTUBE  -  DOWNLOAD 乂\`\n*✩ Título:* ${title}\n*✩ Calidad:* 360p\n*✩ Duración:* ${formatDuration(duration)}\n*✩ Tamaño:* ${sizeReal}\n✩ By ${creator}`),
      fileName: `${title.slice(0, 30)}.mp4`
    }, { quoted: m })

    const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2)
    await conn.sendMessage(m.chat, {
      text: toFancy(`\`乂 YOUTUBE  -  DOWNLOAD 乂\`\n> ✅ Descarga completa...\n\`🥢 Fetch:\` ${timeTaken} seg\n\`🌵 Calidad:\` 360p\n\`🧊 Tamaño:\` ${sizeReal}\n\`🔌 Source:\` ${source}\n🌱 Archivo enviado correctamente.`),
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
handler.command = ['ytvdoc', 'ytmp4doc']
handler.group = true

export default handler