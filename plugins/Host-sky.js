let handler = async (m, { conn }) => {

let texto = `╭─〔 ☁️ SKY ULTRA PLUS HOST 〕
│
│ 🚀 *Sky Ultra Plus*
│ ⚡ Hosting rápido y estable
│ 🤖 Ideal para bots de WhatsApp
│
│ 👨‍💻 *Contactos*
│ • Russell
│ https://api.whatsapp.com/send/?phone=15167096032
│
│ • Gata Dios
│ https://wa.me/message/B3KTM5XN2JMRD1
│
│ • elrebelde21
│ https://facebook.com/elrebelde21
│
│ Presiona los botones para
│ acceder a los enlaces 👇
╰──────────────`

let buttons = [
{
buttonId: "https://skyultraplus.com",
buttonText: { displayText: "🌐 Página Oficial" },
type: 1
},
{
buttonId: "https://dash.skyultraplus.com",
buttonText: { displayText: "📊 Dashboard" },
type: 1
},
{
buttonId: "https://skyultraplus.com/status",
buttonText: { displayText: "📡 Estado Servicios" },
type: 1
}
]

await conn.sendMessage(m.chat, {
image: { url: "https://cdn.skyultraplus.com/uploads/u4/3ee6fc7f2a0d2478.jpg" },
caption: texto,
footer: "Sky Ultra Plus • Hosting Oficial",
buttons: buttons,
headerType: 4
}, { quoted: m })

// CANAL CON PREVIEW
await conn.sendMessage(m.chat, {
text: "📢 *Canal Oficial Sky Ultra Plus*\nhttps://whatsapp.com/channel/0029VakUvreFHWpyWUr4Jr0g"
}, { quoted: m })

}

handler.help = ['sky','skyultraplus']
handler.tags = ['hostings']
handler.command = ['sky','skyultraplus']

export default handler
