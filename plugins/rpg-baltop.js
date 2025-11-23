import fetch from 'node-fetch'

let handler = async (m, { conn, args, participants, usedPrefix }) => {
  if (!db.data.chats[m.chat].economy && m.isGroup) {
    return m.reply(`《✦》Los comandos de *Economía* están desactivados en este grupo.\n\nUn *administrador* puede activarlos con el comando:\n» *${usedPrefix}economy on*`)
  }

  const groupMembers = participants.map(p => p.id)
  const users = [...new Map(Object.entries(global.db.data.users).map(([jid, data]) => [jid, { ...data, jid }])).values()]
  const filteredUsers = users.filter(user => groupMembers.includes(user.jid) && user.coin !== undefined && user.bank !== undefined)
  const sorted = filteredUsers.sort((a, b) => ((b.coin || 0) + (b.bank || 0)) - ((a.coin || 0) + (a.bank || 0)))
  const totalPages = Math.ceil(sorted.length / 10)
  const page = Math.max(1, Math.min(parseInt(args[0]) || 1, totalPages))
  const startIndex = (page - 1) * 10
  const endIndex = startIndex + 10

  let text = []
  text.push(`╭━━━〔 💰 *TOP ECONOMÍA* 💰 〕━━⬣`)
  text.push(`│`)
  text.push(`│「✿」Los usuarios con más *${currency}* son:`)
  text.push(`│`)

  const slice = sorted.slice(startIndex, endIndex)
  for (let i = 0; i < slice.length; i++) {
    const { jid, coin, bank } = slice[i]
    const total = (coin || 0) + (bank || 0)
    let name = global.db.data.users[jid] ? global.db.data.users[jid].name : await conn.getName(jid).catch(() => jid.split('@')[0])
    text.push(`│ ✰ ${startIndex + i + 1}. *${name}*`)
    text.push(`│ Total ⤷ ¥${total.toLocaleString()} ${currency}`)
    text.push(`│`)
  }

  text.push(`│ • Página *${page}* de *${totalPages}*`)
  text.push(`╰━━━━━━━━━━━━━━━━━━⬣`)

  await conn.reply(m.chat, text.join('\n'), m, rcanal)
}

handler.help = ['baltop']
handler.tags = ['rpg']
handler.command = ['baltop', 'eboard', 'economyboard']
handler.group = true

export default handler
