import moment from 'moment-timezone'

let handler = async (m, { conn, usedPrefix }) => {
  try {
    // ───── USUARIO ─────
    let userId = m.mentionedJid?.[0] || m.sender
    let userData = global.db.data.users?.[userId] || {}

    let name = await conn.getName(userId)
    let exp = userData.exp || 0
    let level = userData.level || 0
    let role = userData.role || 'Sin rango'

    // ───── BOT ─────
    let uptime = clockString(process.uptime() * 1000)
    let totalreg = Object.keys(global.db.data.users || {}).length
    let totalCommands = Object.keys(global.plugins || {}).length

    // ───── FECHA ─────
    let hora = moment.tz('America/Lima').format('HH:mm:ss')
    let fecha = moment.tz('America/Lima').format('DD [de] MMMM YYYY')
    let dia = moment.tz('America/Lima').format('dddd')

    // ───── VIDEO ─────
    let videos = [
      'https://files.catbox.moe/vvrxck.mp4',
      'https://files.catbox.moe/eisgt7.mp4',
      'https://files.catbox.moe/fazi1o.mp4'
    ]
    let video = videos[Math.floor(Math.random() * videos.length)]

    // ───── EMOJIS ─────
    const emojis = {
      main: '🎄', tools: '🧰', audio: '🎶', group: '👥',
      owner: '👑', fun: '🎮', info: '📘', search: '🔍',
      sticker: '🖼️', downloads: '⬇️', anime: '✨',
      game: '🕹️', premium: '💎', admin: '🧦'
    }

    // ───── COMANDOS ─────
    let grupos = {}
    for (let plugin of Object.values(global.plugins || {})) {
      if (!plugin.help || !plugin.tags) continue

      let helps = Array.isArray(plugin.help) ? plugin.help : [plugin.help]
      for (let tag of plugin.tags) {
        if (!grupos[tag]) grupos[tag] = []
        for (let help of helps) {
          if (/^\$|^=>|^>/.test(help)) continue
          grupos[tag].push(`${usedPrefix}${help}`)
        }
      }
    }

    for (let tag in grupos) grupos[tag].sort()

    // ───── ESTILO DE COMANDOS ─────
    let secciones = Object.entries(grupos).map(([tag, cmds]) => {
      let emoji = emojis[tag] || '❄️'
      return `
╭── ${emoji} ${tag.toUpperCase()}
${cmds.map((cmd, i) => `│ ${i + 1}. ❄️ ${cmd}`).join('\n')}
╰──────────────
`
    }).join('\n')

    // ───── TEXTO ─────
    let menuText = `
🎄✨ 𝗚𝗢𝗝𝗢 𝗕𝗢𝗧 – 𝗠𝗘𝗡𝗨 𝗡𝗔𝗩𝗜𝗗𝗘Ñ𝗢 ✨🎄

❄️ ${ucapan()} @${userId.split('@')[0]}

───────────────
🎁 USUARIO
👤 ${name}
⭐ Nivel: ${level}
✨ Exp: ${exp}
🔱 Rango: ${role}
───────────────

🤖 BOT
📜 Comandos: ${totalCommands}
👥 Usuarios: ${totalreg}
⏳ Uptime: ${uptime}
───────────────

🕒 ${hora} | 📅 ${fecha}
🌤️ ${dia}

───────────────
❄️ Que la magia de la Navidad  
🎅 te acompañe en cada comando  

✨ GOJO – BOT ✨
🎄 Feliz Navidad & Próspero Año Nuevo 🎆
───────────────
🎄 COMANDOS
${secciones}
`.trim()

    // ✅ UN SOLO MENSAJE (SIN DUPLICADOS)
    await conn.sendMessage(m.chat, {
      video: { url: video },
      caption: menuText,
      gifPlayback: true,
      contextInfo: {
        mentionedJid: [userId],
        externalAdReply: {
          title: botname,
          body: dev,
          thumbnailUrl: banner,
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    await conn.sendMessage(m.chat, {
      text: `❌ Error al mostrar el menú\n\n${e.message}`
    }, { quoted: m })
  }
}

handler.help = ['menu']
handler.tags = ['main']
handler.command = ['menu', 'menú', 'help', 'allmenu']
handler.register = true

export default handler

// ───── FUNCIONES ─────
function clockString(ms) {
  let h = Math.floor(ms / 3600000)
  let m = Math.floor(ms / 60000) % 60
  let s = Math.floor(ms / 1000) % 60
  return `${h}h ${m}m ${s}s`
}

function ucapan() {
  let hour = moment.tz('America/Lima').format('HH')
  if (hour >= 5 && hour < 12) return 'Buenos días ☀️'
  if (hour >= 12 && hour < 18) return 'Buenas tardes 🌤️'
  return 'Buenas noches 🌙'
}
