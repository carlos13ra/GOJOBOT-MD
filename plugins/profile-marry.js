let proposals = {} // temporal de propuestas activas

let handler = async (m, { conn, command, usedPrefix }) => {
  const sender = m.sender
  const users = global.db.data.users

  if (!users[sender]) users[sender] = {}
  if (!users[sender].marry) users[sender].marry = null

  // obtener la persona mencionada o respondida
  const target = m.mentionedJid?.[0] || m.quoted?.sender
  if (!target) return m.reply(`❀ Debes mencionar a alguien o responder su mensaje.\n\nEjemplo: *${usedPrefix}marry @usuario*`)

  if (target === sender)
    return m.reply(`ꕥ No puedes casarte contigo mismo.`)

  const user1 = users[sender]
  const user2 = users[target] || (users[target] = { marry: null })

  switch (command) {
    case 'marry':
      if (user1.marry)
        return m.reply(`ꕥ Ya estás casado/a con *${users[user1.marry]?.name || '@' + user1.marry}*.`)
      if (user2.marry)
        return m.reply(`ꕥ ${users[target].name || '@' + target} ya está casado/a con *${users[user2.marry]?.name || '@' + user2.marry}*.`)

      // Si el otro ya te propuso, se casan
      if (proposals[target] === sender) {
        delete proposals[target]
        user1.marry = target
        user2.marry = sender
        return conn.reply(
          m.chat,
          `✩.･:｡≻─────⋆♡⋆─────.•:｡✩
💍 ¡Felicidades! 💍
*${user1.name || '@' + sender}* y *${user2.name || '@' + target}*
¡se han casado! 💞
✩.･:｡≻─────⋆♡⋆─────.•:｡✩`,
          m,
          { mentions: [sender, target] }
        )
      }

      // crear nueva propuesta
      proposals[sender] = target
      setTimeout(() => delete proposals[sender], 120000) // expira en 2 min

      return conn.reply(
        m.chat,
        `♡ *${user1.name || '@' + sender}* te ha propuesto matrimonio 💍\n\nResponde con *${usedPrefix}marry @${user1.name || sender}* para aceptar.`,
        m,
        { mentions: [sender, target] }
      )

    case 'divorce':
      if (!user1.marry)
        return m.reply(`✎ No estás casado/a con nadie.`)

      const partner = user1.marry
      users[partner].marry = null
      user1.marry = null

      return conn.reply(
        m.chat,
        `💔 *${user1.name || '@' + sender}* y *${users[partner].name || '@' + partner}* se han divorciado.`,
        m,
        { mentions: [sender, partner] }
      )
  }
}

handler.help = ['marry @usuario', 'divorce']
handler.tags = ['profile']
handler.command = ['marry', 'divorce']

export default handler
