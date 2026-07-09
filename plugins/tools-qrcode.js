let handler = async (m, { conn, text, usedPrefix, command }) => {
	if (!text) return conn.reply(m.chat, `ꕥ Ingrese un *texto* o *link* para generar su código *QR*.
☘︎ 𝐄𝐣𝐩𝐥𝐨 »
> » ${usedPrefix + command} satoru Gojo
> » ${usedPrefix + command} https//xxxxx`, m);

conn.sendFile(m.chat, `${global.APIs.light.url}/tools/qr?text=${encodeURIComponent(text)}`, 'qrcode.png', `☁︎ Código *QR* Generado\n> *» Text:* ${text}`,
	m);
};

handler.help = ['qrcode *« Teks »*'];
handler.tags = ['tools'];
handler.command = ['qrcode'];

export default handler;
