let handler = async (m, { conn }) => {

// TARJETA DEL CANAL (CON VER CANAL)
await conn.sendMessage(m.chat, {
text: " ",
contextInfo: {
forwardedNewsletterMessageInfo: {
newsletterJid: "120363301598733462@newsletter",
newsletterName: "SKY ULTRA PLUS OFICIAL",
serverMessageId: 1
},
externalAdReply: {
title: "SKY ULTRA PLUS OFICIAL",
body: "Canal oficial de Sky Ultra Plus",
thumbnailUrl: "https://cdn.skyultraplus.com/uploads/u4/3ee6fc7f2a0d2478.jpg",
sourceUrl: "https://whatsapp.com/channel/0029VakUvreFHWpyWUr4Jr0g",
mediaType: 1,
renderLargerThumbnail: true
}
}
}, { quoted: m })

let texto = `╭─〔 ☁️ SKY ULTRA PLUS HOST 〕
│
│ 🚀 *Sky Ultra Plus*
│ ⚡ Hosting rápido y estable
│ 🤖 Ideal para bots de WhatsApp
│
│ 🌐 *Links Oficiales*
│
│ • Página Oficial
│ https://skyultraplus.com
│
│ • Dashboard
│ https://dash.skyultraplus.com
│
│ • Panel
│ https://panel.skyultraplus.com
│
│ • Estado de Servicios
│ https://skyultraplus.com/status
│
│ • Comunidad
│ https://chat.whatsapp.com/E6iWpvGuJ8zJNPbN3zOr0D
│
│ • Discord
│ https://discord.gg/socialky
│
│ 👨‍💻 *Contactos*
│
│ • Russell
│ https://api.whatsapp.com/send/?phone=15167096032
│
│ • Gata Dios
│ https://wa.me/message/B3KTM5XN2JMRD1
│
│ • elrebelde21
│ https://facebook.com/elrebelde21
╰──────────────`

await conn.sendMessage(m.chat, {
image: { url: "https://cdn.skyultraplus.com/uploads/u4/3ee6fc7f2a0d2478.jpg" },
caption: texto,
footer: "Sky Ultra Plus • Hosting Oficial"
}, { quoted: m })

}

handler.help = ['sky','skyultraplus','hawks']
handler.tags = ['hostings']
handler.command = ['sky','skyultraplus','hawks']

export default handler
