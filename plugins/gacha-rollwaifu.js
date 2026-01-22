import fetch from 'node-fetch'
import { promises as fs } from 'fs'

const FILE_PATH = './lib/characters.json'

async function loadCharacters () {
  try {
    await fs.access(FILE_PATH)
  } catch {
    await fs.writeFile(FILE_PATH, '{}')
  }
  const data = await fs.readFile(FILE_PATH, 'utf-8')
  return JSON.parse(data)
}

function flattenCharacters (data) {
  return Object.values(data).flatMap(v =>
    Array.isArray(v.characters) ? v.characters : []
  )
}

function formatTag (str) {
  return String(str || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_')
}

async function buscarImagen (name) {
  const tag = formatTag(name)
  const urls = [
    `https://danbooru.donmai.us/posts.json?tags=${tag}`,
    `https://safebooru.org/index.php?page=dapi&s=post&q=index&json=1&tags=${tag}`
  ]

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      })
      if (!res.ok) continue
      const json = await res.json()
      const arr = Array.isArray(json) ? json : json.posts || []
      const imgs = arr
        .map(v => v.file_url || v.large_file_url)
        .filter(v => typeof v === 'string' && /\.(jpg|png)$/i.test(v))
      if (imgs.length) return imgs
    } catch {}
  }
  return []
}

const handler = async (m, { conn, usedPrefix, command }) => {
  if (!m.isGroup)
    return m.reply('❌ Este comando solo funciona en grupos')

  const groupId = m.chat
  const userId = m.sender

  // ===== INICIALIZAR DB =====
  if (!global.db.data.characters)
    global.db.data.characters = {}

  if (!global.db.data.characters[groupId])
    global.db.data.characters[groupId] = {}

  if (!global.db.data.users[userId])
    global.db.data.users[userId] = {}

  // ===== CARGAR PERSONAJES =====
  const data = await loadCharacters()
  const list = flattenCharacters(data)
  if (!list.length)
    return m.reply('⚠️ No hay personajes disponibles')

  const char = list[Math.floor(Math.random() * list.length)]
  const charId = String(char.id)
  const charName = char.name || 'Sin nombre'

  // ===== IMAGEN =====
  const imgs = await buscarImagen(charName)
  if (!imgs.length)
    return m.reply(`⚠️ No se encontraron imágenes para *${charName}*`)

  const image = imgs[Math.floor(Math.random() * imgs.length)]

  // ===== DATOS DEL PERSONAJE (POR GRUPO) =====
  if (!global.db.data.characters[groupId][charId])
    global.db.data.characters[groupId][charId] = {}

  const charData = global.db.data.characters[groupId][charId]

  charData.id = charId
  charData.name = charName
  charData.reservedBy = userId
  charData.group = groupId
  charData.time = Date.now()

  // ===== RESPUESTA =====
  const text = `
❀ Nombre » *${charName}*
♡ Estado » *Reclamado*
✦ Grupo » *Este grupo*
`.trim()

  await conn.sendFile(
    m.chat,
    image,
    `${charName}.jpg`,
    text,
    m
  )
}

handler.help = ['rw']
handler.tags = ['gacha']
handler.command = ['rw']
handler.group = true

export default handler
