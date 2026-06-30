import fetch from "node-fetch"

var shadow = async (m, { text, usedPrefix, command }) => {
    if (!text) return m.reply(`ꕥ *Ingrese su consulta*\n\n*Ejemplo:* ${usedPrefix}${command} ¿Quién es satoru Gojo?`)

    await m.react('💬')

    try {
        const url = `${global.APIs.light.url}/ai/copilot?text=${encodeURIComponent(text)}&model=default`
        
        const res = await fetch(url)
        const json = await res.json()

        if (!json.status || !json.result) {
            return m.reply('Error API')
        }

        await m.reply(json.result)
        await m.react('✅')
    } catch (e) {
        console.log(e)
        m.reply('Error')
    }
}

shadow.help = ['copilot']
shadow.tags = ['ia']
shadow.command = ['copilot']

export default shadow