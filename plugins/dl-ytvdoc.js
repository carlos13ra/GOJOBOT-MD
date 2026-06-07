import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix }) => {
	const fancyMode = true // true = letras fancy, false = normal
	
	const fontMap = {
	'a':'ᥲ','b':'ᑲ','c':'ᥴ','d':'ძ','e':'ᥱ','f':'𝖿','g':'g','h':'һ','i':'і','j':'ȷ','k':'k','l':'ᥣ','m':'m','n':'ᥒ','o':'᥆','p':'⍴','q':'𝗊','r':'r','s':'s','t':'𝗍','u':'ᥙ','v':'᥎','w':'ᥕ','x':'᥊','y':'ᥡ','z':'z','1':'1','2':'2','3':'3','4':'4','5':'5','6':'6','7':'7','8':'8','9':'9','0':'0',
	'A':'ᥲ','B':'ᑲ','C':'ᥴ','D':'ძ','E':'ᥱ','F':'𝖿','G':'g','H':'һ','I':'і','J':'ȷ','K':'k','L':'ᥣ','M':'m','N':'ᥒ','O':'᥆','P':'⍴','Q':'𝗊','R':'r','S':'s','T':'𝗍','U':'ᥙ','V':'᥎','W':'ᥕ','X':'᥊','Y':'ᥡ','Z':'z'
	}
	const toFancy = (str) => fancyMode? str.split('').map(c => fontMap[c] || c).join('') : str
	
	const formatDuration = (sec) => {
		const h = Math.floor(sec / 3600)
		const m = Math.floor((sec % 3600) / 60)
		const s = sec % 60
		let str = ''
		if (h > 0) str += `${h} hora${h > 1? 's' : ''}, `
		if (m > 0) str += `${m} minuto${m > 1? 's' : ''}, `
		str += `${s} segundo${s!== 1? 's' : ''}`
		return str
	}
	
	const getFileSize = async (url) => {
		try {
			const head = await fetch(url, { method: "HEAD" })
			const size = head.headers.get("content-length")
			if (!size) return "Desconocido"
			let bytes = Number(size)
			if (bytes >= 1024 * 1024 * 1024) return (bytes / 1024 / 1024 / 1024).toFixed(2) + ' GB'
			return (bytes / 1024 / 1024).toFixed(2) + ' MB'
	} catch {
			return "Desconocido"
	}
	}
	
	if (!text) return conn.reply(m.chat, toFancy(`❀ Manda el link de YouTube\nEj: ${usedPrefix}ytv360 https://youtube.com/shorts/xxx`), m)
	
	const startTime = Date.now()
	await m.react('🕒')
	let msg = await conn.sendMessage(m.chat, { text: toFancy(`乂 YT DOWNLOAD 乂\n✩ Buscando 360p...`) }, { quoted: m })
	
	try {
		const apiUrl = `https://api--shadowcorexyz.replit.app/download/aio/v2?url=${encodeURIComponent(text.trim())}`
		const res = await fetch(apiUrl, { timeout: 15000 })
		const json = await res.json()
		
		if (!json.status ||!json.result?.data?.medias) throw new Error('API sin datos')
		
		const data = json.result.data
		const video360 = data.medias.find(v => v.quality === 'mp4 (360p)' && v.type === 'video')
		
		if (!video360) {
			await conn.sendMessage(m.chat, { delete: msg.key })
			await m.react('✖️')
			return conn.reply(m.chat, toFancy(`⚠︎ No se encontró 360p para este video`), m)
	}
		
		await conn.sendMessage(m.chat, {
			text: toFancy(`\`乂 YOUTUBE - DOWNLOAD 乂\`\n✩ Enviando 360p...\n✩ Título: ${data.title.slice(0, 40)}`),
			edit: msg.key
	})
		
		const sizeReal = await getFileSize(video360.url)
		
		await conn.sendMessage(m.chat, {
			document: { url: video360.url },
			mimetype: 'video/mp4',
			caption: toFancy(`\`乂 YOUTUBE  -  DOWNLOAD 乂\`\n*✩ Título:* ${data.title}\n*✩ Calidad:* 360p\n*✩ Duración:* ${formatDuration(data.duration)}\n*✩ Tamaño:* ${sizeReal}\n✩ By ${json.creator}`),
			fileName: `${data.title.slice(0, 30)}.mp4`
	}, { quoted: m })
		
		const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2)
		await conn.sendMessage(m.chat, {
			text: toFancy(`\`乂 YOUTUBE  -  DOWNLOAD 乂\`\n> ✅ Descarga completa...\n\`🥢 Fetch:\` ${timeTaken} seg\n\`🌵 Calidad:\` 360p\n\`🧊 Tamaño:\` ${sizeReal}\n🌱 Archivo enviado correctamente. `),
			edit: msg.key
	})
		
		await m.react('✔️')
		
	} catch (e) {
		await conn.sendMessage(m.chat, { delete: msg.key })
		await m.react('✖️')
		conn.reply(m.chat, toFancy(`⚠︎ Error: ${e.message}`), m)
	}
}

handler.help = ['ytvdoc <url>']
handler.tags = ['download']
handler.command = ['ytvdoc', 'ytmp4doc']
handler.group = true

export default handler