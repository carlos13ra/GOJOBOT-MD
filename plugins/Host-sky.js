let handler = async (m, { conn }) => {

let texto = `╭─〔 ☁️ SKY ULTRA PLUS 〕
│ 🚀 Hosting rápido y estable
│ 🤖 Ideal para bots de WhatsApp
╰──────────────`

await conn.sendMessage(m.chat, {
image: { url: "https://cdn.skyultraplus.com/uploads/u4/3ee6fc7f2a0d2478.jpg" },
caption: texto,
footer: "Sky Ultra Plus • Hosting Oficial",

templateButtons: [

{
index: 1,
urlButton: {
displayText: "🌐 Página Oficial",
url: "https://skyultraplus.com"
}
},

{
index: 2,
urlButton: {
displayText: "📊 Dashboard",
url: "https://dash.skyultraplus.com"
}
},

{
index: 3,
urlButton: {
displayText: "🖥 Panel",
url: "https://panel.skyultraplus.com"
}
},

{
index: 4,
urlButton: {
displayText: "📡 Estado Servicios",
url: "https://skyultraplus.com/status"
}
},

{
index: 5,
urlButton: {
displayText: "📢 Canal WhatsApp",
url: "https://whatsapp.com/channel/0029VakUvreFHWpyWUr4Jr0g"
}
},

{
index: 6,
urlButton: {
displayText: "💬 Comunidad",
url: "https://chat.whatsapp.com/E6iWpvGuJ8zJNPbN3zOr0D"
}
},

{
index: 7,
urlButton: {
displayText: "👤 Russell",
url: "https://api.whatsapp.com/send/?phone=15167096032"
}
},

{
index: 8,
urlButton: {
displayText: "👤 Gata Dios",
url: "https://wa.me/message/B3KTM5XN2JMRD1"
}
},

{
index: 9,
urlButton: {
displayText: "👤 elrebelde21",
url: "https://facebook.com/elrebelde21"
}
},

{
index: 10,
urlButton: {
displayText: "🎮 Discord",
url: "https://discord.gg/socialky"
}
}

]

}, { quoted: m })

}

handler.help = ['sky','skyultraplus']
handler.tags = ['hostings']
handler.command = ['sky','skyultraplus']

export default handler
