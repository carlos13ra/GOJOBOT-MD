import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix }) => {
	if (!text) return conn.reply(m.chat, `❀ Usa: ${usedPrefix}freegen-image <prompt>\nEj: ${usedPrefix}freegen-image waifu anime`, m)
	
	await m.react('🎨')
	let msg = await conn.sendMessage(m.chat, { text: `乂 FREEGEN IMAGE 乂\n✩ Generando imagen...` }, { quoted: m })
	
	try {
	  const apiUrl = `${global.APIs.light.url}/ai/freegen-image?prompt=${encodeURIComponent(text.trim())}`
	  const res = await fetch(apiUrl, { timeout: 30000 })
	  const json = await res.json()
		
	  if (!json.status || !json.result?.url) throw new Error('API sin imagen')
      const data = json.result
      
    await conn.sendMessage(m.chat, { 
	  text: `乂 FREEGEN IMAGE 乂\n✩ Render completado, Enviando imagen..`, 
	  edit: msg.key 
	})

	await conn.sendMessage(m.chat, { 
	  image: { url: data.url },
  	  caption: `乂 FREEGEN IMAGE 乂\n✩ Prompt: ${data.prompt}\n> ${json.creator}`
	}, { quoted: m })
	
	await m.react('✔️')
	
	} catch (e) {
	await conn.sendMessage(m.chat, { text: `⚠︎ Error: ${e.message}`, edit: msg.key })
	await m.react('✖️')
	}
}

handler.help = ['freegen-image *« ᴘʀᴏᴍᴘᴛ »*']
handler.tags = ['ai', 'image'] 
handler.command = ['freegen-image', 'freegen-img']
handler.group = true

export default handler