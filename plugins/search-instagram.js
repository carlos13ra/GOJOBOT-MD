import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    if (!text) return m.reply(`✰ Uso: ${usedPrefix + command} anime\nEjemplo: ${usedPrefix + command} top animes 2026`)
    await m.react('🔍')
    const api = `${global.APIs.light.url}/search/reels?q=${encodeURIComponent(text)}`
    const res = await fetch(api)
    const json = await res.json()

    if (!json.status ||!json.result?.length) {
      return m.reply('✘ No se encontraron reels o la API murió jaja')
    }

    let reels = json.result.slice(0, 10) 
    let caption = `🍜 *IG Reels Search: ${text}*\n> • Total: ${json.total} resultados\n\n`

    for (let i = 0; i < reels.length; i++) {
      let r = reels[i]
      let likes = r.description.match(/([\d,.KMB]+)\s*likes/i)?.[1] || '0'
      let comments = r.description.match(/([\d,.KMB]+)\s*comments/i)?.[1] || '0'

      caption += `*${i + 1}.* ${r.title.split('\n')[0]}\n`
      caption += `❤ ${likes} 💬 ${comments}\n`
      caption += `🔗 \`\`\`${r.url}\`\`\`\n\n`
    }

    await conn.sendMessage(m.chat, {
      image: { url: banner },
      caption: caption.trim()
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    m.reply('✘ Error en la API.')
  }
}

handler.help = ['igreels *« ǫᴜᴇʀʏ »*', 'igsearch *« ǫᴜᴇʀʏ »*']
handler.tags = ['search']
handler.command = ['igreels', 'igsearch']
handler.group = true
export default handler