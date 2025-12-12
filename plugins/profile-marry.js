import { promises as fs } from 'fs'

let proposals = {} // propuestas pendientes

let handler = async (m, { conn, command, args }) => {
    let user = m.sender
    let users = global.db.data.users

    if (!users[user]) users[user] = {}

    switch (command) {

        //━━━━━━━━ MARRY ━━━━━━━━
        case 'marry': {
            let target =
                m.mentionedJid?.[0] ||
                m.quoted?.sender ||
                null

            if (!target) {
                return conn.reply(
                    m.chat,
                    "❀ Debes mencionar o responder a alguien.\nEjemplo: *#marry @usuario*",
                    m
                )
            }

            if (target === user)
                return conn.reply(m.chat, "ꕥ No puedes casarte contigo mismo.", m)

            if (!users[target]) users[target] = {}

            // Ya está casado el que envía
            if (users[user].marry) {
                return conn.reply(
                    m.chat,
                    `ꕥ Ya estás casado/a con *${users[user].marry}*`,
                    m
                )
            }

            // El objetivo ya está casado
            if (users[target].marry) {
                return conn.reply(
                    m.chat,
                    `ꕥ El usuario ya está casado/a con *${users[target].marry}*`,
                    m
                )
            }

            // Si la otra persona ya propuso
            if (proposals[target] === user) {
                delete proposals[target]
                users[user].marry = target
                users[target].marry = user

                return conn.reply(
                    m.chat,
                    `💍 ¡Felicidades! *${user}* y *${target}* ahora están casados ❤️`,
                    m
                )
            }

            // Crear propuesta
            proposals[user] = target

            // Expira en 2 minutos
            setTimeout(() => {
                if (proposals[user]) delete proposals[user]
            }, 120000)

            return conn.reply(
                m.chat,
                `ꕥ *${user}* te ha propuesto matrimonio.\n\nResponde con: *#marry*\nLa propuesta expira en *2 minutos*.`,
                { mentions: [target] }
            )
        }

        //━━━━━━━━ DIVORCE ━━━━━━━━
        case 'divorce': {
            let couple = users[user].marry

            if (!couple) {
                return conn.reply(m.chat, "✎ Tú no estás casado con nadie.", m)
            }

            users[user].marry = null
            users[couple].marry = null

            return conn.reply(
                m.chat,
                `💔 *${user}* y *${couple}* se han divorciado.`,
                m
            )
        }
    }
}

handler.help = ["marry", "divorce"]
handler.tags = ["fun"]
handler.command = ["marry", "divorce"]
handler.group = true

export default handler
