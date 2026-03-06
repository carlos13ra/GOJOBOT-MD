let handler = async (m, { conn }) => {

let texto = `╭─〔 ☁️ SKY ULTRA PLUS HOST 〕
│
│ 🚀 *Sky Ultra Plus*
│ ⚡ Hosting rápido y estable
│ 🤖 Ideal para bots de WhatsApp
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
│
│ Presiona los botones para abrir
│ los enlaces oficiales 👇
╰──────────────`

await conn.sendMessage(m.chat, {
image: { url: "https://cdn.skyultraplus.com/uploads/u4/3ee6fc7f2a0d2478.jpg" },
caption: texto,
footer: "Sky Ultra Plus • Hosting Oficial",
buttons: [
{
buttonText: { displayText: "🌐 Página Oficial" },
type: 1,
url: "https://skyultraplus.com"
},
{
buttonText: { displayText: "📊 Dashboard" },
type: 1,
url: "https://dash.skyultraplus.com"
},
{
buttonText: { displayText: "📡 Estado Servicios" },
type: 1,
url: "https://skyultraplus.com/status"
}
],
headerType: 4
}, { quoted: m })

// TARJETA DEL CANAL (VER CANAL)
await conn.sendMessage(m.chat, {
text: " ",
contextInfo: {
forwardedNewsletterMessageInfo: {
newsletterJid: "120363301598733462@newsletter",
newsletterName: "SKY ULTRA PLUS OFICIAL",
serverMessageId: 1
}
}
}, { quoted: m })

}

handler.help = ['sky','skyultraplus','hawks']
handler.tags = ['hostings']
handler.command = ['sky','skyultraplus','hawks']

export default handler
