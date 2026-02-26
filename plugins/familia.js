let handler = async (m, { conn }) => {
  let user = global.db.data.users[m.sender]
  if (!user) global.db.data.users[m.sender] = {}

  // =========================
  // ACEPTAR / RECHAZAR
  // =========================
  if (/^(aceptar|rechazar)$/i.test(m.text)) {
    if (m.text.toLowerCase() === 'rechazar') {
      user.pendingHijo = null
      user.pendingHija = null
      user.pendingMascota = null
      return m.reply('❌ Propuesta rechazada')
    }

    // ACEPTAR HIJO
    if (user.pendingHijo) {
      let parent = user.pendingHijo
      if (!global.db.data.users[parent].hijos) global.db.data.users[parent].hijos = []

      global.db.data.users[parent].hijos.push(m.sender)
      user.padre = parent
      user.pendingHijo = null

      return m.reply('👶 Ahora eres hijo oficialmente')
    }

    // ACEPTAR HIJA
    if (user.pendingHija) {
      let parent = user.pendingHija
      if (!global.db.data.users[parent].hijas) global.db.data.users[parent].hijas = []

      global.db.data.users[parent].hijas.push(m.sender)
      user.padre = parent
      user.pendingHija = null

      return m.reply('👧 Ahora eres hija oficialmente')
    }

    // ACEPTAR MASCOTA
    if (user.pendingMascota) {
      let owner = user.pendingMascota
      if (!global.db.data.users[owner].mascotas) global.db.data.users[owner].mascotas = []

      global.db.data.users[owner].mascotas.push(m.sender)
      user.dueno = owner
      user.pendingMascota = null

      return m.reply('🐶 Ahora eres mascota oficialmente')
    }

    return
  }

  // =========================
  // PROHIBIR SI NO ES COMANDO
  // =========================
  let command = m.text.split(' ')[0].toLowerCase()

  if (!['.prohijo', '.prohija', '.promascota'].includes(command)) return

  let target = m.mentionedJid?.[0] || m.quoted?.sender
  if (!target) return m.reply('❌ Responde o etiqueta a alguien')

  let sender = m.sender

  if (!global.db.data.users[target]) global.db.data.users[target] = {}

  // =========================
  // PROHIJO
  // =========================
  if (command === '.prohijo') {
    global.db.data.users[target].pendingHijo = sender

    return conn.sendMessage(m.chat, {
      text: `👶 *Propuesta de hijo*\n\n@${sender.split('@')[0]} quiere que @${target.split('@')[0]} sea su hijo.\n\nResponde *aceptar* o *rechazar*`,
      mentions: [sender, target]
    }, { quoted: m })
  }

  // =========================
  // PROHIJA
  // =========================
  if (command === '.prohija') {
    global.db.data.users[target].pendingHija = sender

    return conn.sendMessage(m.chat, {
      text: `👧 *Propuesta de hija*\n\n@${sender.split('@')[0]} quiere que @${target.split('@')[0]} sea su hija.\n\nResponde *aceptar* o *rechazar*`,
      mentions: [sender, target]
    }, { quoted: m })
  }

  // =========================
  // PROMASCOTA
  // =========================
  if (command === '.promascota') {
    global.db.data.users[target].pendingMascota = sender

    return conn.sendMessage(m.chat, {
      text: `🐶 *Propuesta de mascota*\n\n@${sender.split('@')[0]} quiere que @${target.split('@')[0]} sea su mascota.\n\nResponde *aceptar* o *rechazar*`,
      mentions: [sender, target]
    }, { quoted: m })
  }
}

handler.customPrefix = /^(\.prohijo|\.prohija|\.promascota|aceptar|rechazar)$/i
handler.command = new RegExp

export default handler
