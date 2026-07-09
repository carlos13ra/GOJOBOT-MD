import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`✰ Uso: ${usedPrefix + command} <búsqueda>\nEjemplo: ${usedPrefix + command} Anime`)
  }

  let statusMsg = await m.reply('🔎 *Buscando grupos...*')

  try {
    const api = `https://api--shadowcorexyz.replit.app/search/wagroup?q=${encodeURIComponent(text)}&page=1`
    const res = await fetch(api, { timeout: 25000 })
    const json = await res.json()

    if (!json.status || !json.results?.length) {
      return conn.sendMessage(m.chat, {
        text: '✘ No se encontraron resultados',
        edit: statusMsg.key
      })
    }

    const results = json.results.slice(0, 10)

    let txt = `╭─❒ *WHATSAPP GROUP SEARCH*\n`
    txt += `│ 🔍 *Búsqueda:* ${json.query}\n`
    txt += `│ 📄 *Página:* ${json.page}\n`
    txt += `│ 📦 *Total:* ${json.total}\n`
    txt += `╰─❒\n\n`

    for (let i = 0; i < results.length; i++) {
      const g = results[i]

      txt += `*${i + 1}. ${g.name}*\n`
      txt += `🌎 País: ${g.country || 'Desconocido'}\n`
      txt += `📂 Categoría: ${g.category || 'Sin categoría'}\n`
      txt += `🔗 ${g.link}\n\n`
    }

    await conn.sendMessage(m.chat, {
      text: txt,
      edit: statusMsg.key
    })

    await m.react('✅')

  } catch (e) {
    console.error(e)

    await conn.sendMessage(m.chat, {
      text: `✘ Error: ${e.message}`,
      edit: statusMsg.key
    })

    await m.react('❌')
  }
}

handler.help = ['wagroup <texto>', 'gruposwa <texto>']
handler.tags = ['search']
handler.command = ['wagroup', 'gruposwa']
handler.group = true

export default handler