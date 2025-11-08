import axios from 'axios'
import moment from 'moment-timezone'

let handler = async (m, { conn, usedPrefix }) => {
  try {
    let userId = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.sender
    let userData = global.db.data.users[userId] || {}
    let exp = userData.exp || 0
    let coin = userData.coin || 0
    let level = userData.level || 0
    let role = userData.role || 'Sin Rango'
    let name = await conn.getName(userId)

    let _uptime = process.uptime() * 1000
    let uptime = clockString(_uptime)
    let totalreg = Object.keys(global.db.data.users).length
    let totalCommands = Object.keys(global.plugins).length

    let fechaObj = new Date()
    let hora = new Date().toLocaleTimeString('es-PE', { timeZone: 'America/Lima' })
    let fecha = fechaObj.toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Lima' })
    let dia = fechaObj.toLocaleDateString('es-PE', { weekday: 'long', timeZone: 'America/Lima' })

    let videos = [
      'https://files.catbox.moe/vvrxck.mp4',
      'https://files.catbox.moe/fazi1o.mp4',
      'https://files.catbox.moe/bxhw5h.mp4',
      'https://files.catbox.moe/esb1sa.mp4',
      'https://files.catbox.moe/xthtfx.mp4',
      'https://files.catbox.moe/70legl.mp4',
      'https://files.catbox.moe/prem4p.mp4'
    ]
    let video = videos[Math.floor(Math.random() * videos.length)]

    const emojis = {
      'main': '🎄', 'tools': '🧰', 'audio': '🎶', 'group': '🎁',
      'owner': '👑', 'fun': '🎮', 'info': '📘', 'internet': '🌐',
      'downloads': '⬇️', 'admin': '🧦', 'anime': '✨', 'nsfw': '🚫',
      'search': '🔍', 'sticker': '🖼️', 'game': '🕹️', 'premium': '💎', 'bot': '🤖'
    }

    let grupos = {}
    for (let plugin of Object.values(global.plugins || {})) {
      if (!plugin.help || !plugin.tags) continue
      for (let tag of plugin.tags) {
        if (!grupos[tag]) grupos[tag] = []
        for (let help of plugin.help) {
          if (/^\$|^=>|^>/.test(help)) continue
          grupos[tag].push(`${usedPrefix}${help}`)
        }
      }
    }

    for (let tag in grupos) {
      grupos[tag].sort((a, b) => a.localeCompare(b))
    }

    const secciones = Object.entries(grupos).map(([tag, cmds]) => {
      const emoji = emojis[tag] || '⭐'
      return `╭───🎄「 ${emoji} *${tag.toUpperCase()}* 」🎁───❄️\n`
      + cmds.map(cmd => `│ ✨ ${cmd}`).join('\n')
      + `\n╰───────────────────────🎀`
    }).join('\n\n')

    let menuText = `
🎀 *꧁ 𝐆𝐎𝐉𝐎 - 𝐁𝐎𝐓 🎄 𝐍𝐀𝐕𝐈𝐃𝐀𝐃 & 𝐀Ñ𝐎 𝐍𝐔𝐄𝐕𝐎 ꧂* 🎀

╭──────────────────────╮
│ ✨ ${ucapan()} @${userId.split('@')[0]} ✨
│ ❄️ Que la magia de la Navidad ilumine tu día.
╰──────────────────────╯

╭─🎄「 *INFORMACIÓN DEL USUARIO* 」─╮
│ 👤 Nombre: *${name}*
│ 💎 Nivel: *${level}*
│ 🎁 Experiencia: *${exp}*
│ 🏆 Rango: *${role}*
╰─────────────────────────────╯

╭─🎁「 *INFORMACIÓN DEL BOT* 」─╮
│ 👑 Owner: *wa.me/${suittag}*
│ 🤖 Estado: ${(conn.user.jid == global.conn.user.jid ? '🌟 Oficial' : '🎄 Sub-Bot')}
│ 📜 Comandos: *${totalCommands}*
│ 👥 Usuarios: *${totalreg}*
│ ⏰ Uptime: *${uptime}*
╰─────────────────────────────╯

╭─⛄「 *FECHA & HORA* 」─╮
│ 🕒 Hora Perú: *${hora}*
│ 📅 Fecha: *${fecha}*
│ 🌤️ Día: *${dia}*
╰──────────────────────╯

🎄✨ *𝐅𝐄𝐋𝐈𝐂𝐄𝐒 𝐅𝐈𝐄𝐒𝐓𝐀𝐒* ✨🎄
🎆 Que la paz, amor y alegría estén contigo 🎇
💫 Y que el 2025 esté lleno de logros y magia 💫

${secciones}
`.trim()

    await m.react('☃️')

    await conn.sendMessage(m.chat, { 
      video: { url: video },
      caption: menuText,
      contextInfo: { 
        mentionedJid: [m.sender],
        forwardingScore: 999,
        isForwarded: true,
        externalAdReply: { 
          title: "🎄 GOJO-BOT 𝑵𝒂𝒗𝒊𝒅𝒂𝒅 𝑬𝒍𝒆𝒈𝒂𝒏𝒕𝒆 🎁",
          body: "✨ Creado con estilo por Carlos Ramírez 🎅",
          thumbnailUrl: icono,
          sourceUrl: redes,
          mediaType: 1,
          renderLargerThumbnail: true
        }
      },
      gifPlayback: true
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    await conn.sendMessage(m.chat, {
      text: `✘ Error al enviar el menú: ${e.message}`,
      mentions: [m.sender]
    }, { quoted: m })
  }
}

handler.help = ['menu']
handler.tags = ['main']
handler.command = ['menu', 'menú', 'help', 'allmenú', 'allmenu', 'menucompleto']
handler.register = true
export default handler

function clockString(ms) {
  let seconds = Math.floor((ms / 1000) % 60)
  let minutes = Math.floor((ms / (1000 * 60)) % 60)
  let hours = Math.floor((ms / (1000 * 60 * 60)) % 24)
  return `${hours}h ${minutes}m ${seconds}s`
}

function ucapan() {
  const time = moment.tz('America/Lima').format('HH')
  if (time >= 5 && time < 12) return "Buenos días ☀️"
  if (time >= 12 && time < 18) return "Buenas tardes 🌤️"
  return "Buenas noches 🌙"
}
