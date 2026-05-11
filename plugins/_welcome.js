import { WAMessageStubType, generateWAMessageContent, generateWAMessageFromContent, proto } from '@whiskeysockets/baileys'

// ─────────────────────────────
// 🛡️ VALIDAR USUARIO
// ─────────────────────────────
function safeUser(userId) {
    if (!userId) return null
    if (!userId.includes('@')) return null
    if (userId.endsWith('@lid')) return null
    return userId
}

// ─────────────────────────────
// 🌿 HANDLER
// ─────────────────────────────
let handler = m => m

handler.before = async function (m, { conn, groupMetadata }) {
    if (!m.isGroup || !m.messageStubType) return true

    const chat = global.db.data.chats[m.chat] || {}

    // 🔥 IMPORTANTE: activar por defecto
    if (typeof chat.welcome !== 'boolean') chat.welcome = true
    if (typeof chat.bye !== 'boolean') chat.bye = true

    // 🛑 RESPETA APAGADO DEL BOT
    if (chat.isBanned) return true

    const userId = safeUser(m.messageStubParameters?.[0])
    if (!userId) return true

    const username = `@${userId.split('@')[0]}`

    const pp = await conn.profilePictureUrl(userId, 'image')
        .catch(() => 'https://i.imgur.com/6Y5kF7G.png')

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

    const desc = groupMetadata?.desc?.toString() || 'Sin descripción'

    // ───── BIENVENIDA
    if (chat.welcome && m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD) {

        const mensaje = (chat.sWelcome || 'Bienvenido {usuario} a {grupo}')
            .replace(/{usuario}/g, username)
            .replace(/{grupo}/g, `*${groupMetadata.subject}*`)
            .replace(/{desc}/g, desc)

        const caption = `
🌿 ¡Bienvenido!
👤 ${username}
📜 ${mensaje}
👥 Miembros: ${groupMetadata.participants.length}
🕒 ${fecha} | ${hora}
`.trim()

        await enviarMensaje(conn, m.chat, pp, caption, [userId])
    }

    // ───── DESPEDIDA
    if (chat.bye && (
        m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE ||
        m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_LEAVE
    )) {

        const mensaje = (chat.sBye || 'Adiós {usuario}')
            .replace(/{usuario}/g, username)
            .replace(/{grupo}/g, `*${groupMetadata.subject}*`)
            .replace(/{desc}/g, desc)

        const caption = `
🍂 Se fue un miembro
👤 ${username}
📜 ${mensaje}
👥 Miembros: ${groupMetadata.participants.length}
🕒 ${fecha} | ${hora}
`.trim()

        await enviarMensaje(conn, m.chat, pp, caption, [userId])
    }

    return true
}

// ─────────────────────────────
// 📤 FUNCIÓN DE ENVÍO
// ─────────────────────────────
async function enviarMensaje(conn, chatId, pp, caption, mentions) {
    const { imageMessage } = await generateWAMessageContent(
        { image: { url: pp } },
        { upload: conn.waUploadToServer }
    )

    const msg = generateWAMessageFromContent(
        chatId,
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

    await conn.relayMessage(chatId, msg.message, {})
}

export default handler
