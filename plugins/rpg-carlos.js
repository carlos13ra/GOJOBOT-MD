import fetch from 'node-fetch';

const handler = async (m, { conn, args, command }) => {
  const senderNumber = m.sender.split('@')[0];

  if (['quieropene'].includes(command)) {
    if (!global.db.data.users[m.sender]) {
      global.db.data.users[m.sender] = { 
        lastclaim: 0,
        coin: 0,
        exp: 0,
        joincount: 0
      };
    }

    const user = global.db.data.users[m.sender];
    const cooldown = 86400000; // 24 horas
    const now = Date.now();
    const timeRemaining = user.lastclaim + cooldown - now;

    if (timeRemaining > 0) {
      return conn.reply(
        m.chat,
        `🕒 *Ya reclamaste tu recompensa*\n\n⌛ Vuelve en: *${msToTime(timeRemaining)}*`,
        m
      );
    }

    // 🔥 NUEVAS RECOMPENSAS
    const rewardCoins = 20000000; // monedas
    const rewardExp = 200;        // experiencia
    const rewardTokens = 4;       // tokens

    user.coin += rewardCoins;
    user.exp += rewardExp;
    user.joincount += rewardTokens;
    user.lastclaim = now;

    const senderName = await conn.getName(m.sender);

    const texto = `
╭━━━〔 🎁 𝐑𝐄𝐂𝐎𝐌𝐏𝐄𝐍𝐒𝐀 💰 〕━━⬣ 
│ 
│ 🗣️ *name:* ${senderName}
│ 
│ 💫 *Has recibido:*
│ 💶 *${rewardCoins.toLocaleString()} Dolares 💶*
│ 🧠 *${rewardExp.toLocaleString()} XP*
│ 🥭 *${rewardTokens.toLocaleString()} Tokens*
|
│ *sabía que te gustaba el pené aver toma el mio*
|
│ 🕒 Próximo reclamo: *24 horas*
│ 
╰━━━〔 💫 𝐆𝐨𝐣𝐨𝐁𝐨𝐭 - 𝐌𝐃 🗿 〕━━⬣
`;

    const thumbBuf = await fetch(banner).then(r => r.buffer())
  const b64 = Buffer.from(thumbBuf).toString('base64')

  await conn.relayMessage(
    m.chat,
    {
      extendedTextMessage: {
        text: redes + texto,
        matchedText: redes,
        description: '🥢 Welcome, to Satoru Gojo.',
        title: botname,
        previewType: 'shadow',
        jpegThumbnail: b64,
        contextInfo: {
          quotedMessage: m.message,
          participant: m.sender,
          stanzaId: m.id,
          remoteJid: m.chat
        }
      }
    },
    { quoted: m }
  );
  }
};

handler.help = ['quieropene'];
handler.tags = ['rpg'];
handler.command = ['quieropene'];
handler.group = true;

export default handler;

function msToTime(duration) {
  let seconds = Math.floor((duration / 1000) % 60);
  let minutes = Math.floor((duration / 60000) % 60);
  let hours = Math.floor((duration / 3600000) % 24);
  let days = Math.floor(duration / 86400000);
  return `${days ? days + 'd ' : ''}${hours ? hours + 'h ' : ''}${minutes ? minutes + 'm ' : ''}${seconds}s`;
}
