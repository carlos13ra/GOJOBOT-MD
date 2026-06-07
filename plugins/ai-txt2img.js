import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix }) => {
	if (!text) return conn.reply(m.chat, `❀ Usa: ${usedPrefix}deepai <prompt>\nEj: ${usedPrefix}deepai waifu anime`, m)
	
	await m.react('🎨')
	let msg = await conn.sendMessage(m.chat, { text: `乂 DEEPAI T2I 乂\n✩ Generando imagen...` }, { quoted: m })
	
	try {
	  const apiUrl = `${global.APIs.light.url}/ai/deepai-Txt2img?prompt=${encodeURIComponent(text.trim())}`
	  const res = await fetch(apiUrl, { timeout: 30000 })
	  const json = await res.json()
		
	  if (!json.status || !json.result?.url) throw new Error('API sin imagen')
      const data = json.result
    const fancy = ['ᥲ','ᑲ','ᥴ','ძ','ᥱ','𝖿','g','һ','і','ȷ','k','ᥣ','m','ᥒ','᥆','⍴','𝗊','r','s','𝗍','ᥙ','᥎','ᥕ','᥊','ᥡ','z','1','2','3','4','5','6','7','8','9','0']
  
    const toFancy = str => str.toLowerCase().split('').map(c => {
      const i = 'abcdefghijklmnopqrstuvwxyz0123456789'.indexOf(c)
      return i !== -1 ? fancy[i] : c
    }).join('')
      
    await conn.sendMessage(m.chat, { 
	  text: toFancy(`乂 DEEPAI T2I 乂\n✩ Render completado\n✩ Model: ${data.model}`), 
	  edit: msg.key 
	})

	await conn.sendMessage(m.chat, { 
	  image: { url: data.url },
  	  caption: toFancy(`乂 DEEPAI T2I 乂\n✩ Model: ${data.model}\n✩ ID: ${data.id}\n✩ Prompt: ${data.prompt}\n\n> ${json.creator}`)
	}, { quoted: m })
	
	await m.react('✔️')
	
	} catch (e) {
	await conn.sendMessage(m.chat, { text: toFancy(`⚠︎ Error: ${e.message}`), edit: msg.key })
	await m.react('✖️')
	}
}

handler.help = ['deepai *« ᴘʀᴏᴍᴘᴛ »*']
handler.tags = ['ai', 'image'] 
handler.command = ['deepai', 'deepai-img', 'txt2img']
handler.group = true

export default handler