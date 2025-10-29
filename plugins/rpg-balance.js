let handler = async (m, { conn, usedPrefix }) => {
if (!db.data.chats[m.chat].economy && m.isGroup) {
return m.reply(`《✦》Los comandos de *Economía* están desactivados en este grupo.\n\nUn *administrador* puede activarlos con el comando:\n» *${usedPrefix}economy on*`)
}
let mentionedJid = await m.mentionedJid
let who = mentionedJid[0] ? mentionedJid[0] : m.quoted ? await m.quoted.sender : m.sender
let name = await (async () => global.db.data.users[who].name || (async () => { try { const n = await conn.getName(who); return typeof n === 'string' && n.trim() ? n : who.split('@')[0] } catch { return who.split('@')[0] } })())()
if (!(who in global.db.data.users)) return m.reply(`ꕥ El usuario no se encuentra en mi base de datos.`)
let user = global.db.data.users[who]
let coin = user.coin || 0
let bank = user.bank || 0
let total = (user.coin || 0) + (user.bank || 0)
let level = user.level || 0
let exp = user.exp || 0
const texto = `╭━━━〔 ⚔️ ʀᴘɢ ꜱʏꜱᴛᴇᴍ - ɪɴꜰᴏʀᴍᴀᴄɪᴏ́ɴ ❖ 〕━━⬣
│ ᥫ᭡ 𝐄𝐬𝐭𝐚𝐝𝐨 𝐝𝐞𝐥 𝐀𝐝𝐯𝐞𝐧𝐭𝐮𝐫𝐨
│
│ 🧙‍♂️ Nombre » *${name}*
│ 💰 Cartera » *¥${coin.toLocaleString()} ${currency}*
│ 🏦 Banco » *¥${bank.toLocaleString()} ${currency}*
│ 💎 Total » *¥${total.toLocaleString()} ${currency}*
│ ⚔️ Nivel » *${level}*
│ 📖 Experiencia » *${exp} XP*
╰━━━━━━━━━━━━━━━━━━━━━━━⬣
> *Para proteger tu dinero, ¡depósitalo en el banco usando #deposit!*`
  await conn.sendMessage(m.chat, {
      image: { url: 'https://files.catbox.moe/8xasa6.jpg' },
      caption: texto,
      mentions: [who],
      ...rcanal
 }, { quoted: fkontak })
}

handler.help = ['bal']
handler.tags = ['rpg']
handler.command = ['bal', 'balance', 'bank'] 
handler.group = true 

export default handler