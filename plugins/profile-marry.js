import { promises as fs } from 'fs'

let proposals = {}

const verifi = async () => {
    try {
        const data = await fs.readFile('./package.json', 'utf-8')
        const json = JSON.parse(data)
        return json?.repository?.url === 'git+https://github.com/carlos13ra/GOJOBOT-MD.git'
    } catch {
        return false
    }
}

let handler = async (m, { conn, command }) => {

    if (!await verifi()) 
        return conn.reply(m.chat, '❀ El comando <marry> solo está disponible para Gojo Bot.', m)

    let user = m.sender
    let target = m.quoted ? m.quoted.sender : null

    if (!target)
        return conn.reply(m.chat, '❀ Debes responder un mensaje de la persona para proponer matrimonio.', m)

    if (user === target)
        return conn.reply(m.chat, 'ꕥ No puedes casarte contigo mismo.', m)

    let users = global.db.data.users

    users[user] = users[user] || {}
    users[target] = users[target] || {}

    switch (command) {

        // ============================================
        // 💍 MARRY
        // ============================================
        case "marry":

            if (users[user].marry)
                return conn.reply(m.chat, `ꕥ Ya estás casado/a con *${users[user].marry.split('@')[0]}*`, m)

            if (users[target].marry)
                return conn.reply(m.chat, `ꕥ ${'@' + target.split('@')[0]} ya está casado/a con otra persona.`, m, { mentions: [target] })

            // Registrar propuesta en la tabla
            proposals[target] = user

            // Mensaje de propuesta
            await conn.reply(
                m.chat,
                `ꕥ @${target.split('@')[0]} te ha propuesto matrimonio @${user.split('@')[0]}\n\n` +
                `🌸 *Responde con:*\n` +
                `✔️ *si* para aceptar\n` +
                `❌ *no* para rechazar\n\n` +
                `⏳ La propuesta expira en 2 minutos.`,
                m,
                { mentions: [user, target] }
            )

            // Borrar si expira
            setTimeout(() => {
                if (proposals[target]) delete proposals[target]
            }, 120000)

            break

        // ============================================
        // 💔 DIVORCE
        // ============================================
        case "divorce":

            if (!users[user].marry)
                return conn.reply(m.chat, '✎ Tú no estás casado con nadie.', m)

            let pareja = users[user].marry

            users[user].marry = ''
            users[pareja].marry = ''

            return conn.reply(m.chat, `💔 *Se han divorciado*\n${'@' + user.split('@')[0]} y @${pareja.split('@')[0]} ya no están casados.`, m, {
                mentions: [user, pareja]
            })
    }
}

// ============================================
// RESPUESTAS: ACEPTAR o RECHAZAR
// ============================================

handler.before = async (m, { conn }) => {

    // Solo funciona si responde un mensaje
    if (!m.quoted) return

    let target = m.sender
    let proposing = proposals[target]

    if (!proposing) return

    let respuesta = m.text.trim().toLowerCase()

    // ACEPTA -> "si"
    if (respuesta === "si") {
        global.db.data.users[target].marry = proposing
        global.db.data.users[proposing].marry = target

        await conn.reply(
            m.chat,
            `💍✨ *¡Felicidades!*\n@${proposing.split('@')[0]} y @${target.split('@')[0]} ahora están oficialmente casados. ❤️`,
            m,
            { mentions: [proposing, target] }
        )

        delete proposals[target]
        return
    }

    // RECHAZA -> "no"
    if (respuesta === "no") {
        await conn.reply(
            m.chat,
            `❌ @${target.split('@')[0]} ha rechazado la propuesta.`,
            m,
            { mentions: [target] }
        )

        delete proposals[target]
        return
    }
}

handler.help = ['marry @usuario', 'divorce']
handler.tags = ['profile']
handler.command = ['marry', 'divorce']
handler.group = true

export default handler
