let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`Uso: ${usedPrefix + command} <texto>\n\nEjemplo:\n${usedPrefix + command} Shadow  ->  codifica\n${usedPrefix + command} U2hhZG93  ->  decodifica`)

    try {
        const isBase64 = /^[A-Za-z0-9+/]*={0,2}$/.test(text) && text.length % 4 === 0
        
        if (isBase64) {
            let decoded = Buffer.from(text, 'base64').toString('utf-8')
            m.reply(`*Decodificado:*\n${decoded}`)
        } else {
            let encoded = Buffer.from(text, 'utf-8').toString('base64')
            m.reply(`*Codificado:*\n${encoded}`)
        }
    } catch (e) {
        m.reply('Error xd, texto inválido')
    }
}

handler.help = ['b64 <texto>']
handler.tags = ['tools']
handler.command = ['b64', 'base64']

export default handler