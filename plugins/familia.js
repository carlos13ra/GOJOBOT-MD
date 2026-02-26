const familyConfirm = {} // confirmaciones temporales

const handler = async (m, { conn, command }) => {
  try {
    if (!global.db.data.users) global.db.data.users = {}

    const sender = m.sender
    const target = m.quoted?.sender || m.mentionedJid?.[0]

    if (!target) {
      return conn.reply(m.chat, '❌ Responde o etiqueta a alguien.', m)
    }

    if (sender === target) {
      return conn.reply(m.chat, '❌ No puedes hacer eso contigo mismo.', m)
    }

    if (!global.db.data.users[target]) global.db.data.users[target] = {}
    if (!global.db.data.users[sender]) global.db.data.users[sender] = {}

    let type = ''
    let emoji = ''

    if (command === 'prohijo') {
      type = 'hijo'
      emoji = '👶'
    }

    if (command === 'prohija') {
      type = 'hija'
      emoji = '👧'
    }

    if (command === 'promascota') {
      type = 'mascota'
      emoji = '🐶'
    }

    // guardar confirmación tipo marry
    if (familyConfirm[target] && familyConfirm[target].timeout) {
      clearTimeout(familyConfirm[target].timeout)
    }

    familyConfirm[target] = {
      from: sender,
      type,
      timeout: setTimeout(() => {
        delete familyConfirm[target]
        conn.sendMessage(m.chat, {
          text: `⏳ La propuesta de ${type} expiró.`,
        }, { quoted: m })
      }, 5 * 60 * 1000) // 5 minutos
    }

    return conn.sendMessage(m.chat, {
      text: `${emoji} *@${sender.split('@')[0]}* quiere que *@${target.split('@')[0]}* sea su ${type}.\n\nResponde con *Si* o *No*\n⏳ Tienes 5 minutos.`,
      mentions: [sender, target]
    }, { quoted: m })

  } catch (e) {
    console.error(e)
  }
}

// 🔥 RESPUESTAS (IGUAL QUE MARRY)
handler.before = async (m, { conn }) => {
  try {
    if (!m.text) return
    if (m.isBaileys) return

    const text = m.text.trim()
    const user = m.sender

    if (!(user in familyConfirm)) return

    const { from, type, timeout } = familyConfirm[user]

    // ❌ RECHAZAR
    if (/^No$/i.test(text)) {
      clearTimeout(timeout)
      delete familyConfirm[user]

      return conn.sendMessage(m.chat, {
        text: `❌ @${user.split('@')[0]} rechazó la propuesta.`,
        mentions: [user, from]
      }, { quoted: m })
    }

    // ✅ ACEPTAR
    if (/^Si$/i.test(text)) {
      clearTimeout(timeout)
      delete familyConfirm[user]

      if (!global.db.data.users[from]) global.db.data.users[from] = {}
      if (!global.db.data.users[user]) global.db.data.users[user] = {}

      let parent = global.db.data.users[from]
      let child = global.db.data.users[user]

      // inicializar arrays
      if (!parent.hijos) parent.hijos = []
      if (!parent.hijas) parent.hijas = []
      if (!parent.mascotas) parent.mascotas = []

      if (type === 'hijo') {
        parent.hijos.push(user)
        child.padre = from
      }

      if (type === 'hija') {
        parent.hijas.push(user)
        child.padre = from
      }

      if (type === 'mascota') {
        parent.mascotas.push(user)
        child.dueno = from
      }

      return conn.sendMessage(m.chat, {
        text: `✅ Ahora @${user.split('@')[0]} es ${type} de @${from.split('@')[0]}`,
        mentions: [user, from]
      }, { quoted: m })
    }

  } catch (e) {
    console.error(e)
  }
}

handler.command = ['prohijo', 'prohija', 'promascota']
handler.group = true

export default handler
