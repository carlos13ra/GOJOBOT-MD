import fetch from 'node-fetch';

export async function before(m, { conn }) {
  if (!m.text || !global.prefix.test(m.text)) return;

  const usedPrefix = global.prefix.exec(m.text)[0];
  const command = m.text.slice(usedPrefix.length).trim().split(' ')[0].toLowerCase();

  const thumbRes = await fetch('https://files.catbox.moe/9csrem.jpg');
  const thumbBuffer = await thumbRes.buffer();

  const fkontak = {
    key: {
      participants: '0@s.whatsapp.net',
      remoteJid: 'status@broadcast',
      fromMe: false,
      id: 'GojoBot'
    },
    message: {
      locationMessage: {
        name: botname,
        jpegThumbnail: thumbBuffer
      }
    },
    participant: '0@s.whatsapp.net'
  };

 
  if (!command || command === 'bot') return;

  const isValidCommand = (command, plugins) => {
    for (let plugin of Object.values(plugins)) {
      const cmd = Array.isArray(plugin.command) ? plugin.command : [plugin.command];
      if (cmd.includes(command)) return true;
    }
    return false;
  };

  if (isValidCommand(command, global.plugins)) {
    let user = global.db.data.users[m.sender];
    user.commands = (user.commands || 0) + 1;
    return;
  }

  const mensajes = [
    `❌ *Comando inválido*\n\n🔍 *${command}* no existe\n📖 Usa *${usedPrefix}menu*`,
    `⚠️ *Error*\n\nEl comando *${command}* no está registrado\n✨ Menú: *${usedPrefix}menu*`,
    `🚫 *Comando desconocido*\n\n👉 Ver comandos:\n*${usedPrefix}menu*`,
    `🥭 *Ups…*\n\nNo encontré *${command}*\n📌 Usa *${usedPrefix}menu*`
  ];

  const texto = mensajes[Math.floor(Math.random() * mensajes.length)];

  await conn.sendMessage(m.chat, {
    text: texto,
    mentions: [m.sender],
    contextInfo: {
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: channelRD.id,
        serverMessageId: '',
        newsletterName: channelRD.name
      },
      externalAdReply: {
        title: '🌾 𝗚𝗢𝗝𝗢 𝗕𝗢𝗧 🍃',
        body: 'Sistema de comandos',
        thumbnailUrl: 'https://files.catbox.moe/2tqywz.jpg',
        mediaType: 1,
        renderLargerThumbnail: true
      }
    }
  }, { quoted: fkontak });
}