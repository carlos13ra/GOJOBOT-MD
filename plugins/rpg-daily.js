let handler = async (m, { conn, usedPrefix }) => {
  if (!db.data.chats[m.chat].economy && m.isGroup) {
    return m.reply(`《✦》Los comandos de *Economía* están desactivados en este grupo.\n\nUn *administrador* puede activarlos con el comando:\n» *${usedPrefix}economy on*`)
  }

  let user = global.db.data.users[m.sender]
  let groupId = m.chat
  let now = Date.now()
  let gap = 86400000 // 24 horas

  user.groups = user.groups || {}
  user.groups[groupId] = user.groups[groupId] || {
    coin: 0,
    exp: 0,
    lastDaily: 0
  }

  if (now - user.groups[groupId].lastDaily < gap) {
    let wait = formatTime(Math.floor((user.groups[groupId].lastDaily + gap - now) / 1000))
    return conn.reply(m.chat, `ꕥ Ya has reclamado tu *Daily* de hoy en este grupo.\n> Puedes reclamarlo de nuevo en *${wait}*`, m)
  }

  let reward = Math.min(20000 + (user.streak - 1) * 5000, 1015000)
  let expRandom = Math.floor(Math.random() * (100 - 20 + 1)) + 20
  user.groups[groupId].coin += reward
  user.groups[groupId].exp += expRandom
  user.groups[groupId].lastDaily = now

  conn.reply(m.chat, `「✿」Has reclamado tu recompensa diaria de *¥${reward.toLocaleString()} ${currency}*! (Día *${(user.streak || 0) + 1}*)\n> Día *${(user.streak || 0) + 2}* » *+¥${Math.min(20000 + ((user.streak || 0) + 1) * 5000, 1015000).toLocaleString()}*`, m)
}

handler.help = ['daily']
handler.tags = ['rpg']
handler.command = ['daily', 'diario']
handler.group = true

export default handler

function formatTime(t) {
  const h = Math.floor(t / 3600)
  const m = Math.floor((t % 3600) / 60)
  const s = t % 60
  const parts = []
  if (h) parts.push(`${h} hora${h !== 1 ? 's' : ''}`)
  if (m || h) parts.push(`${m} minuto${m !== 1 ? 's' : ''}`)
  parts.push(`${s} segundo${s !== 1 ? 's' : ''}`)
  return parts.join(' ')
}
