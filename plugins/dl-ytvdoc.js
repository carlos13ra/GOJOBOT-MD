import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix }) => {
    if (!text) return m.reply(`Uso: ${usedPrefix}ytvdoc <link youtube>`)

    await m.react('📥')
    let msg = await conn.sendMessage(m.chat, { text: `乂 *Y O U T U B E - D O W N L O A D E R* 乂\n🌵 Buscando video...` }, { quoted: m })

    const getVideo = async (url, retries = 2) => {
        for(let i = 0; i <= retries; i++) {
            try {
                let res = await fetch(`${global.APIs.light.url}/api/play/youtube?q=${encodeURIComponent(url)}&format=mp4`)
                let json = await res.json()
                
                if(!json.status || !json.data) throw new Error('Sin datos')
                if(!json.data.download?.mp4) throw new Error('MP4 null')
                
                return {
                    title: json.data.title,
                    url: json.data.download.mp4,
                    thumb: json.data.thumbnail,
                    channel: json.data.channel,
                    duration: json.data.duration,
                    views: json.data.views
                }
            } catch(e) {
                if(i === retries) throw e
                await new Promise(r => setTimeout(r, 1500))
            }
        }
    }

    try {
        let v = await getVideo(text)
        
        await conn.sendMessage(m.chat, {
            text: `乂 *Y O U T U B E - D O W N L O A D E R* 乂\n🍄 Subiendo: ${v.title.slice(0,35)}...`,
            edit: msg.key
        })

        await conn.sendMessage(m.chat, {
            document: { url: v.url },
            mimetype: 'video/mp4',
            fileName: `${v.title.slice(0, 50)}.mp4`,
            caption: `乂 *Y O U T U B E - D O W N L O A D E R* 乂
 ° *Titulo:* ${v.title}
 ° *Canal:* ${v.channel}
 ° *Duracion:* ${v.duration}
 ° *Vistas:* ${v.views}

🍡 Descarga completa`
        }, { quoted: m })

        await conn.sendMessage(m.chat, { delete: msg.key })
        await m.react('✅')

    } catch (e) {
        await conn.sendMessage(m.chat, { delete: msg.key })
        m.reply(` Error: ${e.message}`)
    }
}

handler.help = ['ytvdoc <url>']
handler.tags = ['downloader']
handler.command = ['ytvdoc', 'ytvd']
handler.limit = true
handler.group = true

export default handler