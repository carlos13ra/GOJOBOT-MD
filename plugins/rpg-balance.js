let handler = async (m, { conn, usedPrefix }) => {
if (!db.data.chats[m.chat].economy && m.isGroup) {
return m.reply(`《✦》Los comandos de *Economía* están desactivados en este grupo.\n\nUn *administrador* puede activarlos con el comando:\n» *${usedPrefix}economy on*`)
}
 let videos = [
        'https://files.catbox.moe/vvrxck.mp4',
        'https://files.catbox.moe/c26j4n.mp4',
        'https://files.catbox.moe/fazi1o.mp4',
        'https://files.catbox.moe/bxhw5h.mp4',
        'https://files.catbox.moe/esb1sa.mp4',
        'https://files.catbox.moe/xthtfx.mp4',
        'https://files.catbox.moe/70legl.mp4',
        'https://files.catbox.moe/70legl.mp4',
        'https://files.catbox.moe/prem4p.mp4',
        'https://files.catbox.moe/xthtfx.mp4'
    ]
    let video = videos[Math.floor(Math.random() * videos.length)]
 
let mentionedJid = await m.mentionedJid
let who = mentionedJid[0] ? mentionedJid[0] : m.quoted ? await m.quoted.sender : m.sender
let name = await (async () => global.db.data.users[who].name || (async () => { try { const n = await conn.getName(who); return typeof n === 'string' && n.trim() ? n : who.split('@')[0] } catch { return who.split('@')[0] } })())()
if (!(who in global.db.data.users)) return m.reply(`ꕥ El usuario no se encuentra en mi base de datos.`)
let user = global.db.data.users[who]
let coin = user.coin || 0
let bank = user.bank || 0
let total = (user.coin || 0) + (user.bank || 0)
const texto = `ᥫ᭡ Informacion -  Balance ❀
 
ᰔᩚ Usuario » *${name}*   
⛀ Cartera » *¥${coin.toLocaleString()} ${currency}*
⚿ Banco » *¥${bank.toLocaleString()} ${currency}*
⛁ Total » *¥${total.toLocaleString()} ${currency}*

> *Para proteger tu dinero, ¡depósitalo en el banco usando #deposit!*`
  await m.react('🎃')
await conn.sendMessage(m.chat, { video: { url: video }, caption: menuText, contextInfo: { mentionedJid: [m.sender], isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid: channelRD.id, newsletterName: channelRD.name, serverMessageId: -1, }, forwardingScore: 999, externalAdReply: { title: botname, body: dev, thumbnailUrl: icono, sourceUrl: redes, mediaType: 1, renderLargerThumbnail: false,
}, }, gifPlayback: true, gifAttribution: 0 }, { quoted: null })


handler.help = ['bal']
handler.tags = ['rpg']
handler.command = ['bal', 'balance', 'bank'] 
handler.group = true 

export default handler
