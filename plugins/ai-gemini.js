import fetch from "node-fetch"

var shadow = async (m, { text, usedPrefix, command }) => {
    if (!text) return m.reply(`ꕥ *Ingrese su consulta*\n\n*Ejemplo:* ${usedPrefix}${command} ¿Quién es satoru Gojo?`)

    await m.react('💬')

    try {
        const username = await (async () => global.db.data.users[m.sender].name || (async () => { try { const n = await conn.getName(m.sender); return typeof n === 'string' && n.trim() ? n : m.sender.split('@')[0] } catch { return m.sender.split('@')[0] } })())()
        const basePrompt = `Tu nombre es ${botname} y parece haber sido creada por ${etiqueta}. Tu versión actual es ${vs}, Tú usas el idioma Español. Llamarás a las personas por su nombre ${username}, te gusta ser divertida, y te encanta aprender. Lo más importante es que debes ser amigable con la persona con la que estás hablando. ${username}`
        
        const url = `${global.APIs.light.url}/ai/gemini?text=${encodeURIComponent(text)}&prompt=${encodeURIComponent(basePrompt)}`
        
        const res = await fetch(url)
        const json = await res.json()

        if (!json.status || !json.data?.response) {
            return m.reply('Error API')
        }

        await m.reply(json.data.response)
        await m.react('✅')
    } catch (e) {
        console.log(e)
        m.reply('Error')
    }
}

shadow.help = ['gemini']
shadow.tags = ['ia']
shadow.command = ['gemini']

export default shadow