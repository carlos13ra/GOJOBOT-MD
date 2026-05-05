/*const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw `❀ No se encontró ningún prefijo. Por favor, escribe un prefijo.\n> *Ejemplo: ${usedPrefix + command} !*`;

  global.prefix = new RegExp('^[' + (text || global.opts['prefix'] || '‎xzXZ/i!#$%+£¢€¥^°=¶∆×÷π√✓©®:;?&.\\-').replace(/[|\\{}()[\]^$+*?.\-\^]/g, '\\$&') + ']');

return conn.reply(m.chat, `ꕥ Prefijo actualizado con éxito. Prefijo ➩ ${text}`, m, rcanal)
};

handler.help = ['prefix']
handler.command = ['prefix']
handler.tags = ['owner']
handler.owner = true
export default handler;*/


const handler = async (m, { conn, text, usedPrefix, command }) => {
  const idBot = conn.user.id.split(':')[0] + '@s.whatsapp.net'
  const config = global.db.data.settings[idBot]

  if (!text) {
    const lista = config.prefix === null
      ? '`sin prefijos`'
      : (Array.isArray(config.prefix) ? config.prefix : [config.prefix || '/'])
        .map(p => `\`${p}\``).join(', ')

    return m.reply(`❀ Configuración de prefijo\n\n> *○ Only-Prefix* » ${usedPrefix + command} .\n> *○ Multi-Prefix* » ${usedPrefix + command} !/.#*\n> *○ No-Prefix* » ${usedPrefix + command} noprefix\n> *○ Reset* » ${usedPrefix + command} reset\n\nꕥ Actual: ${lista}`)
  }

  const value = text.trim().toLowerCase()
  const defaultPrefix = ["#", "/", "!", "."]

  if (value === 'reset') {
    config.prefix = defaultPrefix
    return m.reply(`❀ Prefijos restaurados: ${defaultPrefix.join(' ')}`)
  }

  if (value === 'noprefix') {
    config.prefix = true
    return m.reply(`❀ Modo sin prefijo activado`)
  }

  const clean = text.replace(/\s/g, '')
  const list = [...new Set(clean.split(''))].filter(s => /[^\w]/.test(s))

  if (!list.length)
    return m.reply('❀ Debes usar al menos un símbolo válido como prefijo.')

  if (list.length > 6)
    return m.reply('❀ Máximo 6 prefijos.')

  config.prefix = list

  return m.reply(`❀ Prefijo actualizado: ${list.join(' ')}`)
}

handler.help = ['prefix']
handler.command = ['prefix']
handler.tags = ['owner']
handler.owner = true

export default handler