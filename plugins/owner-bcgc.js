const delay = ms => new Promise(res => setTimeout(res, ms))

const handler = async (m, { conn, isROwner, text }) => {
  if (!isROwner) return
  if (!text) return m.reply('✏️ Escribe el mensaje del broadcast')

  let groups
  try {
    groups = await conn.groupFetchAllParticipating()
  } catch (e) {
    return m.reply('❌ Error al obtener los grupos')
  }

  const groupIds = Object.keys(groups)
  let enviados = 0

  await m.reply(`📢 Enviando mensaje a ${groupIds.length} grupos...`)

  for (const id of groupIds) {
    try {
      await conn.sendMessage(id, { text: text })
      enviados++
      await delay(2000) // MÁS seguro en GOJO
    } catch (e) {
      console.log('[BCGC ERROR]', id)
    }
  }

  m.reply(`✅ Broadcast terminado\n📨 Enviados: ${enviados}`)
}

handler.help = ['bcgc <mensaje>']
handler.tags = ['owner']
handler.command = ['bcgc']
handler.owner = true

export default handler
