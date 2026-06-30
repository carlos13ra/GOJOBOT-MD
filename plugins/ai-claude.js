import axios from 'axios';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw `Te faltó poner el texto. 🥢\n\n*Ejemplo de uso:*_ ${usedPrefix + command} ¿Cómo estás hoy?`;

    try {
        await m.react('🧠');
        const apiUrl = `${global.APIs.light.url}/ai/claude-haiku?text=${encodeURIComponent(text)}`;
        
        const response = await axios.get(apiUrl);
        const res = response.data;
        if (res.status && res.data) {
            const respuestaAI = res.data.answer;
            
            await conn.sendMessage(m.chat, { text: respuestaAI }, { quoted: m });
            await m.react('✅');
        } else {
            throw 'La API no devolvió el formato esperado. xdf';
        }

    } catch (error) {
        console.error(error);
        await m.react('❌');
        m.reply(`*¡Ups, lo siento ocurrió un puto error xd`);
    }
};

handler.help = ['claude'];
handler.tags = ['ai'];
handler.command = ['claude'];

export default handler;