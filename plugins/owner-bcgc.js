const handler = async (m, { conn, isROwner, text }) => {
  if (!isROwner) return

  const delay = ms => new Promise(res => setTimeout(res, ms))

  const groups = await conn.groupFetchAllParticipating()
  const groupIds = Object.keys(groups)

  const pesan = m.quoted?.text || text
  if (!pesan) return m.reply('❌ Escribe el mensaje')

  for (const id of groupIds) {
    await delay(1000)

    await conn.sendMessage(
      id,
      { text: `📢 *MENSAJE*\n\n${pesan}` },
      {}
    )
  }

  m.reply(`✅ Enviado a ${groupIds.length} grupos`)
}

handler.command = ['bcgc']
handler.owner = true

export default handler
