import fetch from 'node-fetch'

let handler = async (m, { conn, args, participants, usedPrefix }) => {
  if (!db.data.chats[m.chat].economy && m.isGroup) {
    return m.reply(`《✦》Los comandos de *Economía* están desactivados en este grupo.\n\nUn *administrador* puede activarlos con el comando:\n» *${usedPrefix}economy on*`)
  }

  const groupMembers = participants.map(p => p.id)
  const users = [...new Map(Object.entries(global.db.data.users).map(([jid, data]) => [jid, {...data, jid }])).values()]
  const filteredUsers = users.filter(user => groupMembers.includes(user.jid) && user.coin!== undefined && user.bank!== undefined)
  const sorted = filteredUsers.sort((a, b) => ((b.coin || 0) + (b.bank || 0)) - ((a.coin || 0) + (a.bank || 0)))
  const totalPages = Math.ceil(sorted.length / 10)
  const page = Math.max(1, Math.min(parseInt(args[0]) || 1, totalPages))
  const startIndex = (page - 1) * 10
  const endIndex = startIndex + 10

  const slice = sorted.slice(startIndex, endIndex)

  // Obtener nombres correctamente
  const list = await Promise.all(slice.map(async (user, i) => {
    let name = user.name
    if (!name || name === 'undefined' || name === '') {
      name = await conn.getName(user.jid).catch(() => null)
    }
    if (!name) name = user.jid.split('@')[0]
    const total = (user.coin || 0) + (user.bank || 0)
    return `│ ✰ ${startIndex + i + 1}. *${name}*\n│ Total ⤷ ¥${total.toLocaleString()} ${currency}\n│`
  }))

  let text = []
  text.push(`╭━━━〔 💰 *TOP ECONOMÍA* 💰 〕━━⬣`)
  text.push(`│`)
  text.push(`│「✿」Los usuarios con más *${currency}* son:`)
  text.push(`│`)
  text.push(...list)
  text.push(`│ • Página *${page}* de *${totalPages}*`)
  text.push(`╰━━━━━━━━━━⬣`)

  await conn.reply(m.chat, text.join('\n'), m, rcanal)
}

handler.help = ['baltop']
handler.tags = ['rpg']
handler.command = ['baltop', 'eboard', 'economyboard']
handler.group = true

export default handler

const rcanal = {
  contextInfo: {
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: '120363421367237421@newsletter',
      newsletterName: 'ׄ﹙ׅ🍜﹚ּ 𝐆𝐨𝐣𝐨𝐁𝐨𝐭-𝐌𝐃 › 𝘊𝘩𝘢𝘯𝘦𝘭 𝘰𝘧𝘪𝘤𝘪𝘢𝘭 ᰔᩚ.ᐟ.ᐟ',
      serverMessageId: -1
    },
    externalAdReply: {
      title: 'GojoBot-MD🌱',
      body: 'Canal Oficial',
      thumbnailUrl: 'https://raw.githubusercontent.com/Dev-lxyz/upload/main/uploads/v0bmi.jpeg',
      mediaType: 1,
      renderLargerThumbnail: true
    }
  }
}
