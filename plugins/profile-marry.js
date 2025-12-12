// marry-handler.js
let proposals = {}

async function resolveTarget(m, conn, args) {
  if (m.mentionedJid && m.mentionedJid.length) return m.mentionedJid[0]
  if (m.quoted && m.quoted.sender) return m.quoted.sender

  if (args && args.length) {
    let raw = args[0].trim()

    if (/@s\.whatsapp\.net$/.test(raw)) return raw

    let digits = raw.replace(/\D/g, '')
    if (digits.length >= 7) return `${digits}@s.whatsapp.net`

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

  return null
}

let handler = async (m, { conn, command, args }) => {
  try {
    const me = m.sender
    const users = global.db.data.users = global.db.data.users || {}

    if (!users[me]) users[me] = { marry: null }

    const target = await resolveTarget(m, conn, args)

    console.log(`[marry] usuario: ${me} -> target resuelto: ${target}`)

    if (!target) {
      return conn.reply(
        m.chat,
        `❀ No pude identificar al usuario objetivo.\nAsegúrate de *mencionar tocando el contacto*, o usar el número: *.marry 519XXXXXXXX* o responder al mensaje del usuario.`,
        m
      )
    }

    if (target === me)
      return conn.reply(m.chat, 'ꕥ No puedes casarte contigo mismo.', m)

    if (!users[target]) users[target] = { marry: null }

    if (users[me].marry) {
      return conn.reply(
        m.chat,
        `ꕥ Ya estás casado/a con @${users[me].marry.split('@')[0]}`,
        m,
        { mentions: [users[me].marry] }
      )
    }

    if (users[target].marry) {
      return conn.reply(
        m.chat,
        `ꕥ @${target.split('@')[0]} ya está casado/a con @${users[target].marry.split('@')[0]}`,
        m,
        { mentions: [target, users[target].marry] }
      )
    }

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

    proposals[me] = target
    setTimeout(() => { if (proposals[me]) delete proposals[me] }, 120000)

    // ✔ MENCIONA A LOS DOS COMO PEDISTE
    return conn.reply(
      m.chat,
      `ꕥ @${me.split('@')[0]} le ha propuesto matrimonio a @${target.split('@')[0]} 💍

Responde con: *.marry* para aceptar.
La propuesta expira en *2 minutos*.`,
      m,
      { mentions: [me, target] }
    )

  } catch (err) {
    console.error('Error en marry handler:', err)
    return conn.reply(m.chat, '⚠︎ Se ha producido un error en el comando marry. Revisa la consola del bot.', m)
  }
}

// --- ✔ COMANDO DIVORCE CON MENCIÓN A LOS DOS ---
handler.before = async function (m, { conn }) {
  if (!m.text) return

  const text = m.text.trim().toLowerCase()

  if (text === '.divorce' || text === 'divorce' || text === '/divorce') {
    const me = m.sender
    const users = global.db.data.users = global.db.data.users || {}

    if (!users[me] || !users[me].marry)
      return conn.reply(m.chat, '⚠︎ No estás casado con nadie.', m)

    const pareja = users[me].marry

    users[me].marry = null
    if (users[pareja]) users[pareja].marry = null

    return conn.reply(
      m.chat,
      `💔 *Divorcio realizado*\n@${me.split('@')[0]} y @${pareja.split('@')[0]} ya no están casados.`,
      m,
      { mentions: [me, pareja] }
    )
  }
}

handler.help = ['marry', 'divorce']
handler.tags = ['fun']
handler.command = ['marry']
handler.group = true

export default handler
