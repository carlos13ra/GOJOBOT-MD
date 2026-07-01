let handler = async (m, { conn, text, usedPrefix, command }) => {
    const value = text?.trim();

    if (!value) {
      return m.reply(
        `✐ Debes escribir un nombre corto y un nombre largo valido.\n> Ejemplo: *${usedPrefix + command} Gojo / Satoru Gojo*`
      );
    }

    const formatted = value.replace(/\s*\/\s*/g, '/');
    let [short, long] = formatted.includes('/')
      ? formatted.split('/')
      : [value, value];

    if (!short || !long) {
      return m.reply('✎ Usa el formato: Nombre Corto / Nombre Largo');
    }

    if (/\s/.test(short)) {
      return m.reply('❖ El nombre corto no puede contener espacios.');
    }
    
    global.namebot = short.trim();
    global.botname = long.trim();

    return m.reply(
      `✿ El nombre del bot ha sido actualizado!\n\n❒ Nombre corto: *${short.trim()}*\n❒ Nombre largo: *${long.trim()}*`
    );
}

handler.help = ['setbotname <nombre corto> / <nombre largo>']
handler.tags = ['socket']
handler.command = ['setbotname', 'setname']
handler.owner = true

export default handler
