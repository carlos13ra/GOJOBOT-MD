const handler = async (m, { conn, usedPrefix, command, args, isOwner, isAdmin }) => {
const primaryBot = global.db.data.chats[m.chat].primaryBot
if (primaryBot && conn.user.jid !== primaryBot) throw !1
const chat = global.db.data.chats[m.chat]
let type = command.toLowerCase()
let isEnable = chat[type] !== undefined ? chat[type] : false
if (args[0] === 'on' || args[0] === 'enable') {
if (isEnable) return conn.reply(m.chat, `🥭 *${type}* ya estaba *activado*.`, m, rcanal)
isEnable = true
} else if (args[0] === 'off' || args[0] === 'disable') {
if (!isEnable) return conn.reply(m.chat, `🥭 *${type}* ya estaba *desactivado*.`, m, rcanal)
isEnable = false
} else {
return conn.reply(m.chat, `╭━━━〔 ⚙️ ᴘᴀɴᴇʟ ᴅᴇ ᴄᴏɴᴛʀᴏʟ 〕━━⬣  
┃ ❣ *Un administrador puede gestionar el comando:*  
┃ ╰➤ *${command}*  
┃  
┃ ღ Opciones disponibles: 💫
┃ 𖥔 _Activar_ » *${usedPrefix}${command} enable*  
┃ 𖥔 _Desactivar_ » *${usedPrefix}${command} disable*  
┃  
┃ ☙ Estado actual:  
┃ ╰➤ *${isEnable ? '✓ Activado' : '✗ Desactivado'}*  
╰━━━━━━━━━━━━━━━━━━━━━━⬣`, m, rcanal)
}
switch (type) {
case 'welcome': case 'bienvenida': {
if (!m.isGroup) {
if (!isOwner) {
global.dfail('group', m, conn)
throw false
}} else if (!isAdmin) {
global.dfail('admin', m, conn)
throw false
}
chat.welcome = isEnable
break
}
case 'modoadmin': case 'onlyadmin': {
if (!m.isGroup) {
if (!isOwner) {
global.dfail('group', m, conn)
throw false
}} else if (!isAdmin) {
global.dfail('admin', m, conn)
throw false
}
chat.modoadmin = isEnable
break
}
case 'detect': case 'alertas': {
if (!m.isGroup) {
if (!isOwner) {
global.dfail('group', m, conn)
throw false
}} else if (!isAdmin) {
global.dfail('admin', m, conn)
throw false
}
chat.detect = isEnable
break
}
case 'antilink': case 'antienlace': {
if (!m.isGroup) {
if (!isOwner) {
global.dfail('group', m, conn)
throw false
}} else if (!isAdmin) {
global.dfail('admin', m, conn)
throw false
}
chat.antiLink = isEnable
break
}
case 'nsfw': case 'modohorny': {
if (!m.isGroup) {
if (!isOwner) {
global.dfail('group', m, conn)
throw false
}} else if (!isAdmin) {
global.dfail('admin', m, conn)
throw false
}
chat.nsfw = isEnable
break
}
case 'economy': case 'economia': {
if (!m.isGroup) {
if (!isOwner) {
global.dfail('group', m, conn)
throw false
}} else if (!isAdmin) {
global.dfail('admin', m, conn)
throw false
}
chat.economy = isEnable
break
}
case 'rpg': case 'gacha': {
if (!m.isGroup) {
if (!isOwner) {
global.dfail('group', m, conn)
throw false
}} else if (!isAdmin) {
global.dfail('admin', m, conn)
throw false
}
chat.gacha = isEnable
break
}}
chat[type] = isEnable
conn.reply(m.chat, `🕸️ Has *${isEnable ? 'activado' : 'desactivado'}* el *${type}* para este grupo.`, m, rcanal)
}

handler.help = ['welcome', 'bienvenida', 'modoadmin', 'onlyadmin', 'nsfw', 'modohorny', 'economy', 'economia', 'rpg', 'gacha', 'detect', 'alertas', 'antilink', 'antienlace', 'antilinks', 'antienlaces']
handler.tags = ['nable']
handler.command = ['welcome', 'bienvenida', 'modoadmin', 'onlyadmin', 'nsfw', 'modohorny', 'economy', 'economia', 'rpg', 'gacha', 'detect', 'alertas', 'antilink', 'antienlace']
handler.group = true

export default handler
