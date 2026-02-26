import { xpRange } from '../lib/levelling.js'
import moment from 'moment-timezone'
import fetch from 'node-fetch'

let handler = async (m, { conn, args, usedPrefix }) => {
  try {
    // Determinar usuario
    const texto = m.mentionedJid || []
    const userId = texto.length > 0
      ? texto[0]
      : m.quoted
        ? m.quoted.sender
        : m.sender

    // Inicializar base de datos si no existe
    if (!global.db.data.users) global.db.data.users = {}
    if (!global.db.data.characters) global.db.data.characters = {}
    if (!global.db.data.users[userId]) global.db.data.users[userId] = {}

    const user = global.db.data.users[userId]

    // Inicializar propiedades por defecto
    user.name ||= await conn.getName(userId).catch(() => userId.split('@')[0])
    user.exp ||= 0
    user.level ||= 0
    user.coin ||= 0
    user.bank ||= 0
    user.commands ||= 0
    user.description ||= 'Sin descripción :v'
    user.birth ||= 'Sin especificar :< (#setbirth)'
    user.genre ||= 'Sin especificar'
    user.terianx ||= null
    user.terianxGenero ||= null
    user.marry ||= null

    // Info básica
    const cumpleanos = user.birth
    const genero = user.genre
    const pareja = user.marry
    const casado = pareja
      ? (global.db.data.users[pareja]?.name?.trim() ||
        await conn.getName(pareja)
          .then(n => typeof n === 'string' && n.trim() ? n : pareja.split('@')[0])
          .catch(() => pareja.split('@')[0]))
      : 'Nadie'

    const description = user.description
    const exp = user.exp
    const nivel = user.level
    const coin = user.coin
    const bank = user.bank
    const total = coin + bank

    // Ranking
    const sorted = Object.entries(global.db.data.users)
      .map(([k, v]) => ({ ...v, jid: k }))
      .sort((a, b) => (b.level || 0) - (a.level || 0))
    const rank = sorted.findIndex(u => u.jid === userId) + 1

    // Progreso
    const progreso = (() => {
      const datos = xpRange(nivel, global.multiplier)
      return `${exp - datos.min} / ${datos.xp} (${Math.floor(((exp - datos.min) / datos.xp) * 100)}%)`
    })()

    // Premium
    const premium = user.premium || global.prems.map(v => v.replace(/\D+/g,'') + '@s.whatsapp.net').includes(userId)
    const isLeft = premium
      ? global.prems.includes(userId.split('@')[0])
        ? 'Permanente'
        : (user.premiumTime ? await formatTime(user.premiumTime - Date.now()) : '—')
      : 'No'

    // Favorito
    const favId = user.favorite
    const favLine = favId && global.db.data.characters?.[favId]
      ? ` | ⭐ Favorito: ${global.db.data.characters[favId].name || '???'}`
      : ''

    // Harem
    const ownedIDs = Object.entries(global.db.data.characters)
      .filter(([, c]) => c.user === userId)
      .map(([id]) => id)
    const haremCount = ownedIDs.length
    const haremValue = ownedIDs.reduce((acc, id) => {
      const char = global.db.data.characters?.[id] || {}
      return acc + (Number(char.value) || 0)
    }, 0)

    // Perfil picture
    const pp = await conn.profilePictureUrl(userId, 'image')
      .catch(_ => 'https://i.imgur.com/2WZtOD6.jpeg')

    const currency = global.currency || 'Coins'

    // ✨ Texto elegante
    const text = `
╔═════════════════════╗
║       ✨ 𝗣𝗘𝗥𝗙𝗜𝗟  ✨     ║
╚═════════════════════╝

👤 Nombre: *${user.name}*${favLine}
🖋️ Descripción: _${description}_

──────────────
🎂 Cumpleaños: ${cumpleanos}
⚧ Género: ${genero}
💍 casado: ${casado}

──────────────
 𝐓𝐇𝐄𝐑𝐈𝐀𝐍
🔹 Soy Un: ${user.terianx || 'No tiene'}
🔹 Género: ${
      user.terianxGenero
        ? user.terianxGenero.charAt(0).toUpperCase() + user.terianxGenero.slice(1)
        : 'No definido'
    }

──────────────
 𝐏𝐑𝐎𝐆𝐑𝐄𝐒𝐎
⭐ Nivel: ${nivel} | Exp: ${exp.toLocaleString()}
📊 Progreso: ${progreso}
🏆 Ranking: #${rank}
💎 Premium: ${isLeft}

──────────────
 𝐄𝐂𝐎𝐍𝐎𝐌𝐈𝐀
👛 Wallet: ${coin.toLocaleString()} ${currency}
🏦 Banco: ${bank.toLocaleString()} ${currency}
💵 Total: ${total.toLocaleString()} ${currency}

──────────────
 𝐇𝐀𝐑𝐄𝐌
🎴 Personajes: ${haremCount}
💎 Valor: ${haremValue.toLocaleString()}

──────────────
 𝐒𝐈𝐒𝐓𝐄𝐌𝐀
📜 Comandos usados: ${user.commands || 0}`

    // Enviar mensaje
    await conn.sendMessage(
      m.chat,
      { image: { url: pp }, caption: text, mentions: [userId].filter(Boolean) },
      { quoted: m }
    )

  } catch (error) {
    await m.reply(`⚠︎ Error en profile.\nUsa ${usedPrefix}report\n\n${error.message}`)
  }
}

handler.help = ['profile', 'perfil']
handler.tags = ['rg']
handler.command = ['profile', 'perfil', 'perfíl']
handler.group = true

export default handler

// Función de tiempo formateado
async function formatTime(ms) {
  let s = Math.floor(ms / 1000),
      m = Math.floor(s / 60),
      h = Math.floor(m / 60),
      d = Math.floor(h / 24)
  let months = Math.floor(d / 30),
      weeks = Math.floor((d % 30) / 7)
  s %= 60; m %= 60; h %= 24; d %= 7
  let t = months ? [`${months} mes${months > 1 ? 'es' : ''}`] :
          weeks ? [`${weeks} semana${weeks > 1 ? 's' : ''}`] :
          d ? [`${d} día${d > 1 ? 's' : ''}`] : []
  if (h) t.push(`${h} hora${h > 1 ? 's' : ''}`)
  if (m) t.push(`${m} minuto${m > 1 ? 's' : ''}`)
  if (s) t.push(`${s} segundo${s > 1 ? 's' : ''}`)
  return t.length > 1 ? t.slice(0,-1).join(' ') + ' y ' + t.slice(-1) : t[0]
}
