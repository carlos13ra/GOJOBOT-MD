import moment from 'moment-timezone'

let handler = async (m, { conn, usedPrefix }) => {
  try {

    let userId = m.mentionedJid?.[0] || m.sender
    let userData = global.db.data.users[userId] || {}

    let exp = userData.exp || 0
    let level = userData.level || 0
    let role = userData.role || 'Sin rango'
    let name = await conn.getName(userId)


    let uptime = clockString(process.uptime() * 1000)
    let totalUsers = Object.keys(global.db.data.users).length
    let totalCommands = Object.keys(global.plugins).length

    let fechaObj = new Date()
    let hora = fechaObj.toLocaleTimeString('es-PE', { timeZone: 'America/Lima' })
    let fecha = fechaObj.toLocaleDateString('es-PE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'America/Lima'
    })
    let dia = fechaObj.toLocaleDateString('es-PE', {
      weekday: 'long',
      timeZone: 'America/Lima'
    })

    let videos = [
      'https://files.catbox.moe/vvrxck.mp4',
      'https://files.catbox.moe/eisgt7.mp4',
      'https://files.catbox.moe/fazi1o.mp4',
      'https://files.catbox.moe/bxhw5h.mp4'
    ]
    let video = videos[Math.floor(Math.random() * videos.length)]

    const emojis = {
      main: '📌',
      tools: '🛠️',
      audio: '🎧',
      group: '👥',
      owner: '👑',
      fun: '🎮',
      info: 'ℹ️',
      internet: '🌐',
      downloads: '⬇️',
      admin: '🔐',
      anime: '✨',
      nsfw: '🚫',
      search: '🔎',
      sticker: '🖼️',
      game: '🕹️',
      premium: '💎',
      bot: '🤖'
    }

    let grupos = {}
    for (let plugin of Object.values(global.plugins)) {
      if (!plugin.help || !plugin.tags) continue
      for (let tag of plugin.tags) {
        if (!grupos[tag]) grupos[tag] = []
        for (let help of plugin.help) {
          if (/^\$|^=>|^>/.test(help)) continue
          grupos[tag].push(`${usedPrefix}${help}`)
        }
      }
    }

    for (let tag in grupos) grupos[tag].sort()

    let secciones = Object.entries(grupos).map(([tag, cmds]) => {
      let emoji = emojis[tag] || '⭐'
      return `
╭──〔 ${emoji} ${tag.toUpperCase()} 〕──╮
${cmds.map(cmd => `│ ${cmd}`).join('\n')}
╰────────────────────╯`
    }).join('\n')


    let menuText = `
> 👋 *${ucapan()} @${userId.split('@')[0]}*

╭──〔 👤 INFO USER 〕──╮
│ 🧑 Usuario : ${name}
│ 🎚️ Nivel  : ${level}
│ ⭐ EXP    : ${exp}
│ 🏷️ Rango  : ${role}
╰──────────────────╯

╭──〔 ⚙️ BOT INFO 〕──╮
│ 👑 Owner    : wa.me/${suittag}
│ 🤖 Estado   : ${conn.user.jid == global.conn.user.jid ? 'BOT PRINCIPAL' : 'SUB BOT'}
│ 📜 Comandos : ${totalCommands}
│ 👥 Usuarios : ${totalUsers}
│ ⏳ Uptime   : ${uptime}
╰────────────────────╯

╭──〔 🕒 TIEMPO 〕──╮
│ ⏰ Hora  : ${hora}
│ 📅 Fecha: ${fecha}
│ 📆 Día  : ${dia}
╰──────────────────╯

  *_Lista de comandos_*

${secciones}

╭━━━━━━━━━━━━━━━━━━━━━━╮
│ © 2024 - 2025 GOJO BOT
│ Powered by Carlos Ramírez
╰━━━━━━━━━━━━━━━━━━━━━━╯
`.trim()

    await m.react('🤖')

    await conn.sendMessage(m.chat, {
      video: { url: video },
      caption: menuText,
      gifPlayback: true,
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
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    conn.reply(m.chat, `✘ Error al mostrar el menú\n${e.message}`, m)
  }
}

handler.help = ['menu']
handler.tags = ['main']
handler.command = ['menu', 'menú', 'help', 'allmenu']
handler.register = true

export default handler

function clockString(ms) {
  let h = Math.floor(ms / 3600000)
  let m = Math.floor(ms / 60000) % 60
  let s = Math.floor(ms / 1000) % 60
  return `${h}h ${m}m ${s}s`
}

function ucapan() {
  let time = moment.tz('America/Lima').hour()
  if (time >= 5 && time < 12) return 'Buenos días ☀️'
  if (time >= 12 && time < 18) return 'Buenas tardes 🌤️'
  return 'Buenas noches 🌙'
}