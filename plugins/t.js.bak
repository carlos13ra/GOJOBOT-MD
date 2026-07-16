import fetch from 'node-fetch'

let handler = async (m, { conn, usedPrefix, command, text }) => {
  try {
    if (!text?.startsWith('http')) return m.reply(`Uso: ${usedPrefix}${command} <url de stordl>`)

    await m.react('🕒')

    // Extraer id y name de la URL
    const urlObj = new URL(text.trim())
    const id = urlObj.pathname.replace('/', '')
    const name = urlObj.searchParams.get('name') || ''

    // Obtener direct link
    const apiUrl = `https://stordl.halahgan.com/${id}?action=file-url&id=${id}&name=${encodeURIComponent(name)}`
    const res = await fetch(apiUrl)
    const json = await res.json()

    if (!json.ok || !json.url) throw new Error(json.error || 'No se obtuvo el link')

    await conn.sendMessage(m.chat, {
      document: { url: json.url },
      mimetype: 'video/mp4',
      fileName: name || `${id}.mp4`,
      caption: `🍡 *${name || id}*`
    }, { quoted: m })

    await m.react('✔️')

  } catch (e) {
    await m.react('✖️')
    m.reply(`🍡 Error:\n\`\`\`${e.message}\`\`\``)
  }
}

handler.help = ['stordl <url>']
handler.tags = ['download']
handler.command = ['stordl', 'stor']
handler.group = true

export default handler