const handler = async (m, { conn, usedPrefix, command }) => {
  try {
    if (!db.data.chats[m.chat].economy && m.isGroup) {
      return m.reply(`《✦》Los comandos de *Economía* están desactivados en este grupo.\n\nUn *administrador* puede activarlos con el comando:\n» *${usedPrefix}economy on*`)
    }
    const user = global.db.data.users[m.sender]
    user.lastrob = user.lastrob || 0
    if (Date.now() < user.lastrob) {
      const restante = user.lastrob - Date.now()
      return conn.reply(m.chat, `ꕥ Debes esperar *${formatTime(restante)}* para usar *${usedPrefix + command}* de nuevo.`, m)
    }
    let mentionedJid = await m.mentionedJid
    let who = mentionedJid && mentionedJid.length ? mentionedJid[0] : m.quoted && await m.quoted.sender ? await m.quoted.sender : null
    if (!who) return conn.reply(m.chat, `❀ Debes mencionar a alguien para intentar robarle.`, m)
    if (!(who in global.db.data.users)) {
      return conn.reply(m.chat, `ꕥ El usuario no se encuentra en mi base de datos.`, m)
    }
    let name = await (async () => global.db.data.users[who].name || (async () => {
      try {
        const n = await conn.getName(who);
        return typeof n === 'string' && n.trim() ? n : who.split('@')[0]
      } catch {
        return who.split('@')[0]
      }
    })())()
    const target = global.db.data.users[who]
    const tiempoInactivo = Date.now() - (target.lastwork || 0)
    if (tiempoInactivo < 900000) { // 15 minutos
      return conn.reply(m.chat, `ꕥ Solo puedes robarle *${currency}* a un usuario si estuvo más de 15 minutos inactivo.`, m, rcanal)
    }
    const minRob = 40000
    const maxRob = 100000
    const rob = Math.floor(Math.random() * (maxRob - minRob + 1)) + minRob
    if (target.coin < rob) {
      return conn.reply(m.chat, `ꕥ *${name}* no tiene suficientes *${currency}* fuera del banco como para que valga la pena intentar robar.`, m, { mentions: [who] })
    }
    user.coin += rob
    target.coin -= rob
    user.lastrob = Date.now() + 900000 // 15 minutos
    conn.reply(m.chat, `❀ Le robaste *¥${rob.toLocaleString()} ${currency}* a *${name}*`, m, { mentions: [who] })
  } catch (error) {
    console.error(error)
    conn.reply(m.chat, 'Ocurrió un error al procesar el comando', m)
  }
}
