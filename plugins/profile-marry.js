import { promises as fs } from 'fs'

let proposals = {}

function normalizeJid(j) {
  if (!j) return null
  // si ya es jid
  if (/@s\.whatsapp\.net$/.test(j)) return j
  // si es número con + o sin +
  let num = j.replace(/\D/g, '')
  if (!num) return null
  // asumimos prefijo internacional si falta, ajústalo si tu país es fijo
  if (num.length <= 11) {
    // ejemplo Perú: 9XXXXXXXX -> 51...
    // si quieres evitar transformación, comenta la siguiente línea
    // return num + '@s.whatsapp.net' // NO recomendado sin validar
  }
  return (num.includes('@') ? num : `${num}@s.whatsapp.net`)
}

let handler = async (m, { conn, command, args }) => {
  try {
    const user = m.sender
    const users = global.db?.data?.users || (global.db.data.users = {})

    if (!users[user]) users[user] = { marry: null }

    // Intentar obtener target: m.mentionedJid, quoted sender, args[0]
    let target = null
    if (m.mentionedJid && m.mentionedJid.length) target = m.mentionedJid[0]
    else if (m.quoted && m.quoted.sender) target = m.quoted.sender
    else if (args && args.length) {
      // puede venir como @1234 o 519xxx o 519xxx@s.whatsapp.net
      let a = args[0].replace(/^@/, '')
      if (/@s\.whatsapp\.net$/.test(a)) target = a
      else {
        const num = a.replace(/\D/g, '')
        if (num) target = `${num}@s.whatsapp.net`
      }
    }

    if (!target) {
      return conn.reply(m.chat, '❀ Debes mencionar o responder a alguien.\nEjemplo: *.marry @usuario*', m)
    }

    // Normalizar (en caso)
    if (!/@s\.whatsapp\.net$/.test(target)) target = normalizeJid(target)
    if (!target) return conn.reply(m.chat, '❀ No pude identificar al usuario objetivo.', m)

    if (target === user) return conn.reply(m.chat, 'ꕥ No puedes casarte contigo mismo.', m)

    if (!users[target]) users[target] = { marry: null }

    // Si ya estás casado
    if (users[user].marry) {
      const spouse = users[user].marry
      return conn.reply(m.chat, `ꕥ Ya estás casado/a con *${spouse}*`, m)
    }

    // Si objetivo ya está casado
    if (users[target].marry) {
      const spouse = users[target].marry
      return conn.reply(m.chat, `ꕥ El usuario ya está casado/a con *${spouse}*`, m)
    }

    // Si la otra persona ya propuso a este usuario -> aceptar
    if (proposals[target] && proposals[target] === user) {
      // aceptar matrimonio
      delete proposals[target]
      users[user].marry = target
      users[target].marry = user

      return conn.reply(m.chat, `💍 ¡Felicidades!\n*${user}* y *${target}* ahora están casados ❤️`, m, { mentions: [user, target] })
    }

    // Crear propuesta del user hacia target
    proposals[user] = target
    // expira en 2 minutos
    setTimeout(() => { if (proposals[user]) delete proposals[user] }, 120000)

    return conn.reply(
      m.chat,
      `ꕥ *${user}* te ha propuesto matrimonio.\n\nResponde con: *.marry* para aceptar.\nLa propuesta expira en *2 minutos*.`,
      m,
      { mentions: [target] }
    )
  } catch (err) {
    console.error('Error en marry handler:', err)
    return conn.reply(m.chat, '⚠︎ Se ha producido un error en el comando marry. Revisa la consola del bot.', m)
  }
}

handler.help = ['marry', 'divorce']
handler.tags = ['fun']
handler.command = ['marry', 'divorce'] // sin punto: el framework maneja el prefijo
handler.group = true

export default handler
