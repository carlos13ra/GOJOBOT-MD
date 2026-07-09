import { WAMessageStubType } from '@whiskeysockets/baileys'
import chalk from 'chalk'
import { watchFile } from 'fs'

const terminalImage = global.opts['img'] ? require('terminal-image') : ''
const urlRegex = (await import('url-regex-safe')).default({ strict: false })

const c = {
  bot: '#00D9FF',
  time: '#FFD166',
  user: '#06FFA5',
  chat: '#B983FF',
  type: '#FF6B6B',
  text: '#EAEAEA',
  cmd: '#FFD166',
  err: '#FF4757',
  border: '#3A3A5A',
  dim: '#5A5A5A',
  size: '#8ECAE6'
}

export default async function (m, conn = { user: {} }) {
  let _name = await conn.getName(m.sender)
  let sender = '+' + m.sender.replace('@s.whatsapp.net', '') + (_name ? ' ~ ' + _name : '')
  let chat = await conn.getName(m.chat)
  let img

  try {
    if (global.opts['img'])
      img = /sticker|image/gi.test(m.mtype) ? await terminalImage.buffer(await m.download()) : false
  } catch (e) {
    console.error(e)
  }

  let filesize = (m.msg ?
    m.msg.vcard ? m.msg.vcard.length :
    m.msg.fileLength ? (m.msg.fileLength.low || m.msg.fileLength) :
    m.msg.axolotlSenderKeyDistributionMessage ? m.msg.axolotlSenderKeyDistributionMessage.length :
    m.text ? m.text.length : 0
    : m.text ? m.text.length : 0) || 0

  let user = global.db.data.users[m.sender]
  let me = '+' + (conn.user?.jid || '').replace('@s.whatsapp.net', '')
  const userName = conn.user.name || conn.user.verifiedName || 'Desconocido'

  if (m.sender === conn.user?.jid) return

  const formatFileSize = (bytes) => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    if (bytes === 0) return '0 B'
    const i = Math.floor(Math.log(bytes) / Math.log(1000))
    return parseFloat((bytes / Math.pow(1000, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const date = new Date(m.messageTimestamp ? 1000 * (m.messageTimestamp.low || m.messageTimestamp) : Date.now())
  const dateFormatted = date.toLocaleDateString('es-ES', { timeZone: 'America/Mexico_City', day: '2-digit', month: 'long', year: 'numeric' })
  const timeFormatted = date.toLocaleTimeString('es-ES', { timeZone: 'America/Mexico_City', hour: '2-digit', minute: '2-digit', second: '2-digit' })

  const messageType = m.mtype ? m.mtype.replace(/message$/i, '').replace('audio', m.msg?.ptt ? 'PTT' : 'audio').replace(/^./, v => v.toUpperCase()) : 'Desconocido'
  const messageSizeFormatted = formatFileSize(filesize)
  const botTag = global.conn.user.jid === conn.user.jid ? chalk.hex(c.bot).bold('★ PRINCIPAL') : chalk.hex(c.dim)('⚙ SUB-BOT')

  const B = chalk.hex(c.border)
  const line = B('│')

  console.log(B(`\n╭──────────────────────────────────────────────╮`))
  console.log(`${line} ${chalk.hex(c.bot).bold(me)} ~ ${chalk.hex(c.text)(userName)} ${botTag}`)
  console.log(`${line} ${chalk.hex(c.time)('🕐 ' + timeFormatted)}  ${chalk.hex(c.dim)(dateFormatted)}`)
  console.log(B('├──────────────────────────────────────────────'))
  console.log(`${line} ${chalk.hex(c.user)('📤 ' + sender)}`)
  console.log(`${line} ${chalk.hex(c.chat)((m.isGroup ? '👥 ' : '💬 ') + (chat || 'Desconocido'))}`)
  console.log(`${line} ${chalk.hex(c.type)('🏷 ' + messageType)}  ${chalk.hex(c.size)(messageSizeFormatted)} ${chalk.hex(c.dim)('(' + filesize + ' bytes)')}`)

  if (typeof m.text === 'string' && m.text) {
    let log = m.text.replace(/\u200e+/g, '')
    const testi = await m.mentionedJid
    if (testi) {
      for (let u of testi)
        log = log.replace('@' + u.split`@`[0], chalk.hex(c.chat)('@' + await conn.getName(u)))
    }
    if (log.length < 1024) {
      log = log.replace(urlRegex, url => chalk.hex(c.user).underline(url))
    }
    console.log(B('├──────────────────────────────────────────────'))
    log.split('\n').forEach(l => {
      console.log(`${line} ${chalk.hex(m.isCommand ? c.cmd : c.text)(l)}`)
    })
  }

  if (m.messageStubType) {
    console.log(B('├──────────────────────────────────────────────'))
    console.log(`${line} ${chalk.hex(c.dim)('stub: ' + WAMessageStubType[m.messageStubType])}`)
  }

  if (/document/i.test(m.mtype)) console.log(`${line} ${chalk.hex(c.type)('📎 ' + (m.msg.fileName || m.msg.displayName || 'Document'))}`)
  else if (/ContactsArray/i.test(m.mtype)) console.log(`${line} ${chalk.hex(c.type)('👥 Contactos múltiples')}`)
  else if (/contact/i.test(m.mtype)) console.log(`${line} ${chalk.hex(c.type)('👤 ' + (m.msg.displayName || 'Contacto'))}`)
  else if (/audio/i.test(m.mtype)) {
    const d = m.msg.seconds
    console.log(`${line} ${chalk.hex(c.type)((m.msg.ptt ? '🎙 PTT ' : '🎵 AUDIO ') + Math.floor(d / 60).toString().padStart(2, '0') + ':' + (d % 60).toString().padStart(2, '0'))}`)
  }

  if (img) console.log(img.trimEnd())

  console.log(B(`╰──────────────────────────────────────────────╯\n`))
}

let file = global.__filename(import.meta.url)
watchFile(file, () => {
  console.log(chalk.hex('#FF006E').bold('🔄 print.js actualizado'))
})