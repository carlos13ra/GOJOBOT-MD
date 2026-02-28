import { WAMessageStubType } from '@whiskeysockets/baileys'
import chalk from 'chalk'
import { watchFile } from 'fs'

const terminalImage = global.opts['img'] ? require('terminal-image') : ''
const urlRegex = (await import('url-regex-safe')).default({ strict: false })

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
    m.msg.vcard ?
      m.msg.vcard.length :
      m.msg.fileLength ?
        m.msg.fileLength.low || m.msg.fileLength :
        m.msg.axolotlSenderKeyDistributionMessage ?
          m.msg.axolotlSenderKeyDistributionMessage.length :
          m.text ?
            m.text.length :
            0
    : m.text ? m.text.length : 0) || 0

  let user = global.db.data.users[m.sender]
  let chatName = chat ? (m.isGroup ? 'Grupo ~ ' + chat : 'Privado ~ ' + chat) : ''
  let me = '+' + (conn.user?.jid || '').replace('@s.whatsapp.net', '')
  const userName = conn.user.name || conn.user.verifiedName || "Desconocido"
  
  if (m.sender === conn.user?.jid) return
  const colors = {
    primary: '#FF006E',
    secondary: '#8338EC',
    success: '#3A86FF',
    warning: '#FFBE0B',
    info: '#FB5607',
    text: '#FFFFFF',
    border: '#6A4C93'
  }

  // Función para obtener emoji según tipo de mensaje
  const getMessageEmoji = (mtype) => {
    const emojiMap = {
      'text': '💬',
      'image': '🖼️',
      'video': '🎥',
      'audio': '🎵',
      'document': '📄',
      'sticker': '🏷️',
      'contact': '👤',
      'location': '📍',
      'group_invite': '📲',
      'call': '📞'
    }
    return emojiMap[mtype] || '📨'
  }

  const formatFileSize = (bytes) => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    if (bytes === 0) return '0 B'
    const i = Math.floor(Math.log(bytes) / Math.log(1000))
    return parseFloat((bytes / Math.pow(1000, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFormattedTime = (timestamp) => {
    const date = new Date(timestamp ? 1000 * (timestamp.low || timestamp) : Date.now())
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    const seconds = date.getSeconds().toString().padStart(2, '0')
    return `${hours}:${minutes}:${seconds}`
  }

  console.log(chalk.hex(colors.primary).bold(`
╔════════════════════════════════════════════════════╗
║                  🤖 BOT LOG REPORT 🤖                ║
╚════════════════════════════════════════════════════╝`))

  console.log(`
${chalk.hex(colors.secondary).bold('┌─ BOT INFORMATION')}
${chalk.hex(colors.border).bold('│')} ${chalk.hex(colors.success).bold('📍 Bot:')} ${chalk.hex(colors.warning)(me)} ~ ${chalk.hex(colors.info)(userName)} ${global.conn.user.jid === conn.user.jid ? chalk.hex(colors.success).bold('⭐ PRINCIPAL') : chalk.hex(colors.warning).bold('⚙️ SUB-BOT')}
${chalk.hex(colors.border).bold('└')}`)

  // Información temporal
  const date = new Date(m.messageTimestamp ? 1000 * (m.messageTimestamp.low || m.messageTimestamp) : Date.now())
  const dateFormatted = date.toLocaleDateString("es-ES", { timeZone: "America/Mexico_City", day: '2-digit', month: 'long', year: 'numeric' })
  const timeFormatted = getFormattedTime(m.messageTimestamp)

  console.log(`
${chalk.hex(colors.secondary).bold('┌─ TIME & DATE')}
${chalk.hex(colors.border).bold('│')} 📅 ${chalk.hex(colors.info)(dateFormatted)}
${chalk.hex(colors.border).bold('│')} 🕐 ${chalk.hex(colors.warning)(timeFormatted)}
${chalk.hex(colors.border).bold('└')}`)

  // Información del remitente y chat
  console.log(`
${chalk.hex(colors.secondary).bold('┌─ MESSAGE INFO')}
${chalk.hex(colors.border).bold('│')} ${chalk.hex(colors.success)('📤 Remitente:')} ${chalk.hex(colors.warning)(sender)}
${chalk.hex(colors.border).bold('│')} ${chalk.hex(colors.success)('💬 Chat ' + (m.isGroup ? 'Grupal' : 'Privado') + ':')} ${chalk.hex(colors.warning)(chat || 'Desconocido')}
${chalk.hex(colors.border).bold('│')} ${chalk.hex(colors.success)('🏷️ Tipo de evento:')} ${chalk.hex(colors.info)(m.messageStubType ? WAMessageStubType[m.messageStubType] : 'Mensaje Normal')}
${chalk.hex(colors.border).bold('└')}`)

  const messageType = m.mtype ? m.mtype.replace(/message$/i, '').replace('audio', m.msg?.ptt ? 'PTT' : 'audio').replace(/^./, v => v.toUpperCase()) : 'Desconocido'
  const messageSizeFormatted = formatFileSize(filesize)

  console.log(`
${chalk.hex(colors.secondary).bold('┌─ MESSAGE DETAILS')}
${chalk.hex(colors.border).bold('│')} ${getMessageEmoji(m.mtype)} ${chalk.hex(colors.success)('Tipo:')} ${chalk.hex(colors.info)(messageType)}
${chalk.hex(colors.border).bold('│')} 📊 ${chalk.hex(colors.success)('Peso:')} ${chalk.hex(colors.warning)(messageSizeFormatted)} ${chalk.gray(`(${filesize} bytes`)}
${chalk.hex(colors.border).bold('└')}`)

  // Procesar texto del mensaje
  if (typeof m.text === 'string' && m.text) {
    let log = m.text.replace(/\u200e+/g, '')
    let mdRegex = /(?<=(?:^|[\s\n])\S?)(?:([*_~`])(?!`)(.+?)\1|```((?:.|[\n\r])+?)```|`([^`]+?)`)(?=\S?(?:[\s\n]|$))/g
    
    let mdFormat = (depth = 4) => (_, type, text, monospace) => {
      let types = {
        '_': 'italic',
        '*': 'bold',
        '~': 'strikethrough',
        '`': 'bgGray'
      }
      text = text || monospace
      let formatted = !types[type] || depth < 1 ? text : chalk[types[type]](text.replace(/`/g, '').replace(mdRegex, mdFormat(depth - 1)))
      return formatted
    }
    
    log = log.replace(mdRegex, mdFormat(4))
    log = log.split('\n').map(line => {
      if (line.trim().startsWith('>')) {
        return chalk.hex(colors.border).bgGray.dim(line.replace(/^>/, '┃'))
      } else if (/^([1-9]|[1-9][0-9])\./.test(line.trim())) {
        return line.replace(/^(\d+)\./, (match, number) => {
          const padding = number.length === 1 ? '  ' : ' '
          return chalk.hex(colors.info)(padding + number + '.') + ' '
        })
      } else if (/^[-*]\s/.test(line.trim())) {
        return line.replace(/^[*-]/, chalk.hex(colors.success)('  •'))
      }
      return line
    }).join('\n')
    
    if (log.length < 1024)
      log = log.replace(urlRegex, (url, i, text) => {
        let end = url.length + i
        return i === 0 || end === text.length || (/^\s$/.test(text[end]) && /^\s$/.test(text[i - 1])) ? chalk.hex(colors.success).underline(url) : url
      })
    
    log = log.replace(mdRegex, mdFormat(4))
    
    const testi = await m.mentionedJid
    if (testi) {
      for (let user of testi)
        log = log.replace('@' + user.split`@`[0], chalk.hex(colors.info)('@' + await conn.getName(user)))
    }
    
    console.log(`
${chalk.hex(colors.secondary).bold('┌─ MESSAGE TEXT')}
${chalk.hex(colors.border).bold('│')} ${m.error != null ? chalk.hex(colors.primary)(log) : m.isCommand ? chalk.hex(colors.warning)(log) : chalk.hex(colors.text)(log)}
${chalk.hex(colors.border).bold('└')}`)
  }
  
  if (m.messageStubParameters) {
    console.log(`
${chalk.hex(colors.secondary).bold('┌─ STUB PARAMETERS')}
${chalk.hex(colors.border).bold('│')} ${m.messageStubParameters.map(jid => {
      jid = conn.decodeJid(jid)
      let name = conn.getName(jid)
      return chalk.gray('+' + jid.replace('@s.whatsapp.net', '') + (name ? ' ~' + name : ''))
    }).join(', ')}
${chalk.hex(colors.border).bold('└')}`)
  }

  if (/document/i.test(m.mtype)) console.log(`\n📎 ${chalk.hex(colors.info)(m.msg.fileName || m.msg.displayName || 'Document')}`)
  else if (/ContactsArray/i.test(m.mtype)) console.log(`\n👥 ${chalk.hex(colors.info)('Contactos Múltiples')}`)
  else if (/contact/i.test(m.mtype)) console.log(`\n👤 ${chalk.hex(colors.info)(m.msg.displayName || 'Contacto')}`)
  else if (/audio/i.test(m.mtype)) {
    const duration = m.msg.seconds
    console.log(`\n${m.msg.ptt ? '☄️' : '🎵'} ${chalk.hex(colors.warning)('(' + (m.msg.ptt ? 'PTT ' : '') + 'AUDIO')} ${chalk.hex(colors.info)(Math.floor(duration / 60).toString().padStart(2, 0) + ':' + (duration % 60).toString().padStart(2, 0))}${chalk.hex(colors.warning)(')')}`)
  }

  if (img) console.log(img.trimEnd())
  
  console.log(`\n${chalk.hex(colors.primary).bold('════════════════════════════════════════════════════\n')}`)
}

let file = global.__filename(import.meta.url)
watchFile(file, () => {
  console.log(chalk.hex('#FF006E').bold.bgHex('#1a1a2e')('🔄 Update lib/print.js detectado'))
})