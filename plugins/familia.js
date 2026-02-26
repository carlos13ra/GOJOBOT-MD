let handler = async (m, { conn, args }) => {
let user = global.db.data.users[m.sender]

if (!user.pendingFamily) user.pendingFamily = null

// 🔥 PROPONER
if (m.command === 'proponerhijo' || m.command === 'proponerhija' || m.command === 'proponermascota') {

let target = m.mentionedJid?.[0]
if (!target) return m.reply('⚠️ Etiqueta a alguien')

if (target === m.sender) return m.reply('⚠️ No puedes hacer esto contigo mismo')

let tipo = m.command.replace('proponer', '')

global.db.data.users[target].pendingFamily = {
from: m.sender,
type: tipo
}

await conn.sendMessage(m.chat, {
text: `👪 @${m.sender.split('@')[0]} te propone ser su *${tipo}*\n\nResponde con:\n✅ aceptar\n❌ rechazar`,
mentions: [m.sender, target]
}, { quoted: m })

}

// 🔥 RESPUESTAS
if (/^(aceptar|rechazar)$/i.test(m.text)) {

let pending = user.pendingFamily
if (!pending) return

let from = pending.from
let type = pending.type

let senderUser = global.db.data.users[from]

// inicializar
if (!senderUser.hijos) senderUser.hijos = []
if (!senderUser.hijas) senderUser.hijas = []
if (!senderUser.mascotas) senderUser.mascotas = []

if (/aceptar/i.test(m.text)) {

if (type === 'hijo') senderUser.hijos.push(m.sender)
if (type === 'hija') senderUser.hijas.push(m.sender)
if (type === 'mascota') senderUser.mascotas.push(m.sender)

user.pendingFamily = null

await conn.sendMessage(m.chat, {
text: `✅ Ahora @${m.sender.split('@')[0]} es ${type} de @${from.split('@')[0]}`,
mentions: [m.sender, from]
}, { quoted: m })

} else {

user.pendingFamily = null

await m.reply('❌ Propuesta rechazada')
}

}

}

handler.help = [
'proponerhijo @user',
'proponerhija @user',
'proponermascota @user'
]

handler.tags = ['rg']
handler.command = ['proponerhijo', 'proponerhija', 'proponermascota']
handler.group = true

export default handler
