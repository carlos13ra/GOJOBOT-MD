import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
  const user = global.db.data.users[m.sender] || {}
  
  if (user.coin < 20) {
    return conn.reply(m.chat, `ꕥ No tienes suficientes *${currency}*.\nNecesitas al menos 20 para usar este comando.`, m)
  }

  if (!text) return m.reply(`*📥 Por favor, ingresa un link válido de Mediafire.*`)

  await conn.sendMessage(m.chat, { react: { text: "🕒", key: m.key } })

  await conn.sendMessage(m.chat, {
    text: '🄸 🄽 🄸 🄲 🄸 🄰 🄽 🄳 🄾 • 🄳🄴🅂🄲🄰🅁🄶🄰\n> *Procesando descarga, por favor espere... ⏳*',
    mentions: [m.sender],
    contextInfo: {
      externalAdReply: {
        title: '📥 GojoBot AI • Mediafire Downloader',
        body: 'Obteniendo datos del archivo...',
        thumbnailUrl: global.logo || 'https://i.ibb.co/5v4syqS/mediafire.jpg',
        mediaType: 1,
        renderLargerThumbnail: true
      }
    }
  }, { quoted: m })

  try {

    let res1 = await fetch(`https://api.siputzx.my.id/api/d/mediafire`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: text })
    })
    let json1 = await res1.json()

    if (json1.status && json1.data?.downloadLink) {
      let d = json1.data
      let meta = d.meta || {}

      let info = `╭━━━〔 *MEDIAFIRE - DESCARGA EXITOSA* 〕━━⬣
┃ 📦 *Nombre:* ${d.fileName}
┃ 📁 *Tamaño:* ${d.fileSize}
┃ 🗓️ *Subido:* ${d.uploadDate || 'Desconocida'}
┃ 🧩 *Tipo:* ${d.fileType}
┃ 💻 *Compatibilidad:* ${d.compatibility || 'N/A'}
┃ 📂 *Extensión:* ${d.fileExtension || 'N/A'}
╰━━━⬣

📝 *Descripción:* ${d.description || 'No disponible'}

🔗 *Enlace directo:* 
${d.downloadLink}

🌐 *Meta Info:*
• URL: ${meta.url || 'N/A'}
• Título: ${meta.title || 'N/A'}
• Imagen: ${meta.image || 'N/A'}
• App ID: ${meta.app_id || 'N/A'}`

      await conn.sendFile(m.chat, d.downloadLink, d.fileName, info, m)
      await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
      user.coin -= 20
      conn.reply(m.chat, `ꕥ Has utilizado 20 *${currency}*`, m)
      return
    }

    let res2 = await fetch(`https://api.stellarwa.xyz/dow/mediafire?url=${encodeURIComponent(text)}&apikey=Shadow_Core`)
    let json2 = await res2.json()

    if (!json2.status || !json2.data?.dl)
      throw new Error('No se pudo obtener el archivo desde ninguna API.')

    let { title, peso, fecha, tipo, dl } = json2.data

    await conn.sendFile(
      m.chat,
      dl,
      title,
      `╭━━━〔 *MEDIAFIRE - DESCARGA EXITOSA* 〕━━⬣
┃ 📦 *Nombre:* ${title}
┃ 📁 *Tamaño:* ${peso}
┃ 🗓️ *Fecha:* ${fecha}
┃ 🧩 *Tipo:* ${tipo}
╰━━━⬣

✅ Archivo descargado correctamente.
🔗 *Enlace directo:* ${dl}`,
      m
    )

    await conn.sendMessage(m.chat, { react: { text: '✔️', key: m.key } })
    user.coin -= 20
    conn.reply(m.chat, `ꕥ Has utilizado 20 *${currency}*`, m)

  } catch (e) {
    console.error(e)
    m.reply(`*Error al procesar la descarga:*\n> ${e.message}`)
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
  }
}

handler.help = ['mediafire2']
handler.tags = ['download']
handler.command = ['mf2', 'mediafire2']
handler.group = true

export default handler