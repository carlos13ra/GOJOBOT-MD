let handler = async (m, { conn, command, text }) => {
    if (!m.quoted) return m.reply('💍 *Debes responder el mensaje de la persona con la que quieres casarte*\n\nEjemplo:\nResponde un mensaje y usa:\n*marry*')

    let usuario1 = m.sender
    let usuario2 = m.quoted.sender

    if (usuario1 === usuario2) return m.reply('❌ No puedes casarte contigo mismo.')

    global.db.data.users[usuario1] = global.db.data.users[usuario1] || {}
    global.db.data.users[usuario2] = global.db.data.users[usuario2] || {}

    let user1 = global.db.data.users[usuario1]
    let user2 = global.db.data.users[usuario2]

    switch (command) {

        //------------- 💍 MARRY -----------------
        case 'marry':

            if (user1.partner)
                return m.reply(`❌ Ya estás casado con @${user1.partner.split('@')[0]}`, { mentions: [user1.partner] })

            if (user2.partner)
                return m.reply(`❌ @${m.quoted.sender.split('@')[0]} ya está casado con otra persona.`, { mentions: [usuario2] })

            let name1 = '@' + usuario1.split('@')[0]
            let name2 = '@' + usuario2.split('@')[0]

            let txt = `💍 *Solicitud de Matrimonio*\n\n` +
                `${name1} quiere casarse contigo.\n\n` +
                `Responde este mensaje escribiendo:\n` +
                `✔️ *aceptar*\n` +
                `❌ *rechazar*`

            let ask = await conn.reply(m.chat, txt, m, { mentions: [usuario1, usuario2] })

            conn.marriageRequests = conn.marriageRequests || {}
            conn.marriageRequests[ask.key.id] = {
                from: usuario1,
                to: usuario2
            }

            break

        //------------- 💔 DIVORCE -----------------
        case 'divorce':

            if (!user1.partner)
                return m.reply('❌ No estás casado con nadie.')

            let pareja = user1.partner

            delete user1.partner
            delete global.db.data.users[pareja].partner

            conn.reply(m.chat, `💔 *Divorcio completado*\n\nHas terminado tu relación con @${pareja.split('@')[0]}`, m, {
                mentions: [pareja]
            })
            break
    }
}

// RESPUESTA ACEPTAR / RECHAZAR
handler.before = async (m, { conn }) => {
    if (!conn.marriageRequests) return
    if (!m.quoted) return

    let req = conn.marriageRequests[m.quoted.key?.id]
    if (!req) return

    let { from, to } = req
    if (m.sender !== to) return // Solo responde el destinatario

    if (/aceptar/i.test(m.text)) {
        global.db.data.users[from].partner = to
        global.db.data.users[to].partner = from

        await conn.reply(m.chat, `💍✨ *¡Felicidades!*\n\n@${from.split('@')[0]} y @${to.split('@')[0]} ahora están oficialmente casados ❤️`, m, {
            mentions: [from, to]
        })
    } else if (/rechazar/i.test(m.text)) {
        await conn.reply(m.chat, `❌ @${to.split('@')[0]} ha rechazado la propuesta.`, m, {
            mentions: [to]
        })
    }

    delete conn.marriageRequests[m.quoted.key.id]
}

handler.help = ['marry @usuario', 'divorce']
handler.tags = ['profile']
handler.command = ['marry', 'divorce']

export default handler
