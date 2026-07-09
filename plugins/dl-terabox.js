import fetch from 'node-fetch'

let handler = async (m, { command, usedPrefix, conn, text, args }) => {
  if (!text) return m.reply(
    `🍡 *Ingresa el enlace de Terabox.*\n\n` +
    `• ${usedPrefix + command} https://1024terabox.com/s/xxxxx`
  )

  if (!text.startsWith('http')) return m.reply('🍡 Ingresa una URL válida de Terabox.')

  try {
    m.react('🕒')
    const res = await fetch(`https://nexus-light.onrender.com/download/terabox?url=${encodeURIComponent(text)}`)
    const json = await res.json()

    if (!json.status || !json.files?.length) throw new Error('No se encontraron archivos.')

    const files = json.files.filter(f => !f.is_folder)

    let caption = `乂 \`\`\`TERABOX - FILES\`\`\`\n\n`
    caption += `≡ 🍡 *Total archivos :* ${json.total_files}\n\n`

    files.forEach((f, i) => {
      caption += `\`${i + 1}\` *${f.name}*\n`
      caption += `｡ Tamaño : ${f.size_formatted}\n`
      caption += `｡ Tipo : ${f.type}\n\n`
    })

    caption += `> Responde a este mensaje con el *número* del archivo que quieres descargar.\n> Ejemplo: *1*`

    const sent = await conn.sendMessage(m.chat, { text: caption }, { quoted: m })

    conn.terabox = conn.terabox || {}
    conn.terabox[m.sender] = {
      files,
      key: sent.key,
      downloading: false,
      timeout: setTimeout(() => delete conn.terabox[m.sender], 600_000)
    }

    m.react('✅')
  } catch (e) {
    m.reply('🍡 Error: ' + e.message)
  }
}

handler.before = async (m, { conn }) => {
  conn.terabox = conn.terabox || {}
  const session = conn.terabox[m.sender]

  if (!session || !m.quoted || m.quoted.id !== session.key.id) return

  if (session.downloading) return m.reply('🌷 Ya hay una descarga en curso. Espera a que termine.')

  const num = parseInt(m.text.trim())
  if (isNaN(num) || num < 1 || num > session.files.length)
    return m.reply(`🌵 Número inválido. Elige entre 1 y ${session.files.length}.`)

  const file = session.files[num - 1]

  await m.reply(`🍡 Descargando *${file.name}* (${file.size_formatted})...`)
  m.react('📥')
  session.downloading = true

  try {
    const ext = file.name.split('.').pop().toLowerCase()
    const mimeTypes = {
      mp4: 'video/mp4', mkv: 'video/x-matroska', avi: 'video/x-msvideo',
      mov: 'video/quicktime', webm: 'video/webm',
      mp3: 'audio/mpeg', ogg: 'audio/ogg', wav: 'audio/wav', flac: 'audio/flac',
      pdf: 'application/pdf', zip: 'application/zip', rar: 'application/x-rar-compressed',
      jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }
    const mimetype = mimeTypes[ext] || 'application/octet-stream'

    await conn.sendMessage(
      m.chat,
      {
        document: { url: file.download_url },
        mimetype,
        fileName: file.name,
        caption: `🌵 *${file.name}*\n🍜 Tamaño : ${file.size_formatted}`
      },
      { quoted: m }
    )

    m.react('✅')
  } catch (err) {
    m.reply('🍄 Error al descargar: ' + err.message)
  }

  clearTimeout(session.timeout)
  delete conn.terabox[m.sender]
}

handler.command = ['terabox', 'tera', 'tbdl', 'tb']
handler.tags = ['download']
handler.help = ['terabox <url>']

export default handler