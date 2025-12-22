import fs from 'fs/promises'

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
    // 🔥 FORZAR LECTURA REAL DE LA PÁGINA
    let page = Number(args[0])
    if (isNaN(page) || page < 1) page = 1

    const user =
      m.mentionedJid?.[0] ||
      (m.quoted && m.quoted.sender) ||
      m.sender

    const name =
      global.db.data.users[user]?.name?.trim() ||
      (await conn.getName(user)).split('@')[0]

    const allCharacters = await loadCharacters()
    const flat = flattenCharacters(allCharacters)

    // personajes reclamados
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
      const va = Number(ca.value ?? flat.find(x => x.id === a)?.value ?? 0)
      const vb = Number(cb.value ?? flat.find(x => x.id === b)?.value ?? 0)
      return vb - va
    })

    // 📄 PAGINACIÓN REAL
    const perPage = 50
    const totalPages = Math.ceil(claimed.length / perPage)

    if (page > totalPages) {
      return conn.reply(
        m.chat,
        `❀ Página no válida. Hay un total de *${totalPages}* páginas.`,
        m
      )
    }

    const start = (page - 1) * perPage
    const end = start + perPage

    // 📝 TEXTO
    let text = `✿ Personajes reclamados ✿
⌦ Usuario: *${name}*
⌦ Página: *${page} / ${totalPages}*

♡ Personajes: *(${claimed.length})*
\n`

    for (let i = start; i < end && i < claimed.length; i++) {
      const id = claimed[i]
      const data = global.db.data.characters[id] || {}
      const info = flat.find(x => x.id === id)

      text += `ꕥ ${info?.name || data.name || `Personaje ${id}`}
» ID: ${id}
» Valor: ${(Number(data.value ?? info?.value ?? 0)).toLocaleString()}

`
    }

    // navegación clara
    if (page < totalPages) {
      text += `⌦ Siguiente: *${usedPrefix + command} ${page + 1}*\n`
    }
    if (page > 1) {
      text += `⌦ Anterior: *${usedPrefix + command} ${page - 1}*`
    }

    await conn.reply(m.chat, text.trim(), m, { mentions: [user] })

  } catch (e) {
    conn.reply(
      m.chat,
      `⚠︎ Error.\nUsa *${usedPrefix}report*\n\n${e.message}`,
      m
    )
  }
}

handler.help = ['harem', 'claims', 'waifus']
handler.tags = ['anime']
handler.command = ['harem', 'claims', 'waifus']
handler.group = true

export default handler
