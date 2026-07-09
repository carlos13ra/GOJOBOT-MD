import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix }) => {
	if (!text) return conn.reply(m.chat, `❀ Usa: ${usedPrefix}gemini3.1 <tu pregunta>\nEj: ${usedPrefix}gemini3.1 Hola quien eres`, m)
	
	const userId = m.sender
	const userName = m.pushName || 'Usuario'
	
	await m.react('🕒')
	let msg = await conn.sendMessage(m.chat, { text: `乂 GEMINI 3.1 FLASH 乂\n✩ Pensando... ect\n✩ User: ${userName.split(' ')[0]}` }, { quoted: m })
	
	try {
		const apiUrl = `${global.APIs.light.url}/ai/gemini-3.1?text=${encodeURIComponent(text.trim())}`
		const res = await fetch(apiUrl, { timeout: 3000 })
		const json = await res.json()
		
		if (!json.status || !json.data?.answer) throw new Error('API sin respuesta')
		
		const data = json.data
		const chatId = data.id
		if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
		global.db.data.chats[m.chat].lastGemini = {
			chatId: chatId,
			userId: userId,
			userName: userName,
			question: data.question,
			time: Date.now()
	}
		await conn.sendMessage(m.chat, { 
			text: `乂 GEMINI 3.1 FLASH 乂\n✩ Procesando...\n✩ Chat: ${chatId.slice(0, 8)}...\n✩ User: ${userId.split('@')[0]}`, 
			edit: msg.key 
	})

		let respuesta = `乂 GEMINI 3.1 FLASH 乂\n✩ Chat ID: ${chatId}\n\n✩ Pregunta: ${data.question}\n✩ Modelo: ${data.model}\n\n${data.answer}`
		
		await conn.sendMessage(m.chat, { text: respuesta }, { quoted: m })
		await m.react('✔️')
		
	} catch (e) {
		await conn.sendMessage(m.chat, { 
			text: `⚠︎ Error: ${e.message}\n✩ User: ${userId.split('@')[0]}`, 
			edit: msg.key 
	})
		await m.react('✖️')
	}
}

handler.help = ['gemini3.1 <texto>']
handler.tags = ['ai'] 
handler.command = ['gemini3.1', 'gemini3']
handler.group = true

export default handler