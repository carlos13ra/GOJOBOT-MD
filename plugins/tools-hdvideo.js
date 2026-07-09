import fetch from 'node-fetch'
import FormData from 'form-data'

async function uploadVideo(buffer, mime) {
  const body = new FormData()
  body.append('files[]', buffer, `file.${mime.split('/')[1]}`)
  const res = await fetch('https://uguu.se/upload.php', { method: 'POST', body, headers: body.getHeaders() })
  const json = await res.json()
  return json.files?.[0]?.url
}

const fancyMode = true
const fontMap = {
  'a':'ᥲ','b':'ᑲ','c':'ᥴ','d':'ძ','e':'ᥱ','f':'𝖿','g':'g','h':'һ','i':'і','j':'ȷ','k':'k','l':'ᥣ','m':'m','n':'ᥒ','o':'᥆','p':'⍴','q':'𝗊','r':'r','s':'s','t':'𝗍','u':'ᥙ','v':'᥎','w':'ᥕ','x':'᥊','y':'ᥡ','z':'z',
  'A':'ᥲ','B':'ᑲ','C':'ᥴ','D':'ძ','E':'ᥱ','F':'𝖿','G':'g','H':'һ','I':'і','J':'ȷ','K':'k','L':'ᥣ','M':'m','N':'ᥒ','O':'᥆','P':'⍴','Q':'𝗊','R':'r','S':'s','T':'𝗍','U':'ᥙ','V':'᥎','W':'ᥕ','X':'᥊','Y':'ᥡ','Z':'z',
  '0':'0','1':'1','2':'2','3':'3','4':'4','5':'5','6':'6','7':'7','8':'8','9':'9'
}
const toFancy = str => fancyMode ? str.split('').map(c => fontMap[c] || c).join('') : str

let handler = async (m, { conn, text, usedPrefix, command }) => {
  let q = m.quoted ? m.quoted : m
  let mimeType = (q.msg || q).mimetype || ''

  const input = (text || '').trim().toLowerCase()
  const resMap = { '2': '2k', '4': '4k', '2k': '2k', '4k': '4k' }
  const resolution = resMap[input]

  if (!resolution) return conn.reply(m.chat, toFancy(`❀ Uso: ${usedPrefix + command} 2 o 4\n\nEjemplo:\n${usedPrefix + command} 2  →  2K\n${usedPrefix + command} 4  →  4K`), m)
  if (!/video\//.test(mimeType)) return conn.reply(m.chat, toFancy(`🥢 Responde un video con el comando.`), m)

  await m.react('🕒')
  let msg = await conn.sendMessage(m.chat, { text: toFancy(`乂 HD VIDEO 乂\n✩ Subiendo video...`) }, { quoted: m })

  try {
    const buffer = await q.download()

    const videoUrl = await uploadVideo(buffer, mimeType)
    if (!videoUrl) throw new Error('No se pudo subir el video')

    await conn.sendMessage(m.chat, {
      text: toFancy(`乂 HD VIDEO 乂\n✩ Procesando en ${resolution.toUpperCase()}...\n✩ Esto puede tardar unos minutos`),
      edit: msg.key
    })

    const apiUrl = `${global.APIs.light.url}/tools/video-enhancer?url=${encodeURIComponent(videoUrl)}&resolution=${resolution}`
    const res = await fetch(apiUrl, { timeout: 120000 })
    const json = await res.json()

    if (!json.status || !json.data?.download) throw new Error(JSON.stringify(json))

    await conn.sendMessage(m.chat, {
      text: toFancy(`乂 HD VIDEO 乂\n✩ Enviando resultado...`),
      edit: msg.key
    })

    await conn.sendMessage(m.chat, {
      video: { url: json.data.download },
      mimetype: 'video/mp4',
      fileName: `hdvideo_${resolution}.mp4`,
      caption: toFancy(`\`乂 HD VIDEO  -  ENHANCE 乂\`\n*✩ Resolución:* ${resolution.toUpperCase()}\n*✩ Job ID:* ${json.data.job_id}\n*✩ Usos restantes:* ${json.data.remaining_free_times}`)
    }, { quoted: m })

    await conn.sendMessage(m.chat, {
      text: toFancy(`\`乂 HD VIDEO  -  ENHANCE 乂\`\n> ✅ Video mejorado correctamente\n\`🌵 Resolución:\` ${resolution.toUpperCase()}\n\`🔗 Output:\` Listo\n🌱 Procesado con éxito.`),
      edit: msg.key
    })

    await m.react('✔️')

  } catch (e) {
    await conn.sendMessage(m.chat, { delete: msg.key })
    await m.react('✖️')
    conn.reply(m.chat, toFancy(`⚠︎ Error: ${e.message}`), m)
  }
}

handler.help = ['hdv <2|4>']
handler.tags = ['tools', 'ai']
handler.command = ['hdv', 'hdvideo', 'enhancevid']
handler.group = true

export default handler