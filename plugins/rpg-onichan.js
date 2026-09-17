let handler = async (m, { conn }) => {
    let db = global.db.data;
    if (!db) db = global.db.data = { users: {} };
    if (!db.users) db.users = global.db.data.users = {};

    let user = db.users[m.sender];
    if (!user) user = db.users[m.sender] = {};

    let RECOMPENSA_MONEDA = 13000000;
    let RECOMPENSA_XP = 500;
    let TIEMPO_ESPERA = 24 * 60 * 60 * 1000; // 24 horas

    // Nombre dinámico del usuario
    let nombreUsuario = m.name || `@${m.sender.split('@')[0]}`;

    // Número sin cooldown
    let sinCooldown = ['51966453839@s.whatsapp.net'];

    let ahora = Date.now();
    let ultimoUso = user.lastOnichan || 0;

    // Verificar cooldown
    if (!sinCooldown.includes(m.sender) && (ahora - ultimoUso < TIEMPO_ESPERA)) {
        let tiempoRestante = TIEMPO_ESPERA - (ahora - ultimoUso);
        let horas = Math.floor(tiempoRestante / (1000 * 60 * 60));
        let minutos = Math.floor((tiempoRestante / (1000 * 60)) % 60);
        let segundos = Math.floor((tiempoRestante / 1000) % 60);

        return m.reply(
            `🛑 *¡AGUANTA AHÍ, SENPAI!* ✋🛑\n\n` +
            `Ya abusaste mucho del "Oni-chan" por hoy, *${nombreUsuario}*... 😳\n` +
            `Vuelve en *${horas}h ${minutos}m ${segundos}s* antes de que se me suba la presión.`
        );
    }

    // Entrega de economía
    user.goticas = (user.goticas || 0) + RECOMPENSA_MONEDA;
    user.money = (user.money || 0) + RECOMPENSA_MONEDA;
    if (user.coin !== undefined) user.coin += RECOMPENSA_MONEDA;
    if (user.coins !== undefined) user.coins += RECOMPENSA_MONEDA;

    user.exp = (user.exp || 0) + RECOMPENSA_XP;
    if (user.xp !== undefined) user.xp += RECOMPENSA_XP;

    user.lastOnichan = ahora;

    let txt = `🌸 ─────── ≪ • Oni-Chan • ≫ ─────── 🌸\n\n` +
              `😳 *¡AYYY NOOO!* Me dijiste Oni-chan mi femboy *${nombreUsuario}* liko y ya me puse todo tímido... 👉👈✨\n\n` +
              `Toma tu presupuesto diario para tus cosméticos y ropa bonita 💅🏻✨\n\n` +
              `╭━━━ 📑 *[ PACK DE MIMOS ]* ━━━╮\n` +
              `│ 💸 *Góticas:* +${RECOMPENSA_MONEDA.toLocaleString()}\n` +
              `│ ⚡ *Experiencia:* +${RECOMPENSA_XP.toLocaleString()} XP\n` +
              `│ 💖 *Dignidad:* -100%\n` +
              `╰━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
              `👑 *Propietario del Consentimiento:* A𝔫𝔡𝔢𝔯𝔰𝔰𝔬𝔫🌠\n` +
              `✨ ───────────────────────── ✨`;

    // Lista de imágenes
    let imagenes = [
        'https://cdn.phototourl.com/free/2026-08-22-3ad93686-59c5-4eec-b21f-8af2a702f71f.jpg',
        'https://cdn.phototourl.com/free/2026-08-22-d795a04e-6771-456c-a936-1f0b8c423c1f.jpg',
        'https://cdn.phototourl.com/free/2026-08-22-9e259018-4a0e-4ab9-84e9-2eb67aea0749.jpg',
        'https://cdn.phototourl.com/free/2026-08-22-550370db-4734-4af2-bc09-1bfd8e9f4ff1.jpg',
        'https://cdn.phototourl.com/free/2026-08-26-c3ad223d-f1f3-4a37-9dc8-9be006d608be.jpg
    ];

    let imagenUrl = imagenes[Math.floor(Math.random() * imagenes.length)];

    try {
        await conn.sendMessage(m.chat, { 
            image: { url: imagenUrl }, 
            caption: txt,
            mentions: [m.sender]
        }, { quoted: m });
    } catch (e) {
        await conn.reply(m.chat, txt, m, { mentions: [m.sender] });
    }
};

handler.help = ['onichan'];
handler.tags = ['rpg', 'economy'];
handler.command = ['onichan', 'oniichan'];

export default handler;