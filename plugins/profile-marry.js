// marry-handler.js
let proposals = {}

async function resolveTarget(m, conn, args) {
  // 1) m.mentionedJid (cuando la mención fue hecha tocando el contacto)
  if (m.mentionedJid && m.mentionedJid.length) return m.mentionedJid[0]

  // 2) quoted message (responder al mensaje)
  if (m.quoted && m.quoted.sender) return m.quoted.sender

  // 3) args[0] puede ser:
  //    - número: 519XXXXXXXX
  //    - jid: 519...@s.whatsapp.net
  //    - @nombre (texto) -> intentar buscar en participantes del grupo por nombre
  if (args && args.length) {
    let raw = args[0].trim()

    // aceptar si el usuario pasó jid completo
    if (/@s\.whatsapp\.net$/.test(raw)) return raw

    // si viene con @ y números -> construir jid
    let digits = raw.replace(/\D/g, '')
    if (digits.length >= 7) {
      // si es número válido, asumir JID
      return `${digits}@s.whatsapp.net`
    }

    // si es texto (nombre), intentar buscar en participantes del grupo por coincidencia
    try {
      if (m.chat && m.isGroup) {
        const metadata = await conn.groupMetadata(m.chat)
        const participants = metadata.participants || []

        const q = raw.replace(/^@/, '').toLowerCase()
        for (let p of participants) {
          const jid = p.id || p.jid || p
          const name = (await conn.getName(jid)).toLowerCase()
          if (name.includes(q) || jid.split('@')[0].includes(q)) {
            return jid
          }
        }
      }
    } catch (e) {
      console.log('resolveTarget - error buscando en participantes:', e)
    }
  }

  // nada encontrado
  return null
}

let handler = async (m, { conn, command, args }) => {
  try {
    const me = m.sender
    const users = global.db.data.users = global.db.data.users || {}

    if (!users[me]) users[me] = { marry: null }

    // resolver target robustamente
    const target = await resolveTarget(m, conn, args)

    // Depuración: (quita o comenta si no quieres logs)
    console.log(`[marry] usuario: ${me} -> target resuelto: ${target}`)

    if (!target) {
      return conn.reply(
        m.chat,
        `❀ No pude identificar al usuario objetivo.\nAsegúrate de *mencionar tocando el contacto*, o usar el número: *.marry 519XXXXXXXX* o responder al mensaje del usuario.`,
        m
      )
    }

    if (target === me) return conn.reply(m.chat, 'ꕥ No puedes casarte contigo mismo.', m)

    if (!users[target]) users[target] = { marry: null }

    // ya casado quien propone?
    if (users[me].marry) {
      return conn.reply(
        m.chat,
        `ꕥ Ya estás casado/a con @${users[me].marry.split('@')[0]}`,
        m,
        { mentions: [users[me].marry] }
      )
    }

    // objetivo ya casado?
    if (users[target].marry) {
      return conn.reply(
        m.chat,
        `ꕥ @${target.split('@')[0]} ya está casado/a con @${users[target].marry.split('@')[0]}`,
        m,
        { mentions: [target, users[target].marry] }
      )
    }

    // si target ya propuso a me -> aceptar
    if (proposals[target] && proposals[target] === me) {
      delete proposals[target]
      users[me].marry = target
      users[target].marry = me

      return conn.reply(
        m.chat,
        `💍 *¡Felicidades!*\n@${me.split('@')[0]} y @${target.split('@')[0]} ahora están casados ❤️`,
        m,
        { mentions: [me, target] }
      )
    }

    // crear propuesta
    proposals[me] = target
    setTimeout(() => { if (proposals[me]) delete proposals[me] }, 120000)

    return conn.reply(
      m.chat,
      `ꕥ @${me.split('@')[0]} te ha propuesto matrimonio.

Responde con: *.marry* para aceptar.
La propuesta expira en *2 minutos*.`,
      m,
      { mentions: [target, me] }
    )

  } catch (err) {
    console.error('Error en marry handler:', err)
    return conn.reply(m.chat, '⚠︎ Se ha producido un error en el comando marry. Revisa la consola del bot.', m)
  }
}

handler.help = ['marry', 'divorce']
handler.tags = ['fun']
handler.command = ['marry'] // tu framework añade el prefijo (ej: .marry)
handler.group = true

export default handler
