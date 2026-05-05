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
          ? '✦ 𝐍𝐨 𝐭𝐢𝐞𝐧𝐞𝐬 𝐩𝐞𝐫𝐬𝐨𝐧𝐚𝐣𝐞𝐬 𝐫𝐞𝐜𝐥𝐚𝐦𝐚𝐝𝐨𝐬.'
          : `✦ *${name}* 𝐧𝐨 𝐭𝐢𝐞𝐧𝐞 𝐩𝐞𝐫𝐬𝐨𝐧𝐚𝐣𝐞𝐬 𝐫𝐞𝐜𝐥𝐚𝐦𝐚𝐝𝐨𝐬.`,
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
        `✦ 𝐏𝐚́𝐠𝐢𝐧𝐚 𝐧𝐨 𝐯𝐚́𝐥𝐢𝐝𝐚.\n𝐓𝐨𝐭𝐚𝐥: *${totalPages}* 𝐩𝐚́𝐠𝐢𝐧𝐚𝐬.`,
        m
      )
    }

    const start = (page - 1) * perPage
    const end = Math.min(start + perPage, claimed.length)

    // 🎨 SOLO TEXTO – FUENTE LEGIBLE
    let text = isSelf
      ? '╭───〔 💖 𝐓𝐔 𝐇𝐀𝐑𝐄𝐌 💖 〕───╮\n'
      : '✿ 𝐏𝐞𝐫𝐬𝐨𝐧𝐚𝐣𝐞𝐬 𝐑𝐞𝐜𝐥𝐚𝐦𝐚𝐝𝐨𝐬 ✿\n'

    text += isSelf
      ? `│ 👤 𝐔𝐬𝐮𝐚𝐫𝐢𝐨: *${name}*\n│ 🧾 𝐓𝐨𝐭𝐚𝐥: *${claimed.length}*\n╰────────────────────╯\n\n`
      : `⌦ 𝐔𝐬𝐮𝐚𝐫𝐢𝐨: *${name}*\n\n♡ 𝐏𝐞𝐫𝐬𝐨𝐧𝐚𝐣𝐞𝐬: *(${claimed.length})*\n\n`

    for (let i = start; i < end; i++) {
      const id = claimed[i]
      const data = global.db.data.characters[id] || {}
      const info = flat.find(x => x.id === id)

      const anime =
        info?.__anime ||
        info?.anime ||
        data.anime ||
        data.series ||
        '𝐃𝐞𝐬𝐜𝐨𝐧𝐨𝐜𝐢𝐝𝐨'

      const charName =
        info?.name ||
        data.name ||
        `𝐏𝐞𝐫𝐬𝐨𝐧𝐚𝐣𝐞 ${id}`

      const value =
        typeof data.value === 'number'
          ? data.value
          : info?.value || 0

      text += isSelf
        ? `✧ *${charName}*
╭─ 📺 𝐀𝐧𝐢𝐦𝐞: ${anime}
├─ 🆔 𝐈𝐃: ${id}
╰─ 💎 𝐕𝐚𝐥𝐨𝐫: ${value.toLocaleString()}

`
        : `ꕥ ${charName}
» 𝐀𝐧𝐢𝐦𝐞: ${anime}
» 𝐈𝐃: ${id}
» 𝐕𝐚𝐥𝐨𝐫: ${value.toLocaleString()}

`
    }

    text += isSelf
      ? `╰───〔 📄 𝐏𝐚́𝐠𝐢𝐧𝐚 ${page}/${totalPages} 〕───╯`
      : `⌦ _𝐏𝐚́𝐠𝐢𝐧𝐚 *${page} 𝐝𝐞 ${totalPages}*_`

    await conn.reply(m.chat, text.trim(), m, { mentions: [user] })

  } catch (e) {
    await conn.reply(
      m.chat,
      `⚠️ 𝐄𝐫𝐫𝐨𝐫.\n𝐔𝐬𝐚 *${usedPrefix}report*\n\n${e.message}`,
      m
    )
  }
}

handler.help = ['harem', 'claims', 'waifus']
handler.tags = ['gacha']
handler.command = ['harem', 'claims', 'waifus']
handler.group = true

export default handler
