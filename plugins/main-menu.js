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
      'https://files.catbox.moe/eisgt7.mp4',
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
  return `╭─⛄━━━━━━━━━━━━🎄
│ ✨ 〔 ${emoji} ${tag.toUpperCase()} 〕 ✨
│━━━━━━━━━━━━━━━━❄️\n`
   + cmds.map(cmd => `│ 🎁 ${cmd}`).join('\n') 
   + `\n╰─🎅━━━━━━━━━━━━☃️`
}).join('\n\n')


let menuText = `
╔════•ೋ•❅❖❅•ೋ•════╗
        ✨ GOJO – BOT ✨
      🎄 MENÚ NAVIDEÑO UWU 🎄
╚════•ೋ•❅❖❅•ೋ•════╝

🎄 *${ucapan()} @${userId.split('@')[0]}*  

┏━━━🎁 *INFO USER* 🎁━━━
┃ 👤 *Usuario:* ${name}
┃ 🎚️ *Nivel:* ${level}
┃ ⭐ *Experiencia:* ${exp}
┃ 🔱 *Rango:* Cachud@
┗━━━━━━━━━━━━━━━━━━❄️

┏━━━🎅 *INFO DEL BOT* 🎅━━━
┃ 👑 *Owner:* wa.me/${suittag}
┃ 🤖 *Estado:* ${(conn.user.jid == global.conn.user.jid ? '🎅 BOT OFICIAL' : '🎄 SUB BOT')}
┃ 📜 *Comandos:* ${totalCommands}
┃ 🧑‍🤝‍🧑 *Usuarios:* ${totalreg}
┃ ⏳ *Uptime:* ${uptime}
┗━━━━━━━━━━━━━━━━━━❄️

┏━━━🕒 *TIEMPO* 🕒━━━
┃ 🕒 *Hora Perú:* ${hora}
┃ 📅 *Fecha:* ${fecha}
┃ 🌤️ *Día:* ${dia}
┗━━━━━━━━━━━━━━━━━━❄️


🎄✨ *FELICES FIESTAS* ✨🎄
🎄 ¡Que la alegría, la paz y los comandos te acompañen!🎆  
❄️ ¡fєℓιz иανι∂α∂🎄 & ρяσѕρєяσ αи̃σ иυєνσ! 🌟
✨ 𝙶𝙾𝙹𝙾 - 𝙱𝙾𝚃 ✨  
© 2024 - 2025 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐂𝐚𝐫𝐥𝐨𝐬 𝐑𝐚𝐦í𝐫𝐞𝐳

${secciones}
`.trim()

await m.react('❄️')
await conn.sendMessage(m.chat, { video: { url: video }, caption: menuText, contextInfo: { mentionedJid: [m.sender], isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid: channelRD.id, newsletterName: channelRD.name, serverMessageId: -1, }, forwardingScore: 999, externalAdReply: { title: botname, body: dev, thumbnailUrl: icono, sourceUrl: redes, mediaType: 1, renderLargerThumbnail: false,
}, }, gifPlayback: true, gifAttribution: 0 }, { quoted: null })

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
  let res = "ʙᴜᴇɴᴀs ɴᴏᴄʜᴇs 🌙"
  if (time >= 5 && time < 12) res = "ʙᴜᴇɴᴏs ᴅɪᴀs ☀️"
  else if (time >= 12 && time < 18) res = "ʙᴜᴇɴᴀs ᴛᴀʀᴅᴇs 🌤️"
  else if (time >= 18) res = "ʙᴜᴇɴᴀs ɴᴏᴄʜᴇs 🌙"
  return res
}
