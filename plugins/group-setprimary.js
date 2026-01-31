import ws from 'ws'

const handler = async (m, { conn, usedPrefix, botname }) => {
  const subBots = [
    ...new Set(
      global.conns
        .filter(c => c.user && c.ws?.socket && c.ws.socket.readyState !== ws.CLOSED)
        .map(c => c.user.jid)
    )
  ]

  if (global.conn?.user?.jid && !subBots.includes(global.conn.user.jid)) {
    subBots.push(global.conn.user.jid)
  }

  const chat = global.db.data.chats[m.chat]

  const mentionedJid = m.mentionedJid || []
  const who = mentionedJid[0] || (m.quoted ? m.quoted.sender : null)

  if (!who) {
    return conn.reply(m.chat, '❀ Menciona al bot que quieres como principal.', m)
  }

  if (!subBots.includes(who)) {
    return conn.reply(m.chat, `ꕥ Ese número no es un bot de *${botname}*.`, m)
  }

  if (chat.primaryBot === who) {
    return conn.reply(
      m.chat,
      `ꕥ @${who.split('@')[0]} ya es el Bot principal.`,
      m,
      { mentions: [who] }
    )
  }

  chat.primaryBot = who

  await conn.reply(
    m.chat,
    `❀ Bot principal asignado:\n@${who.split('@')[0]}\n\n> Solo este bot responderá en este grupo🥭.`,
    m,
    { mentions: [who] }
  )
}

handler.help = ['setprimary']
handler.tags = ['group']
handler.command = ['setprimary']
handler.group = true
handler.admin = true

export default handler
