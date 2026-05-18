import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix }) => {
if (!text) {
return conn.reply(m.chat, `❀ Te faltó el link de una imagen/video de twitter.`, m)
}

try {
await m.react('🕒')
const api = `${global.APIs.light.url}/download/twitter?url=${encodeURIComponent(text)}&type=info`
const res = await fetch(api)
const result = await res.json()

if (!result.status || !result.result) {
return conn.reply(m.chat, `ꕥ No se pudo obtener el contenido de Twitter`, m)
}
const data = result.result

const duration = data.videos?.[0]?.duracionMs
? `${(data.videos[0].duracionMs / 1000).toFixed(0)}s`
: '-'
let caption = `❀ Twitter - Download ❀

> ✦ ID » ${data.id}
> 🜸 Likes » ${data.likes}
> ⴵ Retweets » ${data.retweets}
> ✇ Replies » ${data.replies}
> 👁️ Vistas » ${data.vistas}
> ⏱️ Duración » ${duration}
> 📅 Fecha » ${data.fecha}
> 🜸 URL » ${text}

📝 Texto:
${data.texto || 'Sin texto'}`

if (data.tieneVideo && data.videos?.length) {

await conn.sendMessage(m.chat, {
image: { url: data.videos[0].thumbnail },
caption
}, { quoted: m })

await conn.sendFile(
m.chat,
data.videos[0].url,
'video.mp4',
`🍜 ${data.id}.mp4`,
m
)

await m.react('✔️')
} else {
await conn.reply(
m.chat,
`⚠︎ No se encontró video en el tweet.`,
m
)

await m.react('✖️')
}

} catch (e) {
await m.react('✖️')
return conn.reply(
m.chat,
`⚠︎ Se ha producido un problema.
> Usa *${usedPrefix}report* para informarlo.

${e.message || e}`,
m
)
}}

handler.command = ['x', 'twitter', 'xdl']
handler.help = ['twitter']
handler.tags = ['download']
handler.group = true

export default handler