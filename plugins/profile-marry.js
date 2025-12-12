let proposals = {}

let handler = async (m, { conn, command, args }) => {
  try {
    const user = m.sender
    const users = global.db.data.users

    if (!users[user]) users[user] = { marry: null }

    // Obtener objetivo
    let target =
      m.mentionedJid?.[0] ||
      m.quoted?.sender ||
      null

    if (!target) {
      return conn.reply(
        m.chat,
        "❀ Debes mencionar o responder a alguien.\nEjemplo: *.marry @usuario*",
        m
      )
    }

    if (target === user)
      return conn.reply(m.chat, "ꕥ No puedes casarte contigo mismo.", m)

    if (!users[target]) users[target] = { marry: null }

    // Si ya estás casado
    if (users[user].marry) {
      return conn.reply(
        m.chat,
        `ꕥ Ya estás casado/a con @${users[user].marry.split('@')[0]}`,
        m,
        { mentions: [users[user].marry] }
      )
    }

    // Si el objetivo ya está casado
    if (users[target].marry) {
      return conn.reply(
        m.chat,
        `ꕥ Ya está casado con @${users[target].marry.split('@')[0]}`,
        m,
        { mentions: [users[target].marry] }
      )
    }

    // Si el otro ya propuso → aceptar
    if (proposals[target] === user) {
      delete proposals[target]

      users[user].marry = target
      users[target].marry = user

      return conn.reply(
        m.chat,
        `💍 *¡Felicidades!*\n@${user.split('@')[0]} y @${target.split('@')[0]} ahora están casados ❤️`,
        m,
        { mentions: [user, target] }
      )
    }

    // Crear propuesta
    proposals[user] = target
    setTimeout(() => {
      if (proposals[user]) delete proposals[user]
    }, 120000)

    return conn.reply(
      m.chat,
      `ꕥ @${user.split('@')[0]} te ha propuesto matrimonio.

Responde con: *.marry* para aceptar.
La propuesta expira en *2 minutos*.`,
      m,
      { mentions: [target, user] }
    )

  } catch (e) {
    console.log("Error en marry:", e)
    return conn.reply(m.chat, "⚠ Error inesperado en el comando marry.", m)
  }
}

handler.help = ["marry", "divorce"]
handler.tags = ["fun"]
handler.command = ["marry"]
handler.group = true

export default handler
