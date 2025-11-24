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
    const rewardCoins = 6000000; // monedas
    const rewardExp = 100;        // experiencia
    const rewardTokens = 5;       // tokens

    user.coin += rewardCoins;
    user.exp += rewardExp;
    user.joincount += rewardTokens;
    user.lastclaim = now;

    const senderName = await conn.getName(m.sender);

    const texto = `
╭━━━〔 🎁 𝐑𝐄𝐂𝐎𝐌𝐏𝐄𝐍𝐒𝐀 💰 〕━━⬣ 
│ 
│ 🗿 *Usuario:* @${senderNumber}
│ 🗣️ *Nombre:* ${senderName}
│ 
│ 💫 *Has recibido:*
│ 💶 *${rewardCoins.toLocaleString()} Dolares 💶*
│ 🧠 *${rewardExp.toLocaleString()} XP*
│ 🥭 *${rewardTokens.toLocaleString()} Tokens*
│ 
│ 🕒 Próximo reclamo: *24 horas*
│ 
╰━━━〔 💫 𝐆𝐨𝐣𝐨𝐁𝐨𝐭 - 𝐌𝐃 🗿 〕━━⬣
`;

    await conn.sendMessage(
      m.chat,
      {
        text: texto,
        mentions: [m.sender],
        contextInfo: {
          externalAdReply: {
            title: '🎁 Recompensa de GojoBot',
            body: 'Tus recompensas han sido entregadas!',
            thumbnailUrl: 'https://files.catbox.moe/ob2s0m.jpg',
            sourceUrl: 'https://github.com/Carlos13ra',
            mediaType: 1,
            renderLargerThumbnail: true
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
