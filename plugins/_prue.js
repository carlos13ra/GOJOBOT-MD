import fs from 'fs'

const botFile = './socket.json'

// CARGAR NOMBRE DESDE JSON (SIEMPRE)
try {
  if (fs.existsSync(botFile)) {
    const data = JSON.parse(fs.readFileSync(botFile))
    if (data.botname) {
      global.botname = data.botname
    }
  } else {
    fs.writeFileSync(botFile, JSON.stringify({}, null, 2))
  }
} catch (e) {
  console.error('Error leyendo socket.json:', e)
}

// COMANDO SETNAME
let handler = async (m, { text, isROwner }) => {
  if (!isROwner) {
    return m.reply('❌ Este comando es solo para el *Owner*')
  }

  if (!text) {
    return m.reply(
      '✏️ Uso correcto:\n\n.setname <nuevo nombre>'
    )
  }

  const newName = text.trim()
  global.botname = newName

  // Leer JSON existente (no borrar otros datos)
  let json = {}
  if (fs.existsSync(botFile)) {
    try {
      json = JSON.parse(fs.readFileSync(botFile))
    } catch {}
  }

  json.botname = newName

  fs.writeFileSync(botFile, JSON.stringify(json, null, 2))

  await m.reply(
    `✅ *Nombre del bot actualizado*\n\n🤖 Nuevo nombre:\n*${global.botname}*`
  )
}

handler.help = ['setname <nombre>']
handler.tags = ['owner']
handler.command = ['setname']
handler.rowner = true

export default handler