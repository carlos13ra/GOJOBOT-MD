let handler = async (m, { conn, usedPrefix }) => {
  if (!db.data.chats[m.chat].economy && m.isGroup) {
    return m.reply(`《✦》Los comandos de *Economía* están desactivados en este grupo.\n\nUn *administrador* puede activarlos con el comando:\n» *${usedPrefix}economy on*`)
  }

  let mentionedJid = await m.mentionedJid
  let who = mentionedJid[0] ? mentionedJid[0] : m.quoted ? await m.quoted.sender : m.sender
  let name = await (async () => global.db.data.users[who].name || (async () => {
  try {
    const n = await conn.getName(who)
    return typeof n === 'string' && n.trim() ? n : who.split('@')[0]
  } catch {
    return who.split('@')[0]
  }
})())()

const texto = `ᥫ᭡ Informacion - Balance ❀ ᰔᩚ Usuario » *${name}* ⛀ Cartera » *¥${coin.toLocaleString()} USD* ⚿ Banco » *¥${bank.toLocaleString()} USD* ⛁ Total » *¥${total.toLocaleString()} USD* > *Para proteger tu dinero, ¡depósitalo en el banco usando #deposit!*`

  await conn.sendMessage(m.chat, {
    video: { url: 'https://files.catbox.moe/67rrf3.mp4' },
    caption: texto,
    gifPlayback: true,
    mimetype: 'video/mp4'
  }, { quoted: m })
}

handler.help = ['bal']
handler.tags = ['rpg']
handler.command = ['bal', 'balance', 'bank']
handler.group = true

export default handler
