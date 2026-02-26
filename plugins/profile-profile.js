import { xpRange } from '../lib/levelling.js'
import moment from 'moment-timezone'
import fetch from 'node-fetch'

let handler = async (m, { conn, args, usedPrefix }) => {
try {
let texto = await m.mentionedJid
let userId = texto.length > 0 ? texto[0] : (m.quoted ? await m.quoted.sender : m.sender)

if (!global.db.data.users) global.db.data.users = {}
if (!global.db.data.characters) global.db.data.characters = {}
if (!global.db.data.users[userId]) global.db.data.users[userId] = {}

const user = global.db.data.users[userId]

// Nombre seguro
let name = user.name || await conn.getName(userId).catch(() => userId.split('@')[0])

// 🔥 THERIANS
if (!user.terianx) user.terianx = null
if (!user.terianxGenero) user.terianxGenero = null

const cumpleanos = user.birth || 'Sin especificar :< (#setbirth)'
const genero = user.genre || 'Sin especificar'
const pareja = user.marry

const casado = await (async () => 
  pareja 
    ? (global.db.data.users[pareja]?.name?.trim() || 
      await conn.getName(pareja)
        .then(n => typeof n === 'string' && n.trim() ? n : pareja.split('@')[0])
        .catch(() => pareja.split('@')[0])) 
    : 'Nadie'
)()

const description = user.description || 'Sin descripción :v'
const exp = user.exp || 0
const nivel = user.level || 0
const coin = user.coin || 0
const bank = user.bank || 0
const total = coin + bank

// Ranking
const sorted = Object.entries(global.db.data.users)
.map(([k, v]) => ({ ...v, jid: k }))
.sort((a, b) => (b.level || 0) - (a.level || 0))

const rank = sorted.findIndex(u => u.jid === userId) + 1

// XP progreso
const progreso = (() => {
let datos = xpRange(nivel, global.multiplier)
return `${exp - datos.min} / ${datos.xp} (${Math.floor(((exp - datos.min) / datos.xp) * 100)}%)`
})()

// Premium
const premium = user.premium || global.prems.map(v => v.replace(/\D+/g, '') + '@s.whatsapp.net').includes(userId)

const isLeft = premium 
? (global.prems.includes(userId.split('@')[0]) 
  ? 'Permanente' 
  : (user.premiumTime ? await formatTime(user.premiumTime - Date.now()) : '—')) 
: '—'

// Harem
const favId = user.favorite
const favLine = favId && global.db.data.characters?.[favId] 
? `\n│ ⭐ Favorito: ${global.db.data.characters[favId].name || '???'}` 
: ''

const ownedIDs = Object.entries(global.db.data.characters)
.filter(([, c]) => c.user === userId)
.map(([id]) => id)

const haremCount = ownedIDs.length

const haremValue = ownedIDs.reduce((acc, id) => {
const char = global.db.data.characters[id] || {}
const value = typeof char.value === 'number' ? char.value : 0
return acc + value
}, 0)

// Imagen segura (fix 404)
let img
try {
  const pp = await conn.profilePictureUrl(userId, 'image')
  const res = await fetch(pp)
  img = await res.buffer()
} catch {
  const res = await fetch('https://i.imgur.com/2WZtOD6.jpeg')
  img = await res.buffer()
}

// Moneda
const currency = global.currency || 'Coins'

// ✨ ESTILO NUEVO (WhatsApp visual)
const text = `┌─❖ 「 PERFIL 」
│ 👤 ${name}
│ ✎ ${description}
└────────────

┌─❖ 「 INFO 」
│ 🎂 ${cumpleanos}
│ ⚥ ${genero}
│ 💍 ${casado}
└────────────

┌─❖ 「 THERIAN 」
│ 🐾 ${user.terianx || 'No tiene'}
│ ⚧ ${
  user.terianxGenero
    ? user.terianxGenero.charAt(0).toUpperCase() + user.terianxGenero.slice(1)
    : 'No definido'
}
└────────────

┌─❖ 「 PROGRESO 」
│ ⭐ Nivel: ${nivel}
│ ✦ Exp: ${exp.toLocaleString()}
│ 📊 ${progreso}
│ 🏆 #${rank}
│ 💎 ${premium ? `Premium (${isLeft})` : 'No premium'}
└────────────

┌─❖ 「 ECONOMÍA 」
│ 🪙 ${coin.toLocaleString()}
│ 🏦 ${bank.toLocaleString()}
│ 💸 ${total.toLocaleString()} ${currency}
└────────────

┌─❖ 「 HAREM 」
│ 👥 ${haremCount}
│ 💎 ${haremValue.toLocaleString()}${favLine}
└────────────

┌─❖ 「 OTROS 」
│ ⚙️ ${user.commands || 0} comandos
└────────────`

await conn.sendMessage(
  m.chat,
  { image: img, caption: text, mentions: [userId] },
  { quoted: fkontak }
)

} catch (error) {
await m.reply(`⚠︎ Error en profile.\nUsa ${usedPrefix}report\n\n${error.message}`)
}}

handler.help = ['profile', 'perfil']
handler.tags = ['rg']
handler.command = ['profile', 'perfil', 'perfíl']
handler.group = true

export default handler

async function formatTime(ms) {
let s = Math.floor(ms / 1000), m = Math.floor(s / 60), h = Math.floor(m / 60), d = Math.floor(h / 24)
let months = Math.floor(d / 30), weeks = Math.floor((d % 30) / 7)
s %= 60; m %= 60; h %= 24; d %= 7
let t = months ? [`${months} mes${months > 1 ? 'es' : ''}`] :
weeks ? [`${weeks} semana${weeks > 1 ? 's' : ''}`] :
d ? [`${d} día${d > 1 ? 's' : ''}`] : []
if (h) t.push(`${h} hora${h > 1 ? 's' : ''}`)
if (m) t.push(`${m} minuto${m > 1 ? 's' : ''}`)
if (s) t.push(`${s} segundo${s > 1 ? 's' : ''}`)
return t.length > 1 
? t.slice(0, -1).join(' ') + ' y ' + t.slice(-1) 
: t[0]
}
