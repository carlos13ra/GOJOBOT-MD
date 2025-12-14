const handler = async (m, { conn, isROwner, text }) => {
  if (!isROwner) return m.reply('❌ Comando exclusivo del OWNER')
  if (!text) return m.reply('✏️ Escribe el mensaje para enviar a los grupos')

  // Obtener todos los grupos donde está el bot
  const groups = await conn.groupFetchAllParticipating()
  const groupIds = Object.entries(groups).map(v => v[1].id)

  let success = 0
  let failed = 0

  await m.reply(`📢 Broadcast iniciado\n👥 Grupos: ${groupIds.length}`)

  for (const id of groupIds) {
    try {
      await conn.sendMessage(id, { text })
      success++
      await new Promise(res => setTimeout(res, 1500)) // delay anti-ban
    } catch (e) {
      failed++
      console.log('[BCGC ERROR]', id, e)
    }
  }

  m.reply(
    `✅ Broadcast finalizado\n\n` +
    `✔️ Enviados: ${success}\n` +
    `❌ Fallidos: ${failed}`
  )
}

handler.help = ['bcgc <mensaje>']
handler.tags = ['owner']
handler.command = ['bcgc']
handler.owner = true

export default handler
