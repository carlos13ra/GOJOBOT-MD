let handler = async (m, { conn }) => {

let texto = `╭─〔 ☁️ SKY ULTRA PLUS HOST 〕
│
│ 🚀 *Sky Ultra Plus*
│ ⚡ Hosting rápido y estable
│ 🤖 Ideal para bots de WhatsApp
│
│ 🌐 *Servicios*
│ • Página oficial
│ • Dashboard
│ • Panel
│ • Estado del servidor
│ • Canal oficial
│ • Comunidad
│ • Discord
│
│ 👨‍💻 *Contactos*
│ • Russell
│ • Gata Dios
│ • elrebelde21
│
│ Presiona los botones para
│ acceder a los enlaces oficiales 👇
╰──────────────`

let buttons = [
{
buttonId: ".pagina_sky",
buttonText: { displayText: "🌐 Página Oficial" },
type: 1
},
{
buttonId: ".dashboard_sky",
buttonText: { displayText: "📊 Dashboard" },
type: 1
},
{
buttonId: ".canal_sky",
buttonText: { displayText: "📢 Canal WhatsApp" },
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

}

handler.help = ['sky','skyultraplus']
handler.tags = ['hostings']
handler.command = ['sky','skyultraplus']

export default handler
