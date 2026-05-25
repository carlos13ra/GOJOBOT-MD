import fetch from 'node-fetch'

let handler = async (m, { conn, usedPrefix, command }) => {
try {
await m.react('🕒')
const api = 'https://api--shadowcorexyz.replit.app/random/waifu/v2'
await conn.sendFile(m.chat, api, 'thumbnail.jpg', '🌱 Aquí tienes tu *Waifu* ฅ^•ﻌ•^ฅ.', fkontak)
await m.react('✔️')
} catch (error) {
await m.react('✖️')
await conn.reply(m.chat, `⚠︎ Se ha producido un problema.\n> Usa *${usedPrefix}report* para informarlo.\n\n${error.message}`, m)
}}

handler.help = ['waifu']
handler.tags = ['anime']
handler.command = ['waifu']
handler.group = true

export default handler
