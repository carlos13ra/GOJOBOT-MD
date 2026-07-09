let handler = async (m, { conn, usedPrefix, command, args, isAdmin, isOwner }) => {
  let chat = global.db.data.chats[m.chat] || {}

  if (typeof chat.isBanned !== 'boolean') chat.isBanned = false

  // 🔐 Validación manual (más segura)
  if (!isAdmin && !isOwner) {
    return conn.reply(m.chat, '❌ Solo los administradores pueden usar este comando.', m)
  }

  if (!args[0]) {
    const estado = chat.isBanned ? '✗ Desactivado' : '✓ Activado'
    return conn.reply(m.chat, `「✦」Control de bot

✐ Activar » *${usedPrefix}bot on*
✐ Desactivar » *${usedPrefix}bot off*

✧ Estado actual » *${estado}*`, m)
  }

  if (args[0] === 'on') {
    if (!chat.isBanned) {
      return conn.reply(m.chat, `《✦》${botname} ya está activo.`, m)
    }

    chat.isBanned = false
    return conn.reply(m.chat, `✅ ${botname} fue *activado* por un admin.`, m)
  }

  if (args[0] === 'off') {
    if (chat.isBanned) {
      return conn.reply(m.chat, `《✦》${botname} ya está desactivado.`, m)
    }

    chat.isBanned = true
    return conn.reply(m.chat, `❌ ${botname} fue *desactivado* por un admin.`, m)
  }

  return conn.reply(m.chat, `✦ Usa: *${usedPrefix}bot on* o *${usedPrefix}bot off*`, m)
}

handler.help = ['bot on/off']
handler.tags = ['group']
handler.command = ['bot']

export default handler
