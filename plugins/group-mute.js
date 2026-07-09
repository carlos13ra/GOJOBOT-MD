import nodeFetch from 'node-fetch';

const handler = async (message, { conn, command, text, isAdmin, isBotAdmin }) => {
  try {
    // ==========================================
    // COMANDO: MUTE (Muteador)
    // ==========================================
    if (command === 'mute') {
      // Verificar si es admin
      if (!isAdmin) {
        throw '🍬 *Solo un administrador puede ejecutar este comando*';
      }

      const botNumber = global.owner?.[0]?.[0] + '@s.whatsapp.net';
      
      // No permitir muteador al creador del bot
      if (message.mentionedJid?.[0] === botNumber) {
        throw '🍬 *El creador del bot no puede ser mutado*';
      }

      // Obtener JID del usuario
      let targetJid = message.mentionedJid?.[0] 
        ? message.mentionedJid[0] 
        : message.quoted 
        ? message.quoted.sender 
        : text;

      // Validar que no sea el mismo usuario
      if (targetJid === message.sender) {
        throw '🍭 *No puedes mutarte a ti mismo*';
      }

      // Obtener metadata del grupo
      const groupMetadata = await conn.groupMetadata(message.chat);
      const groupAdmin = groupMetadata.owner || message.chat.split('-')[0] + '@s.whatsapp.net';

      // No permitir muteador al admin del grupo
      if (message.mentionedJid?.[0] === groupAdmin) {
        throw '🍭 *No puedes mutar al creador del grupo*';
      }

      // Obtener datos del usuario
      const userData = global.db?.data?.users?.[targetJid];
      
      if (!userData) {
        throw '🍭 *Usuario no encontrado en la base de datos*';
      }

      // Crear mensaje con contexto
      const muteQuote = {
        key: {
          participants: '0@s.whatsapp.net',
          fromMe: false,
          id: 'Halo'
        },
        message: {
          locationMessage: {
            name: '𝗨𝘀𝘂𝗮𝗿𝗶𝗼 𝗺𝘂𝘁𝗮𝗱𝗼',
            jpegThumbnail: await (
              await nodeFetch('https://telegra.ph/file/f8324d9798fa2ed2317bc.png')
            ).buffer(),
            vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;Unlimited;;;\nFN:Unlimited\nORG:Unlimited\nTITLE:\nitem1.TEL;waid=19709001746:+1 (970) 900-1746\nitem1.X-ABLabel:Unlimited\nX-WA-BIZ-DESCRIPTION:ofc\nX-WA-BIZ-NAME:Unlimited\nEND:VCARD`
          }
        },
        participant: '0@s.whatsapp.net'
      };

      const muteMessage = '*Tus mensajes serán eliminados*';

      // Verificar si ya está muteado
      if (userData.mute === true) {
        throw '🍭 *Este usuario ya ha sido mutado*';
      }

      // Enviar confirmación
      await conn.reply(
        message.chat,
        muteMessage,
        muteQuote,
        null,
        { mentions: [targetJid] }
      );

      // Guardar en la base de datos
      global.db.data.users[targetJid].mute = true;

    } 
    // ==========================================
    // COMANDO: UNMUTE (Desmuteador)
    // ==========================================
    else if (command === 'unmute') {
      // Verificar si es admin
      if (!isAdmin) {
        throw '🍬 *Solo un administrador puede ejecutar este comando*';
      }

      // Obtener JID del usuario
      let targetJid = message.mentionedJid?.[0] 
        ? message.mentionedJid[0] 
        : message.quoted 
        ? message.quoted.sender 
        : text;

      // Obtener datos del usuario
      const userData = global.db?.data?.users?.[targetJid];

      // Crear mensaje con contexto
      const unmuteQuote = {
        key: {
          participants: '0@s.whatsapp.net',
          fromMe: false,
          id: 'Halo'
        },
        message: {
          locationMessage: {
            name: '𝗨𝘀𝘂𝗮𝗿𝗶𝗼 𝗱𝗲𝗺𝘂𝘁𝗮𝗱𝗼',
            jpegThumbnail: await (
              await nodeFetch('https://telegra.ph/file/aea704d0b242b8c41bf15.png')
            ).buffer(),
            vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;Unlimited;;;\nFN:Unlimited\nORG:Unlimited\nTITLE:\nitem1.TEL;waid=19709001746:+1 (970) 900-1746\nitem1.X-ABLabel:Unlimited\nX-WA-BIZ-DESCRIPTION:ofc\nX-WA-BIZ-NAME:Unlimited\nEND:VCARD`
          }
        },
        participant: '0@s.whatsapp.net'
      };

      const unmuteMessage = '*Tus mensajes no serán eliminados*';

      // Validaciones
      if (targetJid === message.sender) {
        throw '🍭 *No puedes desmutarte a ti mismo*';
      }

      if (!message.mentionedJid?.[0] && !message.quoted) {
        throw '🍬 *Menciona a la persona que deseas demutar*';
      }

      if (!userData || userData.mute !== true) {
        throw '🍭 *Este usuario no ha sido mutado*';
      }

      // Actualizar estado de mute
      global.db.data.users[targetJid].mute = false;

      // Enviar confirmación
      await conn.reply(
        message.chat,
        unmuteMessage,
        unmuteQuote,
        null,
        { mentions: [targetJid] }
      );
    }

  } catch (error) {
    console.error('Error en comando mute/unmute:', error);
    await conn.reply(message.chat, `❌ Error: ${error}`, message);
  }
};

// ==========================================
// CONFIGURACIÓN DEL HANDLER
// ==========================================

handler.command = ['mute', 'unmute'];
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;
