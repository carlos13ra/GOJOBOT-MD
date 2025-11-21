// un codigo bug creado x Carlos Ramírez jsjsjs 🌾
const handler = async (m, { conn, args, command }) => {
  const senderNumber = m.sender.split('@')[0];

  if (command === 'tetas' || command === 'pene') {
    const user = global.db.data.users[m.sender];
    if (!user) global.db.data.users[m.sender] = { lastclaim: 0, coin: 0, exp: 0, joincount: 0 };

    const oneMinuteInMillis = 86400000;
    const now = Date.now();
    const timeRemaining = user.lastclaim + oneMinuteInMillis - now;

    if (timeRemaining > 0) {
      return conn.reply(
        m.chat,
        `🕒 *Ya reclamaste tu recompensa*\n\n⌛ Vuelve en: *${msToTime(timeRemaining)}*`,
        m
      );
    }

    const recompensa = 5000000;
    user.coin += recompensa;
    user.exp += recompensa;
    user.joincount += recompensa;
    user.lastclaim = now;

    const senderName = await conn.getName(m.sender);

    const texto = `
╭━━━〔 🎁 𝐑𝐄𝐂𝐎𝐌𝐏𝐄𝐍𝐒𝐀 💰 〕━━⬣ 
│ 
│ 🗿 *Usuario:* @${senderNumber}
│ 🗣️ *Nombre:* ${senderName}
│ 
│ 💫 *Has recibido:*
│ 💶 *${recompensa.toLocaleString()} Dólares 💶*
│ 🧠 *${recompensa.toLocaleString()} XP*
│ 🥭 *${recompensa.toLocaleString()} tokens*
│ 
│ 🕒 Próximo reclamo en 24 horas.
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
            body: 'Has sido recompensado generosamente!',
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

handler.help = ['tetas', 'pene'];
handler.tags = ['rpg'];
handler.command = ['tetas', 'pene'];
handler.group = true;

export default handler;

function msToTime(duration) {
  let seconds = Math.floor((duration / 1000) % 60);
  let minutes = Math.floor((duration / (1000 * 60)) % 60);
  let hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
  let days = Math.floor(duration / (1000 * 60 * 60 * 24));
  return `${days ? days + 'd ' : ''}${hours ? hours + 'h ' : ''}${minutes ? minutes + 'm ' : ''}${seconds}s`;
}
