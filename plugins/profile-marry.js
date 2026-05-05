import fs from 'fs';
import path from 'path';

const marriagesFile = path.resolve('src/database/casados.json');

let proposals = {};
let marriages = loadMarriages();
const confirmation = {};

function ensureGlobalDb() {
  if (!global.db) global.db = { data: { users: {}, proposals: {} } }
  if (!global.db.data) global.db.data = { users: {}, proposals: {} }
  if (!global.db.data.users) global.db.data.users = {}
  if (!global.db.data.proposals) global.db.data.proposals = {}
  for (const p in global.db.data.proposals) {
    proposals[p] = global.db.data.proposals[p]
  }
}

function loadMarriages() {
  try {
    if (fs.existsSync(marriagesFile)) {
      const data = JSON.parse(fs.readFileSync(marriagesFile, 'utf8') || '{}')
      // asegura global DB inicializada
      try { ensureGlobalDb() } catch (e) { /* ignore */ }
      // sincronizar al global.db.data.users (marry field)
      for (const a in data) {
        if (!global.db.data.users[a]) global.db.data.users[a] = {}
        global.db.data.users[a].marry = data[a]
      }
      // also ensure reverse entries exist in users map if present
      for (const a in data) {
        const b = data[a]
        if (!global.db.data.users[b]) global.db.data.users[b] = {}
        global.db.data.users[b].marry = a
      }
      return data
    } else {
      try { ensureGlobalDb() } catch (e) { /* ignore */ }
      return {}
    }
  } catch (err) {
    console.error('loadMarriages error:', err)
    try { ensureGlobalDb() } catch (e) { /* ignore */ }
    return {}
  }
}

function saveMarriages() {
  try {
    fs.writeFileSync(marriagesFile, JSON.stringify(marriages, null, 2))
    // sincronizar con global.db.data.users
    ensureGlobalDb()
    // primero limpiar marry en todos users (para evitar residuos)
    for (const uid in global.db.data.users) {
      if (global.db.data.users[uid].marry) global.db.data.users[uid].marry = ''
    }
    for (const a in marriages) {
      if (!global.db.data.users[a]) global.db.data.users[a] = {}
      global.db.data.users[a].marry = marriages[a]
    }
  } catch (err) {
    console.error('saveMarriages error:', err)
  }
}

// persistir proposals en global.db.data.proposals
function saveProposalsToDb() {
  try {
    ensureGlobalDb()
    global.db.data.proposals = {}
    for (const p in proposals) {
      global.db.data.proposals[p] = proposals[p]
    }
  } catch (err) {
    console.error('saveProposalsToDb error:', err)
  }
}

// eliminar propuesta persistente
function removeProposalFromDb(proposer) {
  try {
    ensureGlobalDb()
    if (global.db.data.proposals && global.db.data.proposals[proposer]) {
      delete global.db.data.proposals[proposer]
    }
  } catch (err) {
    console.error('removeProposalFromDb error:', err)
  }
}

// Helper
const userIsMarried = (user) => marriages[user] !== undefined && marriages[user] !== null && marriages[user] !== ''

// MAIN HANDLER
const handler = async (m, { conn, command }) => {
  try {
    ensureGlobalDb()

    const isPropose = /^marry$/i.test(command)
    const isDivorce = /^divorce$/i.test(command)

    if (isPropose) {
      const proposer = m.sender
      const proposee = m.quoted?.sender || (m.mentionedJid && m.mentionedJid[0])

      // Si no hay target: se interpreta como intento de aceptar (si existe propuesta para ti)
      if (!proposee) {
        // check si tiene propuesta pendiente en global.db o memoria
        const pendingFrom = Object.keys(proposals).find(p => proposals[p] === proposer)
        if (pendingFrom) {
          // aceptar propuesta pendiente (pendingFrom propuso a proposer)
          // Validaciones
          if (userIsMarried(proposer)) return await conn.reply(m.chat, `⚠︎ Ya estás casado/a con @${marriages[proposer].split('@')[0]}`, m, { mentions: [marriages[proposer]] })
          if (userIsMarried(pendingFrom)) return await conn.reply(m.chat, `⚠︎ La persona que te propuso ya está casada con @${marriages[pendingFrom].split('@')[0]}`, m, { mentions: [marriages[pendingFrom]] })

          // registrar matrimonio
          marriages[pendingFrom] = proposer
          marriages[proposer] = pendingFrom
          saveMarriages()

          // limpiar propuesta persistente y memoria
          delete proposals[pendingFrom]
          removeProposalFromDb(pendingFrom)

          // actualizar global.db.data.users
          if (!global.db.data.users[proposer]) global.db.data.users[proposer] = {}
          if (!global.db.data.users[pendingFrom]) global.db.data.users[pendingFrom] = {}
          global.db.data.users[proposer].marry = pendingFrom
          global.db.data.users[pendingFrom].marry = proposer

          return await conn.reply(
            m.chat,
            `💍 *¡Felicidades!*\n@${pendingFrom.split('@')[0]} y @${proposer.split('@')[0]} ahora están casados ❤️`,
            m,
            { mentions: [pendingFrom, proposer] }
          )
        }

        // Si no hay propuesta para aceptar, dar ayuda o mostrar estado
        if (userIsMarried(proposer)) {
          return await conn.reply(
            m.chat,
            `🎉 Ya estás casado/a con *@${marriages[proposer].split('@')[0]}*\n> Usa: *#divorce* para divorciarte.`,
            m,
            { mentions: [marriages[proposer]] }
          )
        }

        return await conn.reply(
          m.chat,
          '🌷 Debes mencionar a alguien para proponer matrimonio, o responde a una propuesta con *.marry* para aceptar.\nEjemplo: *.marry @usuario*',
          m
        )
      }

      // Validaciones generales
      if (proposer === proposee) return await conn.reply(m.chat, '😼 ¡No puedes proponerte matrimonio a ti mismo!', m)
      if (userIsMarried(proposer)) return await conn.reply(m.chat, `⚠︎ Ya estás casado/a con @${marriages[proposer].split('@')[0]}`, m, { mentions: [marriages[proposer]] })
      if (userIsMarried(proposee)) return await conn.reply(m.chat, `⚠︎ @${proposee.split('@')[0]} ya está casado/a con @${marriages[proposee].split('@')[0]}`, m, { mentions: [proposee, marriages[proposee]] })

      // Si la otra persona ya propuso al que propone -> casar automáticamente
      if (proposals[proposee] && proposals[proposee] === proposer) {
        // auto-aceptación cruzada
        marriages[proposee] = proposer
        marriages[proposer] = proposee
        saveMarriages()

        // limpiar proposals
        delete proposals[proposee]
        removeProposalFromDb(proposee)

        // actualizar global.db usuarios
        if (!global.db.data.users[proposer]) global.db.data.users[proposer] = {}
        if (!global.db.data.users[proposee]) global.db.data.users[proposee] = {}
        global.db.data.users[proposer].marry = proposee
        global.db.data.users[proposee].marry = proposer

        return await conn.reply(
          m.chat,
          `💍 *¡Felicidades!*\n@${proposer.split('@')[0]} y @${proposee.split('@')[0]} ahora están casados ❤️`,
          m,
          { mentions: [proposer, proposee] }
        )
      }

      // Crear propuesta (en memoria y persistente)
      proposals[proposer] = proposee
      saveProposalsToDb() // sincroniza a global.db.data.proposals

      // preparar confirmación para proposee (timeout)
      if (confirmation[proposee] && confirmation[proposee].timeout) clearTimeout(confirmation[proposee].timeout)
      confirmation[proposee] = {
        proposer,
        timeout: setTimeout(async () => {
          // avisar expiración
          try {
            await conn.sendMessage(m.chat, { text: '*🥺 Se acabó el tiempo. La propuesta fue cancelada.*' }, { quoted: m })
          } catch (e) { /* ignore */ }
          delete confirmation[proposee]
          // limpiar propuesta persistente
          if (proposals[proposer]) { delete proposals[proposer]; removeProposalFromDb(proposer) }
        }, 2 * 60 * 1000) // 2 minutos
      }

      // mensaje de propuesta con menciones limpias
      await conn.reply(
        m.chat,
        `💖 @${proposer.split('@')[0]} le ha propuesto matrimonio a @${proposee.split('@')[0]} 💍\n\nResponde con: *Si* para aceptar o *No* para rechazar.\n⏳ La propuesta expira en 2 minutos.`,
        m,
        { mentions: [proposer, proposee] }
      )

      return
    }

    // Divorce
    if (isDivorce) {
      const who = m.sender
      if (!userIsMarried(who)) return await conn.reply(m.chat, '💔 No estás casado con nadie.', m)
      const partner = marriages[who]

      // eliminar entradas de marriages
      delete marriages[who]
      delete marriages[partner]
      saveMarriages()

      // limpiar global.db.data.users
      if (!global.db.data.users[who]) global.db.data.users[who] = {}
      if (!global.db.data.users[partner]) global.db.data.users[partner] = {}
      global.db.data.users[who].marry = ''
      global.db.data.users[partner].marry = ''

      return await conn.reply(
        m.chat,
        `💔 @${who.split('@')[0]} y @${partner.split('@')[0]} se han divorciado.`,
        m,
        { mentions: [who, partner] }
      )
    }

  } catch (err) {
    console.error('marry handler error:', err)
    try { await conn.reply(m.chat, `⚠︎ Error: ${err.message || err}`, m) } catch (e) { /* ignore */ }
  }
}

// BEFORE: manejar respuestas Si / No del proposee
handler.before = async (m, { conn }) => {
  try {
    if (m.isBaileys) return
    if (!m.text) return

    const text = m.text.trim()
    const me = m.sender

    // si hay confirmacion pendiente para este usuario
    if (!(me in confirmation)) return

    const { proposer, timeout } = confirmation[me]

    // Rechazo
    if (/^No$/i.test(text)) {
      clearTimeout(timeout)
      delete confirmation[me]

      // limpiar propuesta persistente y memoria
      if (proposals[proposer]) delete proposals[proposer]
      removeProposalFromDb(proposer)

      return conn.sendMessage(
        m.chat,
        {
          text: `💔 @${me.split('@')[0]} ha rechazado la propuesta de @${proposer.split('@')[0]}.`,
          mentions: [me, proposer]
        },
        { quoted: m }
      )
    }

    // Aceptación
    if (/^Si$/i.test(text)) {
      clearTimeout(timeout)
      delete confirmation[me]

      // registrar matrimonio
      marriages[proposer] = me
      marriages[me] = proposer
      saveMarriages()

      // actualizar global.db.data.users
      if (!global.db.data.users[proposer]) global.db.data.users[proposer] = {}
      if (!global.db.data.users[me]) global.db.data.users[me] = {}
      global.db.data.users[proposer].marry = me
      global.db.data.users[me].marry = proposer

      // limpiar propuesta persistente
      if (proposals[proposer]) delete proposals[proposer]
      removeProposalFromDb(proposer)

      return conn.sendMessage(
        m.chat,
        {
          text: `💍 *¡Se han casado!* ❤️\n\n@${proposer.split('@')[0]} ❤ @${me.split('@')[0]}\n\n✨ ¡Felicidades!`,
          mentions: [proposer, me]
        },
        { quoted: m }
      )
    }

  } catch (err) {
    console.error('handler.before error:', err)
  }
}

handler.tags = ['fun']
handler.help = ['marry *@usuario*', 'divorce']
handler.command = ['marry', 'divorce']
handler.group = true

export default handler
