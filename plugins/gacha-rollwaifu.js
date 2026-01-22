import fetch from 'node-fetch'
import { promises as fs } from 'fs'

const FILE_PATH = './lib/characters.json'

// Función para cargar personajes
async function loadCharacters() {
  try {
    await fs.access(FILE_PATH)
  } catch {
    await fs.writeFile(FILE_PATH, '{}')
  }
  const data = await fs.readFile(FILE_PATH, 'utf-8')
  return JSON.parse(data)
}

// Función para aplanar personajes
function flattenCharacters(data) {
  return Object.values(data).flatMap(v =>
    Array.isArray(v.characters) ? v.characters : []
  )
}

// Función para formatear tag
function formatTag(str) {
  return String(str || '').toLowerCase().trim().replace(/\s+/g, '_')
}

// Función para buscar imágenes
async function buscarImagen(name) {
  const tag = formatTag(name)
  const urls = [
    `https://danbooru.donmai.us/posts.json?tags=${tag}`,
    `https://safebooru.org/index.php?page=dapi&s=post&q=index&json=1&tags=${tag}`
  ]

  for (const url of urls) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
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

// Handler principal
const handler = async (m, { conn, usedPrefix, command }) => {

  if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos')

  const groupId = m.chat
  const userId = m.sender
  const userName = m.pushName || 'Desconocido'

  // ===== INICIALIZAR DB POR GRUPO =====
  if (!global.db.data.characters) global.db.data.characters = {}
  if (!global.db.data.characters[groupId]) global.db.data.characters[groupId] = {}

  // ===== CARGAR PERSONAJES =====
  const data = await loadCharacters()
  const list = flattenCharacters(data)
  if (!list.length) return m.reply('⚠️ No hay personajes disponibles')

  // ===== ELEGIR PERSONAJE ALEATORIO =====
  const char = list[Math.floor(Math.random() * list.length)]
  const characterId = String(char.id)
  const characterName = char.name || 'Sin nombre'

  // ===== BUSCAR IMAGEN =====
  const imgs = await buscarImagen(characterName)
  if (!imgs.length)
    return m.reply(`⚠️ No se encontraron imágenes para *${characterName}*`)
  const image = imgs[Math.floor(Math.random() * imgs.length)]

  // ===== GUARDAR PERSONAJE SOLO EN ESTE GRUPO =====
  if (!global.db.data.characters[groupId][characterId])
    global.db.data.characters[groupId][characterId] = {}

  const charData = global.db.data.characters[groupId][characterId]

  charData.id = characterId
  charData.name = characterName
  charData.reservedBy = userId
  charData.reservedName = userName
  charData.time = Date.now()
  charData.group = groupId

  // ===== MENSAJE DE RECLAMO =====
  const text = `
❀ Nombre » *${characterName}*
♡ Estado » *Reclamado*
✦ Usuario » *${userName}*
`.trim()

  await conn.sendFile(
    m.chat,
    image,
    `${characterName}.jpg`,
    text,
    m
  )
}

// CONFIGURACIÓN DEL HANDLER
handler.help = ['rw']
handler.tags = ['gacha']
handler.command = ['rw']
handler.group = true

export default handler
