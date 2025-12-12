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
handler.help = ['setcmd']
handler.tags = ['owner']
handler.command = ['setcmd'] 

export default handler
export default handler;
