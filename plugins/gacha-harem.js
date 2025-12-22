import { promises as fs } from 'fs'

const charactersFilePath = './lib/characters.json'

async function loadCharacters () {
  return JSON.parse(await fs.readFile(charactersFilePath, 'utf-8'))
}

function flattenCharacters (data) {
  return Object.values(data).flatMap(g =>
    Array.isArray(g.characters) ? g.characters : []
  )
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    // ✅ FIX REAL: leer bien la página
    const page = parseInt(args[0]) || 1

    const user =
      m.mentionedJid?.[0] ||
      (m.quoted && m.quoted.sender) ||
      m.sender

    const name =
      global.db.data.users[user]?.name?.trim() ||
      (await conn.getName(user)).split('@')[0]

    const allCharacters = await loadCharacters()
    const flat = flattenCharacters(allCharacters)

    const claimed = Object.entries(global.db.data.characters || {})
      .filter(([, c]) =>
        (c.user || '').replace(/\D/g, '') === user.replace(/\D/g, '')
      )
      .map(([id]) => id)

    if (!claimed.length) {
      return conn.reply(
        m.chat,
        user === m.sender
          ? 'ꕥ No tienes personajes reclamados.'
          : `ꕥ *${name}* no tiene personajes reclamados.`,
        m,
        { mentions: [user] }
      )
    }

    // ordenar por valor
    claimed.sort((a, b) => {
      const ca = global.db.data.characters[a] || {}
      const cb = global.db.data.characters[b] || {}
      return (cb.value || 0) - (ca.value || 0)
    })

    const perPage = 50
    const totalPages = Math.ceil(claimed.length / perPage)

    if (page < 1 || page > totalPages) {
      return conn.reply(
        m.chat,
        `❀ Página no válida. Hay un total de *${totalPages}* páginas.`,
        m
      )
    }

    const start = (page - 1) * perPage
    const end = Math.min(start + perPage, claimed.length)

    // 🧠 TEXTO ORIGINAL (NO TOCADO)
    let text = '✿ Personajes reclamados ✿\n'
    text += `⌦ Usuario: *${name}*\n\n`
    text += `♡ Personajes: *(${claimed.length})*\n\n`

    for (let i = start; i < end; i++) {
      const id = claimed[i]
      const data = global.db.data.characters[id] || {}
      const info = flat.find(x => x.id === id)

      text += `ꕥ ${info?.name || data.name || id}
» ID: ${id}
» Valor: ${(data.value || info?.value || 0).toLocaleString()}

`
    }

    // 🔒 FORMATO ORIGINAL DE PÁGINA
    text += `\n⌦ _Página *${page} de ${totalPages}*_`

    await conn.reply(m.chat, text.trim(), m, { mentions: [user] })

  } catch (e) {
    await conn.reply(
      m.chat,
      `⚠︎ Se ha producido un problema.\nUsa *${usedPrefix}report*\n\n${e.message}`,
      m
    )
  }
}

handler.help = ['harem', 'claims', 'waifus']
handler.tags = ['anime']
handler.command = ['harem', 'claims', 'waifus']
handler.group = true

export default handler
