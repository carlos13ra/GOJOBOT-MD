let handler = async (m, { conn, text, usedPrefix, command }) => {
  global.db.data.sticker = global.db.data.sticker || {};

  if (command == 'setcmd') {
    if (!m.quoted || !m.quoted.fileSha256) {
      return m.reply(`Responda a un sticker para agregar un comando.`);
    }

    if (!text) {
      return m.reply(`Ingresa el nombre del comando.`);
    }

    let hash = m.quoted.fileSha256.toString('base64');
    global.db.data.sticker[hash] = text;
    m.reply(`Comando guardado con exito.`);
  } else {
    if (m.quoted && m.quoted.fileSha256) {
      let hash = m.quoted.fileSha256.toString('base64');
      let cmd = global.db.data.sticker[hash];
      if (cmd) {
        conn.emit('message', { ...m, text: `${usedPrefix}${cmd}` });
      }
    }
  }
};

handler.command = /^.*$/;
export default handler;
