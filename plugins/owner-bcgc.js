const handler = async (m, { conn, isROwner, text }) => {
  if (!isROwner) return m.reply('❌ Solo el owner')

  const delay = ms => new Promise(res => setTimeout(res, ms))

  const groups = Object.values(await conn.groupFetchAllParticipating())
  const groupIds = groups.map(v => v.id)

  const pesan = m.quoted?.text || text
  if (!pesan) throw '⚠️ Falta el texto'

  // Detectar link
  const link = pesan.match(/https?:\/\/[^\s]+/)?.[0]
  if (!link) throw '⚠️ El mensaje debe contener un link'

  for (const id of groupIds) {
    await delay(800)

    await conn.sendMessage(
      id,
      {
        text: `⭐️ *MENSAJE IMPORTANTE*\n\n${pesan}\n\n━━━━━━━━━━━━━━`,
        contextInfo: {
          externalAdReply: {
            title: '🎵 NUEVO LANZAMIENTO',
            body: 'Escúchalo ahora',
            mediaType: 1,
            renderLargerThumbnail: true,
            sourceUrl: link
          }
        }
      },
      { quoted: null }
    ).catch(() => {})
  }

  m.reply(`✅ Enviado a *${groupIds.length}* grupos`)
}

handler.help = ['bcgc <texto con link>']
handler.tags = ['owner']
handler.command = ['bcgc']
handler.owner = true

export default handler
