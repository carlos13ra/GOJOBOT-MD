let TIEMPO_LIMITE = 5 * 60 * 1000 // 5 minutos

let handler = async (m, { conn }) => {

  if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = {}
  let user = global.db.data.users[m.sender]

  let text = (m.text || '').toLowerCase().trim()
  let command = text.split(' ')[0]

  let target = m.mentionedJid?.[0] || m.quoted?.sender

  // =========================
  // PROPUESTAS
  // =========================

  if (command === '.prohijo' || command === '.prohija' || command === '.promascota') {
    if (!target) return m.reply('❌ Responde o etiqueta a alguien')

    if (!global.db.data.users[target]) global.db.data.users[target] = {}

    let now = Date.now()

    if (command === '.prohijo') {
      global.db.data.users[target].pendingHijo = {
        from: m.sender,
        time: now
      }
    }

    if (command === '.prohija') {
      global.db.data.users[target].pendingHija = {
        from: m.sender,
        time: now
      }
    }

    if (command === '.promascota') {
      global.db.data.users[target].pendingMascota = {
        from: m.sender,
        time: now
      }
    }

    return conn.sendMessage(m.chat, {
      text: `👨‍👩‍👧 *Propuesta de familia*\n\n@${m.sender.split('@')[0]} quiere que @${target.split('@')[0]} sea su *${command.replace('.', '').replace('pro','')}*\n\n⏳ Tienes 5 minutos\n\nResponde:\n✔ aceptar / si\n❌ rechazar / no`,
      mentions: [m.sender, target]
    }, { quoted: m })
  }

  // =========================
  // ACEPTAR / SI
  // =========================

  if (['aceptar', 'si', 'sí'].includes(command)) {
    let now = Date.now()

    // HIJO
    if (user.pendingHijo) {
      if (now - user.pendingHijo.time > TIEMPO_LIMITE) {
        user.pendingHijo = null
        return m.reply('⌛ La propuesta expiró')
      }

      let parent = user.pendingHijo.from
      let parentData = global.db.data.users[parent]

      if (!parentData.hijos) parentData.hijos = []
      parentData.hijos.push(m.sender)

      user.padre = parent
      user.pendingHijo = null

      return m.reply('👶 Ahora eres hijo oficialmente')
    }

    // HIJA
    if (user.pendingHija) {
      if (now - user.pendingHija.time > TIEMPO_LIMITE) {
        user.pendingHija = null
        return m.reply('⌛ La propuesta expiró')
      }

      let parent = user.pendingHija.from
      let parentData = global.db.data.users[parent]

      if (!parentData.hijas) parentData.hijas = []
      parentData.hijas.push(m.sender)

      user.padre = parent
      user.pendingHija = null

      return m.reply('👧 Ahora eres hija oficialmente')
    }

    // MASCOTA
    if (user.pendingMascota) {
      if (now - user.pendingMascota.time > TIEMPO_LIMITE) {
        user.pendingMascota = null
        return m.reply('⌛ La propuesta expiró')
      }

      let owner = user.pendingMascota.from
      let ownerData = global.db.data.users[owner]

      if (!ownerData.mascotas) ownerData.mascotas = []
      ownerData.mascotas.push(m.sender)

      user.dueno = owner
      user.pendingMascota = null

      return m.reply('🐶 Ahora eres mascota oficialmente')
    }

    return m.reply('❌ No tienes propuestas pendientes')
  }

  // =========================
  // RECHAZAR / NO
  // =========================

  if (['rechazar', 'no'].includes(command)) {
    if (user.pendingHijo || user.pendingHija || user.pendingMascota) {
      user.pendingHijo = null
      user.pendingHija = null
      user.pendingMascota = null
      return m.reply('❌ Propuesta rechazada')
    }
  }
}

handler.customPrefix = /^(\.prohijo|\.prohija|\.promascota|aceptar|rechazar|si|sí|no)$/i
handler.command = new RegExp

export default handler
