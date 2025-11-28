import fs from 'fs'
import { WAMessageStubType, generateWAMessageContent, generateWAMessageFromContent, proto } from '@whiskeysockets/baileys'

const welcomeImg = null

async function generarBienvenida({ conn, userId, groupMetadata, chat }) {
    const username = `@${userId.split('@')[0]}`
    const pp = await conn.profilePictureUrl(userId, 'image')
        .catch(() => 'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745522645448.jpeg')

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

    const groupSize = groupMetadata.participants.length + 1
    const desc = groupMetadata.desc?.toString() || 'Sin descripción'

    const mensaje = (chat.sWelcome || 'Edita con el comando "setwelcome"')
        .replace(/{usuario}/g, username)
        .replace(/{grupo}/g, `*${groupMetadata.subject}*`)
        .replace(/{desc}/g, desc)

    const caption = `
🌿 ¡Bienvenido al oasis *${groupMetadata.subject}*! 🌸
👤 Usuario: ${username}
🍃 Mensaje: ${mensaje}
🌞 Miembros actuales: ${groupSize}
🕒 Fecha y hora: ${fecha} | ${hora}

> 🐦 Que tu estadía sea tranquila y llena de buenas vibras uwu 🌊
`.trim()

    return { pp, caption, mentions: [userId] }
}

async function generarDespedida({ conn, userId, groupMetadata, chat }) {
    const username = `@${userId.split('@')[0]}`
    const pp = await conn.profilePictureUrl(userId, 'image')
        .catch(() => 'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745522645448.jpeg')

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

    const groupSize = groupMetadata.participants.length - 1
    const desc = groupMetadata.desc?.toString() || 'Sin descripción'

    const mensaje = (chat.sBye || 'Edita con el comando "setbye"')
        .replace(/{usuario}/g, username)
        .replace(/{grupo}/g, `*${groupMetadata.subject}*`)
        .replace(/{desc}/g, desc)

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
    
    const chat = global.db.data.chats[m.chat]
    const primaryBot = chat.primaryBot

    if (primaryBot && conn.user.jid !== primaryBot) return false

    const userId = m.messageStubParameters?.[0]
    if (!userId) return true

    const rcanal = { contextInfo: {} }

    if (chat.welcome && m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD) {
        
        const { pp, caption, mentions } = await generarBienvenida({ conn, userId, groupMetadata, chat })
        rcanal.contextInfo.mentionedJid = mentions

        const { imageMessage } = await generateWAMessageContent(
            welcomeImg ? { image: welcomeImg } : { image: { url: pp } },
            { upload: conn.waUploadToServer }
        )

        const msg = generateWAMessageFromContent(
            m.chat,
            {
                viewOnceMessage: {
                    message: {
                        interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                            body: { text: caption },
                            footer: { text: dev },
                            header: { title: "", hasMediaAttachment: true, imageMessage },
                            contextInfo: { mentionedJid: mentions },
                            nativeFlowMessage: {
                                buttons: [
                                    {
                                        name: "cta_url",
                                        buttonParamsJson: JSON.stringify({
                                            display_text: "click",
                                            url: channel,
                                            merchant_url: channel
                                        })
                                    }
                                ]
                            }
                        })
                    }
                }
            },
            { quoted: fkontak }
        )

        await conn.relayMessage(m.chat, msg.message, {})
    }

   
    if (chat.welcome && 
        (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE ||
         m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_LEAVE)) {

        const { pp, caption, mentions } = await generarDespedida({ conn, userId, groupMetadata, chat })
        rcanal.contextInfo.mentionedJid = mentions

        const { imageMessage } = await generateWAMessageContent(
            welcomeImg ? { image: welcomeImg } : { image: { url: pp } },
            { upload: conn.waUploadToServer }
        )

        const msg = generateWAMessageFromContent(
            m.chat,
            {
                viewOnceMessage: {
                    message: {
                        interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                            body: { text: caption },
                            footer: { text: dev },
                            header: { title: "", hasMediaAttachment: true, imageMessage },
                            contextInfo: { mentionedJid: mentions },
                            nativeFlowMessage: {
                                buttons: [
                                    {
                                        name: "cta_url",
                                        buttonParamsJson: JSON.stringify({
                                            display_text: "click",
                                            url: channel,
                                            merchant_url: channel
                                        })
                                    }
                                ]
                            }
                        })
                    }
                }
            },
            { quoted: fkontak }
        )

        await conn.relayMessage(m.chat, msg.message, {})
    }

    return true
}

export { generarBienvenida, generarDespedida }
export default handler