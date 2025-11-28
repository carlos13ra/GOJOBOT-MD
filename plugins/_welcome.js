import fs from 'fs'
import { WAMessageStubType } from '@whiskeysockets/baileys'

async function generarBienvenida({ conn, userId, groupMetadata, chat }) {
    const username = `@${userId.split('@')[0]}`
    const pp = await conn.profilePictureUrl(userId, 'image').catch(() => 'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745522645448.jpeg')
    const fecha = new Date().toLocaleDateString("es-PE", { timeZone: "America/Lima", day: 'numeric', month: 'long', year: 'numeric' })
    const hora = new Date().toLocaleTimeString("es-PE", { timeZone: "America/Lima", hour: '2-digit', minute: '2-digit' })
    const groupSize = groupMetadata.participants.length + 1
    const desc = groupMetadata.desc?.toString() || 'Sin descripción'

    const mensaje = (chat.sWelcome || 'Edita con el comando "setwelcome"')
        .replace(/{usuario}/g, `${username}`)
        .replace(/{grupo}/g, `*${groupMetadata.subject}*`)
        .replace(/{desc}/g, `${desc}`)

    const caption = `
🌿 ¡Bienvenido al oasis *${groupMetadata.subject}*! 🌸
👤 Usuario: ${username}
🍃 Mensaje: ${mensaje}
🌞 Miembros actuales: ${groupSize}
🕒 Fecha y hora: ${fecha} | ${hora}

> 🐦 Que tu estadía sea tranquila y llena de buenas vibras uwu 🌊 `.trim()

    return { pp, caption, mentions: [userId] }
}

async function generarDespedida({ conn, userId, groupMetadata, chat }) {
    const username = `@${userId.split('@')[0]}`
    const pp = await conn.profilePictureUrl(userId, 'image').catch(() => 'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745522645448.jpeg')
    const fecha = new Date().toLocaleDateString("es-PE", { timeZone: "America/Lima", day: 'numeric', month: 'long', year: 'numeric' })
    const hora = new Date().toLocaleTimeString("es-PE", { timeZone: "America/Lima", hour: '2-digit', minute: '2-digit' })
    const groupSize = groupMetadata.participants.length - 1
    const desc = groupMetadata.desc?.toString() || 'Sin descripción'

    const mensaje = (chat.sBye || 'Edita con el comando "setbye"')
        .replace(/{usuario}/g, `${username}`)
        .replace(/{grupo}/g, `*${groupMetadata.subject}*`)
        .replace(/{desc}/g, `${desc}`)

    const caption = `
🍂 ${username} ha dejado el jardín de *${groupMetadata.subject}* 🌾
📜 Mensaje: ${mensaje}
🌿 Miembros restantes: ${groupSize}
🕒 Fecha y hora: ${fecha} | ${hora}

> 🌸 Te esperamos de nuevo para compartir buenas energías 🌊
`.trim()

    return { pp, caption, mentions: [userId] }
}

let handler = m => m

handler.before = async function (m, { conn, participants, groupMetadata }) {
    if (!m.messageStubType || !m.isGroup) return true
    const primaryBot = global.db.data.chats[m.chat].primaryBot
    if (primaryBot && conn.user.jid !== primaryBot) return false

    const chat = global.db.data.chats[m.chat]
    const userId = m.messageStubParameters?.[0]
    if (!userId) return true

    const rcanal = { contextInfo: {} }

    if (chat.welcome && m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD) {
        const { pp, caption, mentions } = await generarBienvenida({ conn, userId, groupMetadata, chat })
        rcanal.contextInfo.mentionedJid = mentions
        await conn.sendMessage(m.chat, { image: { url: pp }, caption, ...rcanal })
    }

    if (chat.welcome && (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE || m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_LEAVE)) {
        const { pp, caption, mentions } = await generarDespedida({ conn, userId, groupMetadata, chat })
        rcanal.contextInfo.mentionedJid = mentions
        await conn.sendMessage(m.chat, { image: { url: pp }, caption, ...rcanal })
    }

    return true
}

export { generarBienvenida, generarDespedida }
export default handler