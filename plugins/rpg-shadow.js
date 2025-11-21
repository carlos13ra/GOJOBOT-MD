// un codigo bug creado x shadow.xyz jsjsjs 🌾
const handler = async (m, { conn, args, command }) => {
  const senderNumber = m.sender.split('@')[0];

  if (command === 'gay', 'pene') {
    const user = global.db.data.users[m.sender];
    if (!user) global.db.data.users[m.sender] = { lastclaim: 0, coin: 0, exp: 0, joincount: 0 };
    const oneMinuteInMillis = 60000; // 1 minuto
    const now = Date.now();
    const timeRemaining = user.lastclaim + oneMinuteInMillis - now;
    if (timeRemaining > 0) {
      return conn.reply(
        m.chat,
        `🕒 *Ya reclamaste tu recompensa*\n\n⌛ Vuelve en: *${msToTime(timeRemaining)}*`,
        m
      );
    }
    const recompensa = 200000; // 200,000 monedas
    user.coin += recompensa;
    user.exp += recompensa;
    user.joincount += recompensa;
    user.lastclaim = now;
    const senderName = await conn.getName(m.sender);
    const texto = ` 
      ╭━━━〔 🎁 𝐑𝐄𝐂𝐎𝐌𝐏𝐄𝐍𝐒𝐀 💰 〕━━⬣ 
      │ 
      │ 💎 *Usuario:* @${senderNumber} 
      │ 🧸 *Nombre:* ${senderName} 
      │ 
      │ 🌸 *Has recibido:* 
      │ 💵 *${recompensa.toLocaleString()} monedas* 
      │ 🧠 *${recompensa.toLocaleString()} XP* 
      │ 🪙 *${recompensa.toLocaleString()} tokens* 
      │ 
      │ 🕒 Próximo reclamo en 1 minuto. 
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
            thumbnailUrl: 'https:                   
            sourceUrl: 'https://files.catbox.moe/gj468l.jpg',
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

handler.help = ['gay', 'pene']
handler.tags = ['rpg']
handler.command = ['gay', 'pene']
handler.group = true

export default handler

function msToTime(duration) {
  let seconds = Math.floor((duration / 1000) % 60);
  let minutes = Math.floor((duration / (1000 * 60)) % 60);
  let hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
  let days = Math.floor(duration / (1000 * 60 * 60 * 24));
  return `${days > 0 ? days + 'd ' : ''}${hours > 0 ? hours + 'h ' : ''}${
    minutes > 0 ? minutes + 'm ' : ''
  }${seconds}s`;
}
