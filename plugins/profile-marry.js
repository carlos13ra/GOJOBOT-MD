import { promises as fs } from 'fs'

/**
 * Marry / Divorce handler
 * - Proponer: responder al mensaje de la persona OR mencionar @usuario
 * - Aceptar: responder al MENSAJE DEL BOT con "si" o "aceptar"
 * - Rechazar: responder al MENSAJE DEL BOT con "no" o "rechazar"
 * - Usa conn.marriageRequests para mapear propuesta -> { from, to }
 */

let proposals = {} // por compatibilidad (no estrictamente necesario)
 
const verifi = async () => {
  try {
    const data = await fs.readFile('./package.json', 'utf-8')
    const json = JSON.parse(data)
    return json?.repository?.url === 'git+https://github.com/carlos13ra/GOJOBOT-MD.git'
  } catch {
    return false
  }
}

let handler = async (m, { conn, command, usedPrefix }) => {
  // si quieres que la verificación sea obligatoria, descomenta:
  if (!await verifi()) return conn.reply(m.chat, '❀ El comando solo está disponible para Gojo Bot.', m)

  const sender = m.sender

  // Detectar target:
  // - si respondes a un mensaje: m.quoted.sender || m.quoted.participant
  // - si mencionas: m.mentionedJid?.[0]
  let target = null
  if (m.quoted) {
    target = m.quoted.sender || m.quoted.participant || null
  } 
  // permitir también proponer mediante mención si no hay reply
  if (!target && Array.isArray(m.mentionedJid) && m.mentionedJid.length) {
    target = m.mentionedJid[0]
  }

  // normalizar DB
  global.db = global.db || { data: { users: {} } }
  const users = global.db.data.users

  // asegurar objetos de usuario
  users[sender] = users[sender] || {}
  if (target) users[target] = users[target] || {}

  // -------------------------
  //  SWITCH COMMAND
  // -------------------------
  try {
    switch (command) {

      // PROPOSAL
      case 'marry': {
        if (!target) {
          return conn.reply(
            m.chat,
            `❀ Debes responder el mensaje de la persona o mencionar @usuario.\nEjemplo:\n- Responde su mensaje y escribe: *${usedPrefix}marry*\n- O escribe: *${usedPrefix}marry @user*`,
            m
          )
        }

        if (sender === target) {
          return conn.reply(m.chat, 'ꕥ No puedes casarte contigo mismo.', m)
        }

        // Si ya están casados
        if (users[sender].marry) {
          return conn.reply(
            m.chat,
            `ꕥ Ya estás casado/a con @${users[sender].marry.split('@')[0]}`,
            m,
            { mentions: [users[sender].marry] }
          )
        }
        if (users[target].marry) {
          return conn.reply(
            m.chat,
            `ꕥ @${target.split('@')[0]} ya está casado/a con otra persona.`,
            m,
            { mentions: [target] }
          )
        }

        // Si target ya propuso a sender -> casar al instante
        if (proposals[target] && proposals[target] === sender) {
          // confirmar matrimonio bilateral
          users[sender].marry = target
          users[target].marry = sender
          // limpiar
          delete proposals[target]
          // notificar
          return conn.reply(
            m.chat,
            `💞 ¡Se han casado! 💍\n\n@${sender.split('@')[0]} y @${target.split('@')[0]} ahora están casados.`,
            m,
            { mentions: [sender, target] }
          )
        }

        // Crear propuesta: registramos una solicitud ligada al mensaje que envíe el bot
        // Enviamos mensaje de propuesta y guardamos su id para que la respuesta tenga referencia
        const txt =
          `💍 *Solicitud de Matrimonio*\n\n` +
          `@${sender.split('@')[0]} quiere casarse con @${target.split('@')[0]}.\n\n` +
          `Responde al mensaje del bot con:\n` +
          `✔️ *si*  — para aceptar\n` +
          `❌ *no*  — para rechazar\n\n` +
          `⏳ La propuesta expirará en 2 minutos.`

        // enviamos el mensaje (reply) y esperamos el objeto devuelto (ask.key.id)
        // muchos frameworks devuelven el mensaje; si tu versión no devuelve, adapta.
        const ask = await conn.reply(m.chat, txt, m, { mentions: [sender, target] })

        // inicializar container en conn si no existe
        conn.marriageRequests = conn.marriageRequests || {}

        // el id de la respuesta del bot puede ser ask.key.id
        const askId = ask?.key?.id || (ask?.id) || (new Date()*1).toString() // fallback improbable

        // guardamos la solicitud por id de mensaje del bot
        conn.marriageRequests[askId] = {
          from: sender,
          to: target,
          expires: Date.now() + 120000 // 2 minutos
        }

        // También guardamos en proposals por target para compatibilidad con algunos flujos
        proposals[target] = sender

        // Programamos limpieza por expiración
        setTimeout(() => {
          // limpiar por askId y por target
          if (conn.marriageRequests) {
            if (conn.marriageRequests[askId]) delete conn.marriageRequests[askId]
          }
          if (proposals[target] && proposals[target] === sender) delete proposals[target]
        }, 120000)

        break
      }

      // DIVORCIO
      case 'divorce': {
        if (!users[sender].marry) {
          return conn.reply(m.chat, '✎ Tú no estás casado con nadie.', m)
        }
        const pareja = users[sender].marry
        // borrar vínculo bilateral
        delete users[sender].marry
        if (users[pareja]) delete users[pareja].marry

        return conn.reply(
          m.chat,
          `💔 *Divorcio completado*\n\n@${sender.split('@')[0]} y @${pareja.split('@')[0]} ya no están casados.`,
          m,
          { mentions: [sender, pareja] }
        )
      }
    }
  } catch (err) {
    return conn.reply(m.chat, `⚠︎ Se ha producido un error.\n${err}`, m)
  }
}

// -------------------------
// handler.before -> maneja "si" / "no" cuando
// la persona responde al MENSAJE DEL BOT (la propuesta)
// -------------------------
handler.before = async (m, { conn }) => {
  // sólo si hay quoted (respondiendo) y existe una petición guardada para ese quoted id
  if (!m.quoted) return
  if (!conn.marriageRequests) return

  const quotedId = m.quoted.key?.id || m.quoted.id
  if (!quotedId) return

  const req = conn.marriageRequests[quotedId]
  if (!req) return

  // sólo el destinatario puede responder (req.to)
  if (m.sender !== req.to) return

  const text = (m.text || '').trim().toLowerCase()

  // ACEPTAR: "si" o "aceptar"
  if (text === 'si' || text === 'aceptar') {
    // crear matrimonio bilateral
    global.db = global.db || { data: { users: {} } }
    const users = global.db.data.users
    users[req.from] = users[req.from] || {}
    users[req.to] = users[req.to] || {}

    users[req.from].marry = req.to
    users[req.to].marry = req.from

    await conn.reply(
      m.chat,
      `💍✨ *¡Felicidades!*\n\n@${req.from.split('@')[0]} y @${req.to.split('@')[0]} ahora están oficialmente casados. ❤️`,
      m,
      { mentions: [req.from, req.to] }
    )

    // limpiar
    delete conn.marriageRequests[quotedId]
    if (proposals[req.to] && proposals[req.to] === req.from) delete proposals[req.to]
    return
  }

  // RECHAZAR: "no" o "rechazar"
  if (text === 'no' || text === 'rechazar') {
    await conn.reply(
      m.chat,
      `❌ @${req.to.split('@')[0]} ha rechazado la propuesta de @${req.from.split('@')[0]}.`,
      m,
      { mentions: [req.to, req.from] }
    )

    delete conn.marriageRequests[quotedId]
    if (proposals[req.to] && proposals[req.to] === req.from) delete proposals[req.to]
    return
  }

  // Si responde otra cosa, ignoramos (no quitamos la petición)
}

// Metadatos (igual que pediste)
handler.help = ['marry @usuario', 'divorce']
handler.tags = ['profile']
handler.command = ['marry', 'divorce']
handler.group = true

export default handler
