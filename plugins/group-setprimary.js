import ws from 'ws'

const handler = async (m, { conn, command, isAdmin, isOwner }) => {
  const chat = global.db.data.chats[m.chat] || {}

  // 🔐 Permisos
  if (!isAdmin && !isOwner) {
    return conn.reply(m.chat, '❌ Solo administradores pueden usar este comando.', m)
  }

  // 🔍 Obtener bots activos
  let subBots = global.conns
    .filter(c => c.user && c.ws?.socket && c.ws.socket.readyState !== ws.CLOSED)
    .map(c => c.user.jid)

  if (global.conn?.user?.jid) subBots.push(global.conn.user.jid)
  subBots = [...new Set(subBots)]

  // ───── ELIMINAR PRIMARY
  if (command === 'delprimary') {
    if (!chat.primaryBot) {
      return conn.reply(m.chat, 'ꕥ No hay bot primario en este grupo.', m)
    }

    const old = chat.primaryBot
    chat.primaryBot = null

    return conn.reply(
      m.chat,
      `❀ Bot primario eliminado:\n@${old.split('@')[0]}`,
      m,
      { mentions: [old] }
    )
  }

  // ───── OBTENER BOT
  const who = m.mentionedJid?.[0] || m.quoted?.sender

  if (!who) {
    return conn.reply(m.chat, '❀ Menciona o responde a un bot.', m)
  }

  if (!subBots.includes(who)) {
    return conn.reply(m.chat, '⚠️ Ese usuario no es un bot activo.', m)
  }

  // 🔍 Verificar que esté en el grupo
  const groupMetadata = await conn.groupMetadata(m.chat)
  const isInGroup = groupMetadata.participants.some(p => p.jid === who)

  if (!isInGroup) {
    return conn.reply(m.chat, '⚠️ Ese bot no está en este grupo.', m)
  }

  if (chat.primaryBot === who) {
    return conn.reply(
      m.chat,
      `ꕥ @${who.split('@')[0]} ya es el bot primario.`,
      m,
      { mentions: [who] }
    )
  }

  // ✅ SET PRIMARY
  chat.primaryBot = who

  return conn.reply(
    m.chat,
    `❀ Nuevo bot primario:\n@${who.split('@')[0]}\n\n⚡ Este bot ejecutará los comandos.`,
    m,
    { mentions: [who] }
  )
}

handler.help = ['setprimary @bot', 'delprimary']
handler.tags = ['group']
handler.command = ['setprimary', 'delprimary']
handler.group = true
handler.admin = true

export default handler
