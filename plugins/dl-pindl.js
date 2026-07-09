import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
if (!text) return m.reply(`★ Ingresa un enlace de Pinterest\n\n> Ejemplo:\n${usedPrefix + command} https://pin.it/...`)

if (!/^https?:\/\//.test(text)) return m.reply(`✰ URL inválida.`)

try {
await m.react('🕒')
let api = `https://nexus-light.onrender.com/download/pindl.php?url=${encodeURIComponent(text)}`
let res = await fetch(api)
let json = await res.json()

if (!json.status) throw 'No se pudo obtener el contenido.'

let d = json.data

let caption = `ꕥ *Pinterest Downloader*\n\n` +
`✰ *Título:* ${d.title || 'Sin título'}\n` +
`✰ *Descripción:* ${d.description || 'Sin descripción'}\n` +
`✰ *Tipo:* ${d.type}\n` +
`✰ *Autor:* ${d.author?.name || '-'} (@${d.author?.username || '-'})\n` +
`✰ *Seguidores:* ${d.author?.followers || '-'}\n\n` +
`✰ *Likes:* ${d.stats?.likes || '0'}\n` +
`✰ *Comentarios:* ${d.stats?.comments || '0'}\n` +
`✰ *Shares:* ${d.stats?.shares || '0'}\n\n` +
`✰ *Resolución:* ${d.extra?.resolution || '-'}\n` +
`✰ *Formato:* ${d.extra?.format || '-'}\n` +
`✰ *Tamaño:* ${d.extra?.size || '-'}\n` +
`✰ *Fecha:* ${d.extra?.date_formatted || '-'}\n\n` +
`✰ ${d.link}`

if (d.type === 'video') {
return conn.sendFile(m.chat, d.download_url, 'video.mp4', caption, m)
}

if (d.type === 'image') {
return conn.sendFile(m.chat, d.download_url, 'image.jpg', caption, m)
}

await m.react('✔️')
} catch (err) {
m.reply(`✰ Error:\n${err.message || err}`)
}
}

handler.help = ['pindl', 'pinvidel']
handler.tags = ['downloader']
handler.command = ['pindl', 'pinvidel']

export default handler