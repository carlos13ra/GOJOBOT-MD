let handler = async (m, { conn, args, participants, usedPrefix }) => {
  if (!db.data.chats[m.chat].economy && m.isGroup) {
    return m.reply(`《✦》Los comandos de *Economía* están desactivados en este grupo.\n\nUn *administrador* puede activarlos con el comando:\n» *${usedPrefix}economy on*`)
  }

  let groupId = m.chat
  if (!global.db.data.groups[groupId]) global.db.data.groups[groupId] = { users: {} }

  let mentionedJid = await m.mentionedJid
  let who = mentionedJid[0] ? mentionedJid[0] : m.quoted ? await m.quoted.sender : m.sender
  let name = await (async () => global.db.data.groups[groupId].users[who].name || (async () => { try { const n = await conn.getName(who); return typeof n === 'string' && n.trim() ? n : who.split('@')[0] } catch { return who.split('@')[0] } })())()
  if (!(who in global.db.data.groups[groupId].users)) {
    global.db.data.groups[groupId].users[who] = {
      coin: 0,
      bank: 0,
      lastDaily: 0
    }
  }

  let user = global.db.data.groups[groupId].users[who]
  let coin = user.coin || 0
  let bank = user.bank || 0
  let total = (user.coin || 0) + (user.bank || 0)

  const texto = `ᥫ᭡ Informacion - Balance ❀ ᰔᩚ Usuario » *${name}* ⛀ Cartera » *¥${coin.toLocaleString()} ${currency}* ⚿ Banco » *¥${bank.toLocaleString()} ${currency}* ⛁ Total » *¥${total.toLocaleString()} ${currency}* > *Para proteger tu dinero, ¡depósitalo en el banco usando #deposit!*`
  await conn.sendMessage(m.chat, { image: { url: 'https:                                                                                                    
}

handler.help = ['//files.catbox.moe/kzqkio.jpg' }, caption: texto, mentions: [who], ...rcanal }, { quoted: fkontak })
}

handler.help = ['bal']
handler.tags = ['rpg']
handler.command = ['bal', 'balance', 'bank']
handler.group = true

export default handler
