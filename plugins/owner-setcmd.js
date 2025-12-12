let handler = async (m, { conn, text, usedPrefix, command }) => {

  global.db.data.sticker = global.db.data.sticker || {};

  if (!m.quoted)
    return conn.reply(m.chat, `${emoji} Responde a un sticker para agregar un comando.`, m);

  if (!m.quoted.fileSha256)
    return conn.reply(m.chat, `${emoji} Responde a un sticker válido.`, m);

  if (!text)
    return conn.reply(m.chat, `${emoji2} Ingresa el nombre del comando.\nEjemplo:\n${usedPrefix}${command} hola`, m);

  try {

    let sticker = global.db.data.sticker;
    let hash = m.quoted.fileSha256.toString('base64');

    // Evita edición si está bloqueado
    if (sticker[hash] && sticker[hash].locked)
      return conn.reply(m.chat, `${emoji2} No tienes permiso para cambiar este comando de sticker.`, m);

    sticker[hash] = {
      text,
      mentionedJid: m.mentionedJid,
      creator: m.sender,
      at: Date.now(),
      locked: false,
    };

    await conn.reply(m.chat, `${emoji} Comando guardado con éxito.`, m);
    await m.react('✅');

  } catch (e) {
    await m.react('✖️');
  }

};

handler.help = ['setcmd <texto>'];
handler.tags = ['owner'];
handler.command = ['setcmd', 'addcmd', 'cmdadd', 'cmdset'];
handler.owner = true;

export default handler;
