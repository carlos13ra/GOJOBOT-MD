let handler = async (m, { conn, text, usedPrefix, command }) => {
  global.db.data.sticker = global.db.data.sticker || {};

  if (!m.quoted || !m.quoted.fileSha256) {
    return m.reply(`🍃 Responda a un sticker para agregar un comando.`);
  }

  if (!text) {
    return m.reply(`🌲 Ingresa el nombre del comando.`);
  }

  try {
    let sticker = global.db.data.sticker;
    let hash = m.quoted.fileSha256.toString('base64');

    if (sticker[hash] && sticker[hash].locked) {
      return m.reply(`🍃 No tienes permiso para cambiar este comando de Sticker.`);
    }

    sticker[hash] = {
      text,
      mentionedJid: m.mentionedJid,
      creator: m.sender,
      at: +new Date(),
      locked: false,
    };

    m.reply(`🍟 Comando guardado con exito.`);
    m.react('✅');
  } catch (e) {
    console.error(e);
    m.react('✖️');
  }
};

handler.help = ['cmd'].map(v => 'set' + v + ' *<texto>*');
handler.tags = ['owner'];
handler.command = ['setcmd', 'addcmd', 'cmdadd', 'cmdset'];
handler.owner = true;

export default handler;
