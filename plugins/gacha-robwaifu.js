import { promises as fs } from 'fs';

const charactersFilePath = './lib/characters.json';

async function loadCharacters() {
    const data = await fs.readFile(charactersFilePath, 'utf-8');
    return JSON.parse(data);
}

function flattenCharacters(characters) {
    return Object.values(characters).flatMap(group =>
        Array.isArray(group.characters)? group.characters : []
    );
}

// Verifica que sea el repo oficial de Kaneki Bot
const verifi = async () => {
    try {
        const pkg = await fs.readFile('./package.json', 'utf-8');
        const packageJson = JSON.parse(pkg);
        return packageJson.repository?.url === 'git+https://github.com/Carlos13ra/GOJOBOT-MD.git';
    } catch {
        return false;
    }
};

let handler = async (m, { conn, usedPrefix, command }) => {
    // 1. Solo funciona en Kaneki Bot
    if (!await verifi())
        return conn.reply(m.chat, `❀ El comando *<${command}>* solo está disponible para Kaneki Bot.\n> https://github.com/Carlos13ra/GOJOBOT-MD`, m);

    // 2. Revisa si el gacha está activado en el grupo
    if (!global.db.data.chats?.[m.chat]?.gacha && m.isGroup)
        return m.reply(`ꕥ Los comandos de *Gacha* están desactivados en este grupo.\n\nUn *administrador* puede activarlos con el comando:\n» *${usedPrefix}gacha on*`);

    // Inicializa datos del usuario si no existen
    const user = global.db.data.users[m.sender];
    if (!Array.isArray(user.characters)) user.characters = [];
    if (user.robCooldown == null) user.robCooldown = 0;
    if (!user.robVictims) user.robVictims = {};

    // 3. Cooldown de 8 horas para robar
    const now = Date.now();
    const cooldown = 8 * 60 * 60 * 1000; // 8 horas
    const tiempoRestante = user.robCooldown + cooldown;

    if (user.robCooldown > 0 && now < tiempoRestante) {
        const segundos = Math.ceil((tiempoRestante - now) / 1000);
        const horas = Math.floor(segundos / 3600);
        const minutos = Math.floor(segundos % 3600 / 60);
        const segs = segundos % 60;

        let tiempo = '';
        if (horas > 0) tiempo += `${horas} hora${horas!== 1? 's' : ''} `;
        if (minutos > 0) tiempo += `${minutos} minuto${minutos!== 1? 's' : ''} `;
        if (segs > 0 || tiempo === '') tiempo += `${segs} segundo${segs!== 1? 's' : ''}`;

        return m.reply(`ꕥ Debes esperar *${tiempo.trim()}* para usar *${usedPrefix + command}* de nuevo.`);
    }

    // 4. Obtener víctima citada/mencionada
    const mentioned = await m.mentionedJid;
    const victimJid = mentioned[0] || m.quoted && await m.quoted.sender;

    if (!victimJid || typeof victimJid!== 'string' ||!victimJid.includes('@'))
        return m.reply('❀ Por favor, cita o menciona al usuario a quien quieras robarle una waifu.');

    // 5. No te puedes robar a ti mismo
    if (victimJid === m.sender) {
        let nombre = await (async () =>
            user.name?.trim() ||
            await conn.getName(m.sender).then(n => typeof n === 'string' && n.trim()? n : m.sender.split('@')[0])
           .catch(() => m.sender.split('@')[0])
        )();
        return m.reply(`ꕥ No puedes robarte a ti mismo, *${nombre}*.`);
    }

    // 6. Solo puedes robarle a alguien 1 vez cada 24h
    const ultimoRobo = user.robVictims[victimJid];
    if (ultimoRobo && now - ultimoRobo < 24 * 60 * 60 * 1000) {
        let nombreVictima = await (async () =>
            global.db.data.users[victimJid]?.name?.trim() ||
            await conn.getName(victimJid).then(n => typeof n === 'string' && n.trim()? n : victimJid.split('@')[0])
           .catch(() => victimJid.split('@')[0])
        )();
        return m.reply(`ꕥ Ya robaste a *${nombreVictima}* hoy. Solo puedes robarle a alguien *una vez cada 24 horas*.`);
    }

    const victim = global.db.data.users[victimJid];

    // 7. La víctima debe tener waifus
    if (!victim ||!Array.isArray(victim.characters) || victim.characters.length === 0) {
        let nombreVictima = await (async () =>
            global.db.data.users[victimJid]?.name?.trim() ||
            await conn.getName(victimJid).then(n => typeof n === 'string' && n.trim()? n : victimJid.split('@')[0])
           .catch(() => victimJid.split('@')[0])
        )();
        return m.reply(`ꕥ *${nombreVictima}* no tiene waifus que puedas robar.`);
    }

    // 8. 90% de probabilidad de éxito
    const exito = Math.random() < 0.9;
    user.robCooldown = now;
    user.robVictims[victimJid] = now;

    if (!exito) {
        let nombreVictima = await (async () =>
            global.db.data.users[victimJid]?.name?.trim() ||
            await conn.getName(victimJid).then(n => typeof n === 'string' && n.trim()? n : victimJid.split('@')[0])
           .catch(() => victimJid.split('@')[0])
        )();
        return m.reply(`ꕥ El intento de robo ha fallado. *${nombreVictima}* defendió a su waifu heroicamente.`);
    }

    // 9. Robar waifu al azar
    const waifuId = victim.characters[Math.floor(Math.random() * victim.characters.length)];
    const allCharacters = global.db.data.characters?.[waifuId] || {};
    const nombreWaifu = typeof allCharacters.name === 'string'? allCharacters.name : `ID: ${waifuId}`;

    // Transferir waifu
    allCharacters.user = m.sender;
    victim.characters = victim.characters.filter(id => id!== waifuId);

    if (!user.characters.includes(waifuId)) user.characters.push(waifuId);

    // Limpiar de ventas si estaba ahí
    if (user.sales?.[waifuId]?.user === victimJid) delete user.sales[waifuId];

    // Quitar de favoritos si era la favorita
    if (victim.favorite === waifuId) delete victim.favorite;
    if (global.db.data.users[victimJid]?.favorite === waifuId) delete global.db.data.users[victimJid].favorite;

    let nombreLadron = await (async () =>
        user.name?.trim() ||
        await conn.getName(m.sender).then(n => typeof n === 'string' && n.trim()? n : m.sender.split('@')[0])
       .catch(() => m.sender.split('@')[0])
    )();

    let nombreVictima = await (async () =>
        global.db.data.users[victimJid]?.name?.trim() ||
        await conn.getName(victimJid).then(n => typeof n === 'string' && n.trim()? n : victimJid.split('@')[0])
       .catch(() => victimJid.split('@')[0])
    )();

    await m.reply(`❀ *${nombreLadron}* ha robado a *${nombreWaifu}* del harem de *${nombreVictima}*.`);
};

handler.help = ['robwaifu'];
handler.tags = ['gacha'];
handler.command = ['robwaifu', 'robarwaifu'];
handler.group = true;

export default handler;
