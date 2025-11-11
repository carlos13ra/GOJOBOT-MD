/**
 * Módulo para agregar y ejecutar comandos en stickers
 * @author [Tu nombre]
 */

let handler = async (m, { conn, text, usedPrefix, command }) => {
  // Inicializa la base de datos de stickers si no existe
  global.db.data.sticker = global.db.data.sticker || {};

  // Verifica si se está configurando un comando
  if (command === 'setcmd') {
    // Verifica si se ha respondido a un sticker
    if (!m.quoted || !m.quoted.fileSha256) {
      return m.reply(`Responda a un sticker para agregar un comando.`);
    }

    // Verifica si se ha proporcionado un comando
    if (!text) {
      return m.reply(`Ingresa el nombre del comando.`);
    }

    // Obtiene el hash del sticker
    let hash = m.quoted.fileSha256.toString('base64');

    // Guarda el comando en la base de datos
    global.db.data.sticker[hash] = text;

    // Envía un mensaje de confirmación
    m.reply(`Comando guardado con exito.`);
  }
};

// Configura el comando
handler.command = ['setcmd'];
handler.help = ['setcmd <comando>'];
handler.tags = ['sticker'];
handler.owner = true;

export default handler;

// Nuevo handler para ejecutar el comando
let handler2 = async (m, { conn }) => {
  // Verifica si se ha enviado un sticker
  if (m.mtype === 'stickerMessage') {
    // Obtiene el hash del sticker
    let hash = m.fileSha256.toString('base64');

    // Verifica si el sticker tiene un comando asociado
    let cmd = global.db.data.sticker[hash];
    if (cmd) {
      // Ejecuta el comando
      conn.emit('message', { ...m, text: cmd });
    }
  }
};

handler2.command = /^.*$/;
export default handler2;
