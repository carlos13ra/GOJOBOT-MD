import fetch from 'node-fetch';

export async function before(m, { conn }) {
  if (!m.text || !global.prefix.test(m.text)) return;

  const usedPrefix = global.prefix.exec(m.text)[0];
  const command = m.text.slice(usedPrefix.length).trim().split(' ')[0].toLowerCase();

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
    `🙃 ¡Vaya! *${command}* no existe.\n🔎 Prueba con *${usedPrefix}menu* para ver todos los comandos.`,
    `🤔 Hmm… *${command}* parece perdido.\n📚 Usa *${usedPrefix}menu* para encontrar lo que buscas.`,
    `🚨 Error: comando *${command}* no reconocido.\n✨ Ve al menú con *${usedPrefix}menu*`,
    `😅 Ups… no conozco *${command}*.\n📌 Explora los comandos con *${usedPrefix}menu*`,
    `🛑 ¡Alerta! *${command}* no está disponible.\n🔧 Ingresa *${usedPrefix}menu* para ver opciones válidas.`,
    `🌟 ¡Hola! No encontré *${command}*.\n📖 Descubre todos los comandos en *${usedPrefix}menu*`,
    `❗ Oops… *${command}* no existe aquí.\n👀 Echa un vistazo al menú: *${usedPrefix}menu*`,
    `💡 Consejo: *${command}* no es un comando válido.\n🎯 Usa *${usedPrefix}menu* para orientarte.`
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
        title: botname,
        body: 'Sistema de comandos',
        thumbnailUrl: banner,
        mediaType: 1,
        renderLargerThumbnail: true
      }
    }
  }, { quoted: m });
}