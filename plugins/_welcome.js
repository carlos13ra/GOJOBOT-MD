import { WAMessageStubType, generateWAMessageContent, generateWAMessageFromContent, proto } from '@whiskeysockets/baileys'

// ───────────────
// 🛡️ FILTRO USER
// ───────────────
function safeUser(userId) {
if (!userId) return null
if (userId.endsWith('@lid')) return null
if (!userId.includes('@')) return null
return userId
}

// ───────────────
// 🌿 BIENVENIDA
// ───────────────
async function generarBienvenida({ conn, userId, groupMetadata, chat }) {
userId = safeUser(userId)
if (!userId) return null

const username = `@${userId.split('@')[0]}`

const pp = await conn.profilePictureUrl(userId, 'image')
.catch(() => 'https://i.imgur.com/6RLd9ZB.jpeg')

const fecha = new Date().toLocaleDateString("es-PE", {
timeZone: "America/Lima",
day: 'numeric',
month: 'long',
year: 'numeric'
})

const hora = new Date().toLocaleTimeString("es-PE", {
timeZone: "America/Lima",
hour: '2-digit',
minute: '2-digit'
})

const groupSize = groupMetadata?.participants?.length || 0
const desc = groupMetadata?.desc?.toString() || 'Sin descripción'

const mensaje = (chat?.sWelcome || 'Bienvenido {usuario} a {grupo}')
.replace(/{usuario}/g, username)
.replace(/{grupo}/g, `*${groupMetadata.subject}*`)
.replace(/{desc}/g, desc)

const caption = `
🌿 ¡Bienvenido a *${groupMetadata.subject}*!
👤 Usuario: ${username}
📜 Mensaje: ${mensaje}
👥 Miembros: ${groupSize}
🕒 ${fecha} | ${hora}
`.trim()

return { pp, caption, mentions: [userId] }
}

// ───────────────
// 🍂 DESPEDIDA
// ───────────────
async function generarDespedida({ conn, userId, groupMetadata, chat }) {
userId = safeUser(userId)
if (!userId) return null

const username = `@${userId.split('@')[0]}`

const pp = await conn.profilePictureUrl(userId, 'image')
.catch(() => 'https://i.imgur.com/6RLd9ZB.jpeg')

const fecha = new Date().toLocaleDateString("es-PE", {
timeZone: "America/Lima",
day: 'numeric',
month: 'long',
year: 'numeric'
})

const hora = new Date().toLocaleTimeString("es-PE", {
timeZone: "America/Lima",
hour: '2-digit',
minute: '2-digit'
})

const groupSize = groupMetadata?.participants?.length || 0
const desc = groupMetadata?.desc?.toString() || 'Sin descripción'

const mensaje = (chat?.sBye || 'Adiós {usuario}')
.replace(/{usuario}/g, username)
.replace(/{grupo}/g, `*${groupMetadata.subject}*`)
.replace(/{desc}/g, desc)

const caption = `
🍂 ${username} salió de *${groupMetadata.subject}*
📜 Mensaje: ${mensaje}
👥 Miembros restantes: ${groupSize}
🕒 ${fecha} | ${hora}
`.trim()

return { pp, caption, mentions: [userId] }
}

// ───────────────
// 🔥 HANDLER
// ───────────────
let handler = m => m

handler.before = async function (m, { conn, groupMetadata, chat }) {
if (!m.isGroup) return true
if (!m.messageStubType) return true

const userId = m.messageStubParameters?.[0]
if (!safeUser(userId)) return true

// 🔥 RESPETA BOT OFF
if (chat?.isBanned) return true

// 🔥 RESPETA PRIMARY BOT
if (chat?.primaryBot && conn.user.jid !== chat.primaryBot) return true

// ───── BIENVENIDA
if (chat.welcome && m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD) {
const data = await generarBienvenida({ conn, userId, groupMetadata, chat })
if (!data) return true

const { pp, caption, mentions } = data

const { imageMessage } = await generateWAMessageContent(
{ image: { url: pp } },
{ upload: conn.waUploadToServer }
)

const msg = generateWAMessageFromContent(
m.chat,
{
viewOnceMessage: {
message: {
interactiveMessage: proto.Message.InteractiveMessage.fromObject({
body: { text: caption },
header: { hasMediaAttachment: true, imageMessage },
contextInfo: { mentionedJid: mentions }
})
}
}
},
{}
)

await conn.relayMessage(m.chat, msg.message, {})
}

// ───── DESPEDIDA
if (chat.welcome && (
m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE ||
m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_LEAVE
)) {
const data = await generarDespedida({ conn, userId, groupMetadata, chat })
if (!data) return true

const { pp, caption, mentions } = data

const { imageMessage } = await generateWAMessageContent(
{ image: { url: pp } },
{ upload: conn.waUploadToServer }
)

const msg = generateWAMessageFromContent(
m.chat,
{
viewOnceMessage: {
message: {
interactiveMessage: proto.Message.InteractiveMessage.fromObject({
body: { text: caption },
header: { hasMediaAttachment: true, imageMessage },
contextInfo: { mentionedJid: mentions }
})
}
}
},
{}
)

await conn.relayMessage(m.chat, msg.message, {})
}

return true
}

export default handler
