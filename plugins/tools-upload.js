import fetch from 'node-fetch'
import uploadImage from '../lib/uploadImage.js'
import { FormData, Blob } from 'formdata-node'
import { fileTypeFromBuffer } from 'file-type'
import crypto from 'crypto'

const handler = async (m, { conn, command, usedPrefix }) => {

try {

let q = m.quoted ? m.quoted : m
let mime = (q.msg || q).mimetype || ''

switch (command) {

case 'tourl': {

if (!mime) {
return conn.reply(
m.chat,
`❀ Por favor, responde a una *Imagen* o *Vídeo.*`,
m
)}

await m.react('🕒')

const media = await q.download()

const isTele = /image\/(png|jpe?g|gif)|video\/mp4/.test(mime)

const link = await uploadImage(media)

const txt =
`乂  *L I N K - E N L A C E*  乂

*» Enlace* : ${link}
*» Tamaño* : ${formatBytes(media.length)}
*» Expiración* : ${isTele ? 'No expira' : 'Desconocido'}`

await conn.sendFile(
m.chat,
media,
'thumbnail.jpg',
txt,
m
)

await m.react('✔️')

break
}

case 'catbox': {

if (!mime) {
return conn.reply(
m.chat,
`❀ Por favor, responde a una *Imagen* o *Vídeo.*`,
m
)}

await m.react('🕒')

const media = await q.download()

const isTele = /image\/(png|jpe?g|gif)|video\/mp4/.test(mime)

const link = await catbox(media)

const txt =
`*乂 C A T B O X - U P L O A D E R 乂*

*» Enlace* : ${link}
*» Tamaño* : ${formatBytes(media.length)}
*» Expiración* : ${isTele ? 'No expira' : 'Permanente'}`

await conn.sendFile(
m.chat,
media,
'thumbnail.jpg',
txt,
m
)

await m.react('✔️')

break
}

}

} catch (error) {

console.log(error)

await m.react('✖️')

await conn.reply(
m.chat,
`⚠︎ Se ha producido un problema.

${error.message}`,
m
)

}}

handler.help = ['tourl', 'catbox']
handler.tags = ['tools']
handler.command = ['tourl', 'catbox']

export default handler

function formatBytes(bytes) {
if (bytes === 0) return '0 B'

const sizes = ['B', 'KB', 'MB', 'GB', 'TB']

const i = Math.floor(Math.log(bytes) / Math.log(1024))

return `${(bytes / 1024 ** i).toFixed(2)} ${sizes[i]}`
}

async function catbox(buffer) {

const fileType = await fileTypeFromBuffer(buffer)

if (!fileType) {
throw new Error('No se pudo detectar el tipo de archivo')
}

const { ext, mime } = fileType

const form = new FormData()

const blob = new Blob([buffer], { type: mime })

const fileName =
`${crypto.randomBytes(6).toString('hex')}.${ext}`

form.append('reqtype', 'fileupload')

form.append(
'fileToUpload',
blob,
fileName
)

const res = await fetch(
'https://catbox.moe/user/api.php',
{
method: 'POST',
body: form,
headers: {
'User-Agent': 'Mozilla/5.0'
}
}
)

const text = await res.text()

if (!text.startsWith('https://')) {
throw new Error(text)
}

return text.trim()
}