let handler = async (m, { conn, command }) => {

  if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = {}
  let user = global.db.data.users[m.sender]

  // =========================
  // OBJETIVO (RESPUESTA O MENCIÓN)
  // =========================
  let target = m.mentionedJid?.[0] || m.quoted?.sender

  // =========================
  // PROHIJO
  // =========================
  if (command === 'prohijo') {
    if (!target) return m.reply('❌ Responde o etiqueta a alguien')

    if (!global.db.data.users[target]) global.db.data.users[target] = {}

    global.db.data.users[target].pendingHijo = m.sender

    return conn.sendMessage(m.chat, {
      text: `👶 *Propuesta de hijo*\n\n@${m.sender.split('@')[0]} quiere que @${target.split('@')[0]} sea su hijo\n\nResponde *aceptar* o *rechazar*`,
      mentions: [m.sender, target]
    }, { quoted: m })
  }

  // =========================
  // PROHIJA
  // =========================
  if (command === 'prohija') {
    if (!target) return m.reply('❌ Responde o etiqueta a alguien')

    if (!global.db.data.users[target]) global.db.data.users[target] = {}

    global.db.data.users[target].pendingHija = m.sender

    return conn.sendMessage(m.chat, {
      text: `👧 *Propuesta de hija*\n\n@${m.sender.split('@')[0]} quiere que @${target.split('@')[0]} sea su hija\n\nResponde *aceptar* o *rechazar*`,
      mentions: [m.sender, target]
    }, { quoted: m })
  }

  // =========================
  // PROMASCOTA
  // =========================
  if (command === 'promascota') {
    if (!target) return m.reply('❌ Responde o etiqueta a alguien')

    if (!global.db.data.users[target]) global.db.data.users[target] = {}

    global.db.data.users[target].pendingMascota = m.sender

    return conn.sendMessage(m.chat, {
      text: `🐶 *Propuesta de mascota*\n\n@${m.sender.split('@')[0]} quiere que @${target.split('@')[0]} sea su mascota\n\nResponde *aceptar* o *rechazar*`,
      mentions: [m.sender, target]
    }, { quoted: m })
  }

  // =========================
  // ACEPTAR
  // =========================
  if (command === 'aceptar') {

    // HIJO
    if (user.pendingHijo) {
      let parent = user.pendingHijo
      let parentData = global.db.data.users[parent]

      if (!parentData.hijos) parentData.hijos = []
      parentData.hijos.push(m.sender)

      user.padre = parent
      user.pendingHijo = null

      return m.reply('👶 Ahora eres hijo oficialmente')
    }

    // HIJA
    if (user.pendingHija) {
      let parent = user.pendingHija
      let parentData = global.db.data.users[parent]

      if (!parentData.hijas) parentData.hijas = []
      parentData.hijas.push(m.sender)

      user.padre = parent
      user.pendingHija = null

      return m.reply('👧 Ahora eres hija oficialmente')
    }

    // MASCOTA
    if (user.pendingMascota) {
      let owner = user.pendingMascota
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
  // RECHAZAR
  // =========================
  if (command === 'rechazar') {
    user.pendingHijo = null
    user.pendingHija = null
    user.pendingMascota = null

    return m.reply('❌ Propuesta rechazada')
  }
}

// 🔥 ESTA LÍNEA ES LA CLAVE
handler.command = ['prohijo', 'prohija', 'promascota', 'aceptar', 'rechazar']

export default handler
