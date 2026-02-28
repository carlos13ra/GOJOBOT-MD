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
        'https://raw.githubusercontent.com/AkiraDevX/uploads/main/uploads/a1cns.mp4',
        'https://raw.githubusercontent.com/Dev-lxyz/upload/main/uploads/pkupa.mp4',
        'https://raw.githubusercontent.com/AkiraDevX/uploads/main/uploads/vu9xq.mp4',
        'https://raw.githubusercontent.com/Dev-lxyz/upload/main/uploads/q5ndy.mp4',
        'https://raw.githubusercontent.com/AkiraDevX/uploads/main/uploads/uypmz.mp4',
        'https://raw.githubusercontent.com/Dev-lxyz/upload/main/uploads/6ah3m.mp4'
    ]
    let video = videos[Math.floor(Math.random() * videos.length)]

    // ----- SECCIONES DE COMANDOS (ESTILO BONITO) -----
    const grupos = {}
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

    const secciones = Object.entries(grupos).map(([tag, cmds]) => {
      cmds.sort((a,b) => a.localeCompare(b))
      return `⪩ ::  ᮫　⌗⌗ *${tag.toUpperCase()}* ᮫　⿻\n` +
             cmds.map(c => ` ׄ✿ִㅤ${c}`).join('\n')
    }).join('\n\n')

    // ----- MENÚ COMPLETO (CÓDIGO ORIGINAL) -----
    let menuText = `
╔══════════════╗
  🍃 GOJOBOT - MD 🍂
╚══════════════╝

${ucapan()} @${userId.split('@')[0]}

────────────────
👤 🄸🄽🄵🄾 🄳🄴🄻 🅄🅂🄴🅁
────────────────
👤 𝐔𝐒𝐄𝐑: ${name}
💎 𝐍𝐈𝐕𝐄𝐋: ${level}
🗿 𝐄𝐗𝐏𝐄𝐑𝐈𝐄𝐍𝐂𝐈𝐀: ${exp}
🥵 𝐑𝐀𝐍𝐆𝐎: ${role}

────────────────
🤖 🄸🄽🄵🄾 🄳🄴🄻 🄱🄾🅃
────────────────
🥭 𝐎𝐖𝐍𝐄𝐑: wa.me/${suittag}
🎧 𝐄𝐒𝐓𝐀𝐃𝐎: ${(conn.user.jid == global.conn.user.jid ? 'BOT OFICIAL 🥭' : 'SUB BOT 🍐')}
🎉 𝐂𝐎𝐌𝐀𝐍𝐃𝐎𝐒: ${totalCommands}
👥 𝐔𝐒𝐔𝐀𝐑𝐈𝐎𝐒: ${totalreg}
⏳ 𝐔𝐏𝐓𝐈𝐌𝐄: ${uptime}

────────────────
⏰ 🄵🄴🄲🄷🄰 🅈 🄷🄾🅁🄰 
────────────────
🕝 𝐇𝐎𝐑𝐀: ${hora}
📅 𝐅𝐄𝐂𝐇𝐀: ${fecha}
🏙️ 𝐃𝐈𝐀: ${dia}
────────────────
GOJO BOT • SISTEMA ACTIVO
© 2025 - 2026 Powered By Carlos Ramírez
────────────────
📂 🄲🄾🄼🄰🄽🄳🄾🅂
────────────────
${secciones}
`.trim()

    await m.react('🍂')

    await conn.sendMessage(
      m.chat,
      {
        video: { url: video },
        caption: menuText,
        gifPlayback: true,
        gifAttribution: 0,
        contextInfo: {
          mentionedJid: [m.sender],
          isForwarded: true,
          forwardingScore: 999,
          forwardedNewsletterMessageInfo: {
            newsletterJid: channelRD.id,
            serverMessageId: 100,
            newsletterName: channelRD.name
          },
          externalAdReply: {
            title: botname,
            body: dev,
            thumbnailUrl: banner,
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      },
      { quoted: m }
    )

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
