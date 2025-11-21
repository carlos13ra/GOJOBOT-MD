// un codigo bug creado x shadow.xyz jsjsjs 🌾
const handler = async (m, { conn, args, command }) => {
  const senderNumber = m.sender.split('@')[0];
  if (command === 'soygay' || command === 'pene') {
    const user = global.db.data.users[m.sender];
    if (!user) global.db.data.users[m.sender] = { lastclaim: 0, coin: 0, exp: 0, joincount: 0 };
    const oneDayInMillis = 86400000; // 24 horas
    const now = Date.now();
    const timeRemaining = user.lastclaim + oneDayInMillis - now;
    if (timeRemaining > 0) {
      return conn.reply(
        m.chat,
        `🕒 *Ya reclamaste tu recompensa*\n\n⌛ Vuelve en: *${msToTime(timeRemaining)}*`,
        m
      );
    }
    const recompensa = 500000; // 500,000 Dolares 💶
    user.coin += recompensa;
    user.exp += recompensa;
    user.joincount += recompensa;
    user.lastclaim = now;
    const senderName = await conn.getName(m.sender);
    const texto = ` 
      ╭━━━〔 🎁 𝐑𝐄𝐂𝐎𝐌𝐏𝐄𝐍𝐒𝐀 💰 〕━━⬣ 
      │ 
      │ 🔥 *Usuario:* ${senderNumber} 
      │ 🗣️ *Nombre:* ${senderName} 
      │ 
      │ 💫 *Has recibido:* 
      │ 💶 *${recompensa.toLocaleString()} monedas* 
      │ 🧠 *${recompensa.toLocaleString()} XP* 
      │ 🗿 *${recompensa.toLocaleString()} tokens* 
      │
      │  QUE GAY SOS CAUSA GAAAA PHEE 
      │
      │ 🕒 Próximo reclamo en 24 horas. 
      │ 
      ╰━━━〔 💫 𝐆𝐨𝐣𝐨𝐁𝐨𝐭 - 𝐌𝐃 💎 〕━━⬣ `;
    await conn.sendMessage(
      m.chat,
      {
        text: texto,
        mentions: [m.sender],
        contextInfo: {
          externalAdReply: {
            title: '🎁 Recompensa de GojoBot',
            body: 'Has sido recompensado generosamente!',
            thumbnailUrl: 'https://files.catbox.moe/2ea57k.jpg',
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

handler.help = ['soygay', 'pene'];
handler.tags = ['rpg'];
handler.command = ['soygay', 'pene'];
handler.group = true;
export default handler;

function msToTime(duration) {
  let seconds = Math.floor((duration / 1000) % 60);
  let minutes = Math.floor((duration / (1000 * 60)) % 60);
  let hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
  let days = Math.floor(duration / (1000 * 60 * 60 * 24));
  return `${days > 0 ? days + 'd ' : ''}${hours > 0 ? hours + 'h ' : ''}${
    minutes > 0 ? minutes + 'm ' : ''
  }${seconds}s`;
}
