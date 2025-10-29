import fetch from 'node-fetch'

let handler = async (m, { conn, args, participants, usedPrefix }) => {
  if (!db.data.chats[m.chat].economy && m.isGroup) {
    return m.reply(`《✦》Los comandos de *Economía* están desactivados en este grupo.\n\nUn *administrador* puede activarlos con el comando:\n» *${usedPrefix}economy on*`)
  }

  const users = [...new Map(Object.entries(global.db.data.users).map(([jid, data]) => [jid, { ...data, jid }])).values()]
  const sorted = users.sort((a, b) => ((b.coin || 0) + (b.bank || 0)) - ((a.coin || 0) + (a.bank || 0)))

  const totalPages = Math.ceil(sorted.length / 10)
  const page = Math.max(1, Math.min(parseInt(args[0]) || 1, totalPages))
  const startIndex = (page - 1) * 10
  const endIndex = startIndex + 10

  let text = `╭━━━〔 💰 *TOP ECONOMÍA* 💰 〕━━⬣\n│\n│「✿」Los usuarios con más *${currency}* son:\n│\n`
  const slice = sorted.slice(startIndex, endIndex)

  for (let i = 0; i < slice.length; i++) {
    const { jid, coin, bank } = slice[i]
    const total = (coin || 0) + (bank || 0)
    let name = await (async () => global.db.data.users[jid].name.trim() || (await conn.getName(jid).then(n => typeof n === 'string' && n.trim() ? n : jid.split('@')[0]).catch(() => jid.split('@')[0])))()
    text += `│ ✰ ${startIndex + i + 1}. *${name}*\n│ Total ⤷ ¥${total.toLocaleString()} ${currency}\n│\n`
  }

  text += `│ • Página *${page}* de *${totalPages}*\n╰━━━━━━━━━━━━━━━━━━⬣`

  await conn.reply(m.chat, text.trim(), m, rcanal)
}

handler.help = ['baltop']
handler.tags = ['rpg']
handler.command = ['baltop', 'eboard', 'economyboard']
handler.group = true

export default handler