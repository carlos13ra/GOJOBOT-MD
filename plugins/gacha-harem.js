import { promises as fs } from 'fs'

const charactersFilePath = './lib/characters.json'

// Cargar characters.json
async function loadCharacters () {
  const data = await fs.readFile(charactersFilePath, 'utf-8')
  return JSON.parse(data)
}

// Aplanar personajes + heredar anime
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

let handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    if (!global.db.data.characters) global.db.data.characters = {}

    // Usuario mencionado o autor
    let who = m.mentionedJid && m.mentionedJid.length
      ? m.mentionedJid[0]
      : m.sender

    let username =
      global.db.data.users?.[who]?.name?.trim() ||
      (await conn.getName(who).catch(() => who.split('@')[0]))

    // Personajes reclamados por el usuario
    let claimed = Object.entries(global.db.data.characters)
      .filter(([_, v]) => (v.user || '').replace(/\D/g, '') === who.replace(/\D/g, ''))
      .map(([id]) => id)

    if (!claimed.length) {
      return conn.reply(
        m.chat,
        who === m.sender
          ? 'ꕥ No tienes personajes reclamados.'
          : `ꕥ El usuario *${username}* no tiene personajes reclamados.`,
        m,
        { mentions: [who] }
      )
    }

    const allCharacters = flattenCharacters(await loadCharacters())

    // Ordenar por valor
    claimed.sort((a, b) => {
      const A = global.db.data.characters[a]?.value
        ?? allCharacters.find(c => c.id === a)?.value
        ?? 0
      const B = global.db.data.characters[b]?.value
        ?? allCharacters.find(c => c.id === b)?.value
        ?? 0
      return B - A
    })

    // PAGINACIÓN
    const page = parseInt(args[0]) || 1
    const perPage = 32
    const maxPage = Math.ceil(claimed.length / perPage)

    if (page < 1 || page > maxPage) {
      return conn.reply(
        m.chat,
        `❀ Página no válida. Hay un total de *${maxPage}* páginas.`,
        m
      )
    }

    const start = (page - 1) * perPage
    const end = Math.min(start + perPage, claimed.length)

    // TEXTO WHATSAPP (ESTILO ORIGINAL)
    let text = '✿ Personajes reclamados ✿\n'
    text += `⌦ Usuario: *${username}*\n\n`
    text += `♡ Personajes: *(${claimed.length})*\n\n`

    for (let i = start; i < end; i++) {
      const id = claimed[i]
      const dbChar = global.db.data.characters[id] || {}
      const info = allCharacters.find(c => c.id === id)

      const name = info?.name || dbChar.name || `ID ${id}`
      const value = dbChar.value ?? info?.value ?? 0
      const anime = info?.anime || 'Desconocido'

      text += `ꕥ ${name}\n`
      text += `» Anime: ${anime}\n`
      text += `» ID: ${id}\n`
      text += `» Valor: ${value.toLocaleString()}\n\n`
    }

    text += `⌦ _Página *${page} de ${maxPage}*_`

    await conn.reply(m.chat, text.trim(), m, { mentions: [who] })

  } catch (e) {
    await conn.reply(
      m.chat,
      `⚠︎ Se ha producido un problema.\n> Usa *${usedPrefix + command}report* para informarlo.\n\n${e.message}`,
      m
    )
  }
}

handler.help = ['harem']
handler.tags = ['anime']
handler.command = ['harem', 'waifus', 'claims']
handler.register = true

export default handler
