const font2 = {
  a: '🅐', b: '🅑', c: '🅒', d: '🅓', e: '🅔', f: '🅕', g: '🅖',
  h: '🅗', i: '🅘', j: '🅙', k: '🅚', l: '🅛', m: '🅜', n: '🅝',
  o: '🅞', p: '🅟', q: '🅠', r: '🅡', s: '🅢', t: '🅣', u: '🅤',
  v: '🅥', w: '🅦', x: '🅧', y: '🅨', z: '🅩'
}

const handler = async (m, { conn, text }) => {
  if (!text.includes('|')) {
    return m.reply(`❌ Formato incorrecto.\nUsa:\n.reactch https://whatsapp.com/channel/abc/123|Hola Mundo`)
  }

  let [link, ...messageParts] = text.split('|')
  link = link.trim()
  const msg = messageParts.join('|').trim().toLowerCase()

  if (!link.startsWith("https://whatsapp.com/channel/")) {
    return m.reply("❌ El enlace no es válido.\nDebe comenzar con: https://whatsapp.com/channel/")
  }

  const emoji = msg.split('').map(c => c === ' ' ? '―' : (font2[c] || c)).join('')

  try {
    const [, , , , channelId, messageId] = link.split('/')
    const res = await conn.newsletterMetadata("invite", channelId)
    await conn.newsletterReactMessage(res.id, messageId, emoji)
    m.reply(`✅ Reacción enviada como: *${emoji}*\nCanal: *${res.name}*`)
  } catch (e) {
    console.error(e)
    m.reply("❌ Error\nNo se pudo reaccionar. Revisa el enlace o tu conexión.")
  }
}

handler.command = ['reactch', 'rch']
handler.tags = ['tools']
handler.help = ['reactch <link>|<texto>']
handler.owner = true

export default handler
