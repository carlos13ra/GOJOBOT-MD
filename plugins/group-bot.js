let handler = async (m, { conn, usedPrefix, command, args }) => {
  let chat = global.db.data.chats[m.chat] || {}

  // Asegurar que exista la propiedad
  if (typeof chat.isBanned !== 'boolean') chat.isBanned = false

  // Mostrar estado si no hay argumentos
  if (!args[0]) {
    const estado = chat.isBanned ? '✗ Desactivado' : '✓ Activado'
    return conn.reply(m.chat, `「✦」Control de bot

✐ Activar » *${usedPrefix}bot on*
✐ Desactivar » *${usedPrefix}bot off*

✧ Estado actual » *${estado}*`, m)
  }

  // 🔥 IMPORTANTE: permitir encender aunque esté apagado
  if (args[0] === 'on') {
    if (!chat.isBanned) {
      await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } })
      return conn.reply(m.chat, `《✦》${botname} ya está activo.`, m)
    }

    chat.isBanned = false

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
    return conn.reply(m.chat, `❀ ${botname} ha sido *activado* correctamente.`, m)
  }

  if (args[0] === 'off') {
    if (chat.isBanned) {
      await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } })
      return conn.reply(m.chat, `《✦》${botname} ya está desactivado.`, m)
    }

    chat.isBanned = true

    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    return conn.reply(m.chat, `❀ ${botname} ha sido *desactivado*.`, m)
  }

  // Comando inválido
  return conn.reply(m.chat, `✦ Usa: *${usedPrefix}bot on* o *${usedPrefix}bot off*`, m)
}

handler.help = ['bot on/off']
handler.tags = ['group']
handler.command = ['bot']
handler.admin = true

export default handler
