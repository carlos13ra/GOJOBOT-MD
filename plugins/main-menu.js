import fetch from 'node-fetch'

let handler = async (m, { conn, usedPrefix }) => {
  try {
    let userId = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.sender
    let _uptime = process.uptime() * 1000
    let uptime = clockString(_uptime)
    let totalreg = Object.keys(global.db.data.users).length
    let totalCommands = Object.keys(global.plugins).length
    let groupsCount = Object.values(conn.chats).filter(v => v.id.endsWith('@g.us')).length

    let fechaObj = new Date()
    let hora = fechaObj.toLocaleTimeString('en-US', { timeZone: 'America/Lima' })
    let fecha = fechaObj.toLocaleDateString('en-US', { timeZone: 'America/Lima' })
    let date = `${fecha} ${hora}`
    let mediaList = [
      'https://raw.githubusercontent.com/Dev-lxyz/file/main/files/b6kxa.mp4',
      'https://raw.githubusercontent.com/AkiraDevX/file/main/files/fgsde.mp4'
    ]

    let banner = mediaList[Math.floor(Math.random() * mediaList.length)]

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
      return `*╭─ ✿ ${tag.toUpperCase()} ༘*\n`
        + cmds.map(cmd => `*├ ｡* ${cmd}`).join('\n') 
        + `\n*╰─────────────┈⟢*`
    }).join('\n\n')

    let menu = ` 🍡 𝐖𝐞𝐥𝐜𝐨𝐦𝐞 𝐭𝐨, 𝐒𝐚𝐭𝐨𝐫𝐮 𝐆𝐨𝐣𝐨𝐮 (${(conn.user.jid == global.conn.user.jid ? '𝐎𝐟𝐢𝐜𝐢𝐚𝐥' : '𝐒𝐮𝐛-𝐁𝐨𝐭')}) 𔗨𔗨
￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣

 *⟢ Usuarios :* ${totalreg}
 *⟢ Grupos :* ${groupsCount}
 *⟢ comnds :* ${totalCommands}
 *⟢ Runtime :* ${uptime}
 *⟢ Date :* ${date}
 *⟢* \`\`\`https://whatsapp.com/channel/0029VbBGlokA89MliWWv1x16\`\`\`
 
࿙𝆊࿚𝆊࿙࿚ㅤׁ࿙𝆊࿚𝆊࿙࿚ㅤׁㅤ࿙𝆊࿚𝆊࿙࿚ㅤׁ࿙𝆊࿚𝆊࿙࿚ㅤׁㅤ࿙𝆊࿚𝆊࿙࿚


${secciones}`.trim()

    let isVideo = banner.endsWith('.mp4') || banner.endsWith('.webm')

    await conn.sendMessage(m.chat,
      isVideo
        ? {
            video: { url: banner },
            gifPlayback: true,
            caption: menu,
            contextInfo: {
              mentionedJid: [m.sender],
              isForwarded: true,
              forwardedNewsletterMessageInfo: {
                newsletterJid: '120363421367237421@newsletter',
                serverMessageId: '',
                newsletterName: botname
              }
            }
          }
        : {
            text: menu,
            contextInfo: {
              mentionedJid: [m.sender],
              isForwarded: true,
              forwardedNewsletterMessageInfo: {
                newsletterJid: '120363421367237421@newsletter',
                serverMessageId: '',
                newsletterName: botname
              },
              externalAdReply: {
                title: botname,
                body: dev,
                thumbnail: await (await fetch(banner)).buffer(),
                mediaType: 1,
                renderLargerThumbnail: true,
                showAdAttribution: false
              }
            }
          },
      { quoted: m }
    )

  } catch (e) {
    await conn.sendMessage(m.chat, {
      text: `🌷 Error al enviar el menú: ${e.message}`,
      mentions: [m.sender]
    }, { quoted: m })
  }
}

handler.help = ['menu']
handler.tags = ['main']
handler.command = ['menu', 'menú', 'help', 'allmenu']

export default handler

function clockString(ms) {
  let seconds = Math.floor((ms / 1000) % 60)
  let minutes = Math.floor((ms / (1000 * 60)) % 60)
  let hours = Math.floor((ms / (1000 * 60 * 60)) % 24)
  return `${hours}ʜ ${minutes}ᴍ ${seconds}s`
}
