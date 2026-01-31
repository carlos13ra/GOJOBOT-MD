import ws from 'ws'
import fs from 'fs'

const FILE = './lib/primary.json'

const handler = async (m, { conn, usedPrefix }) => {

  if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, '{}')

  const data = JSON.parse(fs.readFileSync(FILE))

  const subBots = [...new Set([
    ...global.conns
      .filter(c => c.user && c.ws?.socket && c.ws.socket.readyState !== ws.CLOSED)
      .map(c => c.user.jid)
  ])]

  if (global.conn?.user?.jid && !subBots.includes(global.conn.user.jid)) {
    subBots.push(global.conn.user.jid)
  }

  const mentionedJid = m.mentionedJid || []
  const who = mentionedJid[0] || (m.quoted && m.quoted.sender)

  if (!who) {
    return conn.reply(m.chat, `❀ Menciona al socket que quieres como bot principal.`, m)
  }

  if (!subBots.includes(who)) {
    return conn.reply(m.chat, `ꕥ Ese usuario no es un Socket de *${global.botname || 'este bot'}*.`, m)
  }

  if (data[m.chat] === who) {
    return conn.reply(
      m.chat,
      `ꕥ @${who.split('@')[0]} ya es el Bot primario de este grupo.`,
      m,
      { mentions: [who] }
    )
  }

  data[m.chat] = who
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2))

  conn.reply(
    m.chat,
    `👑 Se ha establecido a @${who.split('@')[0]} como Bot primario.\n\n> Ahora SOLO ese bot responderá en este grupo.`,
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
