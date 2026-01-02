import fs from 'fs'

const botFile = './socket.json'

if (!global.botname) {
  if (fs.existsSync(botFile)) {
    try {
      const data = JSON.parse(fs.readFileSync(botFile))
      global.botname = data.botname || 'Bot'
    } catch {
      global.botname = 'Bot'
    }
  } else {
    // Crear carpeta y archivo si no existen
    if (!fs.existsSync('./database')) fs.mkdirSync('./database')
    fs.writeFileSync(botFile, JSON.stringify({ botname: 'Bot' }, null, 2))
    global.botname = 'Bot'
  }
}

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

  fs.writeFileSync(
    botFile,
    JSON.stringify({ botname: newName }, null, 2)
  )

  await m.reply(
    `✅ *Nombre del bot actualizado*\n\n🤖 Nuevo nombre:\n*${global.botname}*`
  )
}

handler.help = ['setname <nombre>']
handler.tags = ['owner']
handler.command = ['setname']
handler.rowner = true

export default handler