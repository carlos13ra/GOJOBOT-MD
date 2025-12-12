import { promises as fs } from "fs"

let proposals = {} // { destinatario: remitente }

// Verificación opcional del bot original
const verifi = async () => {
    try {
        const data = await fs.readFile("./package.json", "utf-8")
        const json = JSON.parse(data)
        return json.repository?.url === "git+https://github.com/carlos13ra/GOJOBOT-MD.git"
    } catch {
        return false
    }
}

let handler = async (m, { conn, command, usedPrefix, args }) => {

    if (!await verifi())
        return conn.reply(m.chat, `❀ El comando *${command}* solo está disponible para Gojo Bot.`, m)

    let sender = m.sender
    let text = (m.text || "").toLowerCase()

    try {

        // =======================================================
        //               RESPUESTA A PROPUESTA (SI/NO)
        // =======================================================

        if (proposals[sender]) {

            let proposer = proposals[sender]   // quien propuso

            if (text === "si") {

                delete proposals[sender]

                global.db.data.users[sender].marry = proposer
                global.db.data.users[proposer].marry = sender

                return conn.reply(
                    m.chat,
                    `✩.･:｡≻──── ⋆♡⋆ ────.•:｡✩
💞 *¡Han aceptado casarse!* 💞

👤 *${global.db.data.users[proposer].name}*
💍
👤 *${global.db.data.users[sender].name}*

Disfruten su luna de miel 💐`,
                    m
                )
            }

            if (text === "no") {

                delete proposals[sender]

                return conn.reply(
                    m.chat,
                    `ꕥ *${global.db.data.users[sender].name}* ha rechazado la propuesta de *${global.db.data.users[proposer].name}*.`,
                    m
                )
            }
        }

        // =======================================================
        //                        MARRY
        // =======================================================

        if (command === "marry") {

            let target =
                m.mentionedJid?.[0] ||
                m.quoted?.sender ||
                null

            if (!target)
                return conn.reply(
                    m.chat,
                    "❀ Debes mencionar o responder a un usuario para casarte.\nEjemplo: *#marry @usuario*",
                    m
                )

            if (target === sender)
                return m.reply("ꕥ No puedes casarte contigo mismo.")

            if (global.db.data.users[sender].marry)
                return conn.reply(
                    m.chat,
                    `ꕥ Ya estás casado/a con *${global.db.data.users[ global.db.data.users[sender].marry ].name}*.`,
                    m
                )

            if (global.db.data.users[target].marry)
                return conn.reply(
                    m.chat,
                    `ꕥ *${global.db.data.users[target].name}* ya está casado/a con *${global.db.data.users[ global.db.data.users[target].marry ].name}*.`,
                    m
                )

            // Si el target te propuso a ti → confirma matrimonio
            if (proposals[target] === sender) {

                delete proposals[target]

                global.db.data.users[sender].marry = target
                global.db.data.users[target].marry = sender

                return conn.reply(
                    m.chat,
                    `✩.･:｡≻──── ⋆♡⋆ ────.•:｡✩
💞 *¡Se han casado!* 💞

👤 *${global.db.data.users[sender].name}*
💍
👤 *${global.db.data.users[target].name}*`,
                    m
                )
            }

            // Crear propuesta nueva
            proposals[target] = sender

            // Expira en 2 minutos
            setTimeout(() => {
                if (proposals[target] === sender)
                    delete proposals[target]
            }, 120000)

            return conn.reply(
                m.chat,
                `♡ *${global.db.data.users[target].name}*, *${global.db.data.users[sender].name}* te ha propuesto matrimonio.

⚘ *Escribe:*
> ➤ *si* — para aceptar  
> ➤ *no* — para rechazar  

La propuesta expira en 2 minutos.`,
                m
            )
        }

        // =======================================================
        //                        DIVORCE
        // =======================================================

        if (command === "divorce") {

            if (!global.db.data.users[sender].marry)
                return m.reply("✎ No estás casado/a con nadie.")

            let partner = global.db.data.users[sender].marry

            global.db.data.users[sender].marry = ""
            global.db.data.users[partner].marry = ""

            return conn.reply(
                m.chat,
                `ꕥ *${global.db.data.users[sender].name}* y *${global.db.data.users[partner].name}* se han divorciado.`,
                m
            )
        }

    } catch (e) {
        return m.reply(`⚠ Error inesperado.\n\n${e}`)
    }
}

// =======================================================
//           LO QUE PEDISTE (HELP, TAGS, COMMAND)
// =======================================================

handler.help = ['marry @usuario', 'divorce']
handler.tags = ['profile']
handler.command = ['marry', 'divorce']
handler.group = true

export default handler
