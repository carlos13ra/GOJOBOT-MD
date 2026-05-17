import ws from 'ws'

const handler = async (m, { conn, command, usedPrefix }) => {
    const subBots = [...new Set([...global.conns.filter((c) => c.user && c.ws?.socket?.readyState === ws.OPEN).map((c) => c.user.jid)])]

    if (global.conn?.user?.jid &&!subBots.includes(global.conn.user.jid)) {
        subBots.push(global.conn.user.jid)
    }

    const chat = global.db.data.chats[m.chat] || {}

    if (command === 'delprimary') {
        if (!chat.primaryBot) return conn.reply(m.chat, `ꕥ No hay Bot primario establecido en este grupo.`, m)
        const old = chat.primaryBot
        delete chat.primaryBot
        return conn.reply(m.chat, `❀ Se eliminó el Bot primario.\n> @${old.split`@`[0]} ya no responde comandos aquí.`, m, { mentions: [old] })
    }

    const mentionedJid = m.mentionedJid[0] || (m.quoted? m.quoted.sender : false)
    if (!mentionedJid) return conn.reply(m.chat, `❀ Menciona al bot que quieres poner como primario.\nEjemplo: *${usedPrefix}setprimary @bot*`, m)
    if (!subBots.includes(mentionedJid)) return conn.reply(m.chat, `ꕥ Ese número no está conectado como sub-bot ahora mismo.`, m)
    if (chat.primaryBot === mentionedJid) {
        return conn.reply(m.chat, `ꕥ @${mentionedJid.split`@`[0]} ya es el Bot primario de este grupo.`, m, { mentions: [mentionedJid] })
    }

    try {
        chat.primaryBot = mentionedJid
        global.db.data.chats[m.chat] = chat
        conn.reply(m.chat, `❀ @${mentionedJid.split`@`[0]} ahora es el Bot primario de este grupo.\n> Solo él ejecutará comandos aquí.`, m, { mentions: [mentionedJid] })
    } catch (e) {
        conn.reply(m.chat, `⚠︎ Error: ${e.message}\n> Usa *${usedPrefix}report* para reportarlo.`, m)
    }
}

handler.help = ['setprimary @bot', 'delprimary']
handler.tags = ['owner', 'group']
handler.command = ['setprimary', 'delprimary']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
