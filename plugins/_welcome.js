import fs from 'fs'
import { WAMessageStubType } from '@whiskeysockets/baileys'

async function generarBienvenida({ conn, userId, groupMetadata, chat }) {
  const username = `@${userId.split('@')[0]}`
  const pp = await conn.profilePictureUrl(userId, 'image').catch(() => 'https://raw.githubusercontent.com/AkiraDevX/uploads/main/uploads/ceyw1.jpeg')
  const fecha = new Date().toLocaleDateString("es-ES", { timeZone: "America/Mexico_City", day: 'numeric', month: 'long', year: 'numeric' })
  const hora = new Date().toLocaleTimeString("es-ES", { timeZone: "America/Mexico_City", hour: '2-digit', minute: '2-digit' })
  const groupSize = groupMetadata.participants.length
  const desc = groupMetadata.desc?.toString() || 'Sin descripción'
  
  const mensajes = [
    `✨ Bienvenido a la familia ${username}! Esperamos que disfrutes tu tiempo aquí.`,
    `🎉 ${username} acaba de unirse! Prepárate para la diversión y las aventuras.`,
    `🌟 ¡Qué emoción! ${username} se ha sumado a nuestro grupo. ¡Bienvenido!`,
    `🚀 ${username} ha llegado! Ahora el grupo es aún más increíble.`,
    `💫 ¡Hola ${username}! Nos alegra mucho que te unas a nosotros.`,
    `🎊 ${username} está aquí! Que comience la fiesta.`,
    `👋 ¡Bienvenido ${username}! Eres parte de algo especial ahora.`,
    `🌈 ${username} se ha unido! Que comience la magia.`
  ]
  
  const mensajeAleatorio = mensajes[Math.floor(Math.random() * mensajes.length)]
  const customMsg = (chat.sWelcome || mensajeAleatorio).replace(/{usuario}/g, `${username}`).replace(/{grupo}/g, `*${groupMetadata.subject}*`).replace(/{desc}/g, `${desc}`)
  
  const caption = `> ׅ ࣫      🪷꯭ึ       (    ɢ꯭ᴏᴊ꯭̅ᴏ   ─  상처     ✦      ׁ️ *:* _*¡Welcome, to ${groupMetadata.subject} !*. 🍁_
 𓃉 *Usuario :* ${username}
 𓃉 *Miembros :* ${groupSize}
 𓃉 *Date :* ${fecha}, ${hora}

> ${customMsg}`.trim()
  
  return { pp, caption, mentions: [userId] }
}

async function generarDespedida({ conn, userId, groupMetadata, chat }) {
  const username = `@${userId.split('@')[0]}`
  const pp = await conn.profilePictureUrl(userId, 'image').catch(() => 'https://raw.githubusercontent.com/AkiraDevX/uploads/main/uploads/ceyw1.jpeg')
  const fecha = new Date().toLocaleDateString("es-ES", { timeZone: "America/Mexico_City", day: 'numeric', month: 'long', year: 'numeric' })
  const hora = new Date().toLocaleTimeString("es-ES", { timeZone: "America/Mexico_City", hour: '2-digit', minute: '2-digit' })
  const groupSize = groupMetadata.participants.length
  const desc = groupMetadata.desc?.toString() || 'Sin descripción'
  
  const despedidas = [
    `${username} se ha ido... Los extrañaremos.`,
    `Adiós ${username}! Que vuelvas pronto.`,
    `${username} ha abandonado el grupo. ¡Hasta pronto!`,
    `Se fue ${username}... El grupo no será lo mismo.`,
    `${username} se despide. ¡Vuelve cuando quieras!`,
    `Adiós amigo ${username}! Que te vaya bien.`,
    `${username} ha salido del grupo. ¡Nos vemos!`
  ]
  
  const despedidaAleatoria = despedidas[Math.floor(Math.random() * despedidas.length)]
  const customMsg = (chat.sBye || despedidaAleatoria).replace(/{usuario}/g, `${username}`).replace(/{grupo}/g, `${groupMetadata.subject}`).replace(/{desc}/g, `${desc}`)
  
  const caption = `> ׅ ࣫      🪷꯭ึ       (    ɢ꯭ᴏᴊ꯭̅ᴏ   ─  상처     ✦      ׁ️ *:* _*¡Goodbye, ${groupMetadata.subject} !*. 🍁_


 𓃉 *Usuario :* ${username}
 𓃉 *Miembros Restantes :* ${groupSize}
 𓃉 *Fecha :* ${fecha}, ${hora}

> ${customMsg}
  `.trim()
  
  return { pp, caption, mentions: [userId] }
}

let handler = m => m
handler.before = async function (m, { conn, participants, groupMetadata }) {
  if (!m.messageStubType || !m.isGroup) return !0
  
  const primaryBot = global.db.data.chats[m.chat].primaryBot
  if (primaryBot && conn.user.jid !== primaryBot) throw !1
  
  const chat = global.db.data.chats[m.chat]
  const userId = m.messageStubParameters[0]
  
  if (chat.welcome && m.messageStubType == WAMessageStubType.GROUP_PARTICIPANT_ADD) {
    const { pp, caption, mentions } = await generarBienvenida({ conn, userId, groupMetadata, chat })
    await conn.sendMessage(m.chat, { 
      image: { url: pp }, 
      caption,
      contextInfo: { mentionedJid: mentions }
    }, { quoted: null })
  }
  
  if (chat.welcome && (m.messageStubType == WAMessageStubType.GROUP_PARTICIPANT_REMOVE || m.messageStubType == WAMessageStubType.GROUP_PARTICIPANT_LEAVE)) {
    const { pp, caption, mentions } = await generarDespedida({ conn, userId, groupMetadata, chat })
    await conn.sendMessage(m.chat, { 
      image: { url: pp }, 
      caption,
      contextInfo: { mentionedJid: mentions }
    }, { quoted: null })
  }
}

export { generarBienvenida, generarDespedida }
export default handler