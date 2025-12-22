import fs from 'fs'

let handler = async (m, { conn, text, args, usedPrefix, command }) => {
  let db = global.db
  let users = db.data.users

  // ======== DETECCIÓN DE USUARIO ========
  let who = null

  // 1️⃣ Si menciona
  if (m.mentionedJid && m.mentionedJid.length) {
    who = m.mentionedJid[0]
  }

  // 2️⃣ Si responde a un mensaje
  else if (m.quoted) {
    // 2.1 Si responde Y escribe un nombre (ej: "Jaren")
    if (text && !text.match(/^\d+$/)) {
      let nameSearch = text.toLowerCase()
      let found = Object.entries(users).find(([jid, u]) =>
        u.name && u.name.toLowerCase().includes(nameSearch)
      )
      if (found) who = found[0]
      else who = m.quoted.sender
    } else {
      who = m.quoted.sender
    }
  }

  // 3️⃣ Por defecto
  else {
    who = m.sender
  }

  if (!users[who]) users[who] = {}

  // ======== PAGINACIÓN ========
  let page = 1
  if (args[0] && !isNaN(args[0])) page = parseInt(args[0])
  let perPage = 10

  let harem = users[who].harem || []
  if (!harem.length) {
    return m.reply('❌ Este usuario no tiene personajes en su harem.')
  }

  let start = (page - 1) * perPage
  let end = start + perPage
  let totalPages = Math.ceil(harem.length / perPage)

  if (page > totalPages || page < 1) {
    return m.reply(`⚠️ Página inválida. Usa entre 1 y ${totalPages}`)
  }

  // ======== CARGA DE PERSONAJES ========
  let characters = JSON.parse(fs.readFileSync('./lib/characters.json'))
  let flatCharacters = flattenCharacters(characters)

  // ======== TEXTO ========
  let userName = users[who].name || conn.getName(who)
  let txt = `╭─❍ *HAREM DE ${userName}* ❍─╮\n`
  txt += `│ Página ${page}/${totalPages}\n`
  txt += `╰───────────────\n\n`

  for (let i = start; i < end && i < harem.length; i++) {
    let id = harem[i]
    let info = flatCharacters.find(c => c.id == id)

    txt += `ꕥ ${info?.name || 'Personaje desconocido'}\n`
    txt += `» Anime: ${info?.anime || 'Desconocido'}\n`
    txt += `» ID: ${id}\n`
    txt += `» Valor: ${info?.value || 0}\n\n`
  }

  txt += `📌 Usa *${usedPrefix + command} ${page + 1}* para la siguiente página`

  m.reply(txt)
}

handler.help = ['harem [página]']
handler.tags = ['rpg']
handler.command = /^harem$/i

export default handler

// ======== FUNCIÓN CLAVE (ANIME CORRECTO) ========
function flattenCharacters (data) {
  let result = []

  for (const key in data) {
    const group = data[key]
    const animeName = group.name || 'Desconocido'

    if (Array.isArray(group.characters)) {
      for (const c of group.characters) {
        result.push({
          ...c,
          anime: animeName
        })
      }
    }
  }

  return result
    }
