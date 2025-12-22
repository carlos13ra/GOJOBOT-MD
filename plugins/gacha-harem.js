import { promises as fs } from 'fs'

const charactersFilePath = './lib/characters.json'

async function loadCharacters () {
  return JSON.parse(await fs.readFile(charactersFilePath, 'utf-8'))
}

function flattenCharacters (data) {
  return Object.values(data).flatMap(group =>
    Array.isArray(group.characters)
      ? group.characters.map(c => ({
          ...c,
          __anime: group.name || group.anime || group.series || 'Desconocido'
        }))
      : []
  )
}

let handler = async (m, { conn, args, usedPrefix }) => {
  try {
    const page = parseInt(args[0]) || 1

    const user =
      m.mentionedJid?.[0] ||
      (m.quoted && m.quoted.sender) ||
      m.sender

    const isSelf = user === m.sender

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
        isSelf
          ? 'ꕥ No tienes personajes reclamados.'
          : `ꕥ *${name}* no tiene personajes reclamados.`,
        m,
        { mentions: [user] }
      )
    }

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

    // 🎨 DISEÑO (SOLO CAMBIA SI ES TU HAREM)
    let text = isSelf
      ? '╭───〔 💖 𝗧𝗨 𝗛𝗔𝗥𝗘𝗠 💖 〕───╮\n'
      : '✿ Personajes reclamados ✿\n'

    text += isSelf
      ? `│ 👤 Usuario: *${name}*\n│ 🧾 Total: *${claimed.length}*\n╰────────────────────╯\n\n`
      : `⌦ Usuario: *${name}*\n\n♡ Personajes: *(${claimed.length})*\n\n`

    for (let i = start; i < end; i++) {
      const id = claimed[i]
      const data = global.db.data.characters[id] || {}
      const info = flat.find(x => x.id === id)

      const anime =
        info?.__anime ||
        info?.anime ||
        data.anime ||
        data.series ||
        'Desconocido'

      const charName =
        info?.name ||
        data.name ||
        `Personaje ${id}`

      const value =
        typeof data.value === 'number'
          ? data.value
          : info?.value || 0

      text += isSelf
        ? `✨ *${charName}*
╭─ 📺 Anime: ${anime}
├─ 🆔 ID: ${id}
╰─ 💎 Valor: ${value.toLocaleString()}

`
        : `ꕥ ${charName}
» Anime: ${anime}
» ID: ${id}
» Valor: ${value.toLocaleString()}

`
    }

    text += isSelf
      ? `╰───〔 📄 Página ${page}/${totalPages} 〕───╯`
      : `⌦ _Página *${page} de ${totalPages}*_`

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
handler.tags = ['gacha']
handler.command = ['harem', 'claims', 'waifus']
handler.group = true

export default handler
