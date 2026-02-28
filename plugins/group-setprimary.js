import ws from 'ws'

function getActiveSubBots() {
  return [
    ...new Set(
      global.conns
        .filter(v => v?.user?.jid && v?.ws?.socket?.readyState !== ws.CLOSED)
        .map(v => v.user.jid)
    )
  ]
}

function validatePrimaryBot(chat) {
  if (!chat?.primaryBot) return

  const alive = global.conns.some(v =>
    v?.user?.jid === chat.primaryBot &&
    v?.ws?.socket?.readyState !== ws.CLOSED
  )

  if (!alive) {
    const available = getActiveSubBots()
    if (available.length) {
      chat.primaryBot =
        available[Math.floor(Math.random() * available.length)]
    } else {
      delete chat.primaryBot
    }
  }
}

const handler = async (m, { conn, command, usedPrefix }) => {
  const chat =
    global.db.data.chats[m.chat] ||
    (global.db.data.chats[m.chat] = {})

  validatePrimaryBot(chat)

  const subBots = getActiveSubBots()

  if (global.conn?.user?.jid && !subBots.includes(global.conn.user.jid)) {
    subBots.push(global.conn.user.jid)
  }

  // ❌ ELIMINAR PRIMARIO
  if (command === 'delprimary') {
    if (!chat.primaryBot)
      return conn.reply(
        m.chat,
        `ꕥ No hay ningún Bot primario establecido en este grupo.`,
        m
      )

    const old = chat.primaryBot
    delete chat.primaryBot

    return conn.reply(
      m.chat,
      `❀ Se eliminó el Bot primario.\n> @${old.split('@')[0]} ya no es principal.`,
      m,
      { mentions: [old] }
    )
  }

  // ✅ ESTABLECER PRIMARIO
  const mentionedJid = m.mentionedJid
  const who = mentionedJid[0] || (m.quoted ? m.quoted.sender : null)

  if (!who)
    return conn.reply(
      m.chat,
      `❀ Menciona un Socket para hacerlo Bot principal.`,
      m
    )

  if (!subBots.includes(who))
    return conn.reply(
      m.chat,
      `ꕥ El usuario mencionado no es un Socket activo.`,
      m
    )

  if (chat.primaryBot === who)
    return conn.reply(
      m.chat,
      `ꕥ @${who.split('@')[0]} ya es el Bot primario.`,
      m,
      { mentions: [who] }
    )

  try {
    chat.primaryBot = who

    return conn.reply(
      m.chat,
      `❀ @${who.split('@')[0]} ahora es el Bot primario del grupo.\n> Todos los comandos serán ejecutados por él.`,
      m,
      { mentions: [who] }
    )
  } catch (e) {
    return conn.reply(
      m.chat,
      `⚠︎ Error inesperado.\n> Usa *${usedPrefix}report* para informarlo.\n\n${e.message}`,
      m
    )
  }
}

handler.help = ['setprimary @bot', 'delprimary']
handler.tags = ['group']
handler.command = ['setprimary', 'delprimary']
handler.group = true
handler.admin = true

export default handler
