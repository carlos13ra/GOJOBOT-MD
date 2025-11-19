let handler = async (m, { conn, args, participants, usedPrefix }) => {
  if (!db.data.chats[m.chat].economy && m.isGroup) {
    return m.reply(`《✦》Los comandos de *Economía* están desactivados en este grupo.\n\nUn *administrador* puede activarlos con el comando:\n» *${usedPrefix}economy on*`)
  }

  let groupId = m.chat
  if (!global.db.data.groups[groupId]) global.db.data.groups[groupId] = { users: {} }

  let groupMembers = participants.map(p => p.id)
  let users = Object.keys(global.db.data.groups[groupId].users).filter(jid => groupMembers.includes(jid))
  let sorted = users.sort((a, b) => (global.db.data.groups[groupId].users[b].coin + global.db.data.groups[groupId].users[b].bank) - (global.db.data.groups[groupId].users[a].coin + global.db.data.groups[groupId].users[a].bank))

  let text = []
  text.push(`╭━━━〔 💰 *TOP ECONOMÍA* 💰 〕━━⬣`)
  text.push(`│`)
  text.push(`│「✿」Los usuarios con más *${currency}* son:`)
  text.push(`│`)

  for (let i = 0; i < sorted.length; i++) {
    let jid = sorted[i]
    let user = global.db.data.groups[groupId].users[jid]
    if (!user) continue
    let total = (user.coin || 0) + (user.bank || 0)
    let name = user.name || await conn.getName(jid).catch(() => jid.split('@')[0])
    text.push(`│ ✰ ${i + 1}. *${name}*`)
    text.push(`│ Total ⤷ ¥${total.toLocaleString()} ${currency}`)
    text.push(`│`)
  }

  text.push(`╰━━━━━━━━━━━━━━━━━━⬣`)
  await conn.reply(m.chat, text.join('\n'), m, rcanal)
}

handler.help = ['baltop']
handler.tags = ['rpg']
handler.command = ['baltop', 'eboard', 'economyboard']
handler.group = true

export default handler
