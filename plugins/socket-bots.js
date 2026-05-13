import ws from "ws"

const handler = async (m, { conn, command, usedPrefix, participants }) => {
try {
const users = [global.conn.user.jid,...new Set(global.conns.filter((conn) => conn.user && conn.ws.socket && conn.ws.socket.readyState!== ws.CLOSED).map((conn) => conn.user.jid))]

function convertirMsADiasHorasMinutosSegundos(ms) {
  const segundos = Math.floor(ms / 1000)
  const minutos = Math.floor(segundos / 60)
  const horas = Math.floor(minutos / 60)
  const días = Math.floor(horas / 24)
  const segRest = segundos % 60
  const minRest = minutos % 60
  const horasRest = horas % 24
  let resultado = ""
  if (días) resultado += `${días}d `
  if (horasRest) resultado += `${horasRest}h `
  if (minRest) resultado += `${minRest}m `
  if (segRest) resultado += `${segRest}s`
  return resultado.trim() || '0s'
}

const rcanal = {
  contextInfo: {
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: '120363123456789@g.us', // Cambia por el ID de tu canal
      newsletterName: 'ׄ﹙ׅ🍜﹚ּ 𝐆𝐨𝐣𝐨𝐁𝐨𝐭-𝐌𝐃 › 𝘊𝘩𝘢𝘯𝘯𝘦𝘭 𝘰𝘧𝘪𝘤𝘪𝘢𝘭 ᰔᩚ.ᐟ .ᐟ',
      serverMessageId: -1
    }
  }
}

let groupBots = users.filter((bot) => participants.some((p) => p.id === bot))
if (participants.some((p) => p.id === global.conn.user.jid) &&!groupBots.includes(global.conn.user.jid)) {
  groupBots.push(global.conn.user.jid)
}

const botsGroup = groupBots.length > 0? groupBots.map((bot) => {
  const isMainBot = bot === global.conn.user.jid
  const v = global.conns.find((conn) => conn.user.jid === bot)
  const uptime = isMainBot
   ? convertirMsADiasHorasMinutosSegundos(process.uptime() * 1000)
    : v?.uptime
   ? convertirMsADiasHorasMinutosSegundos(Date.now() - v.uptime)
    : "Activo ahora"

  const mention = bot.split('@')[0]
  return `❀ @${mention}\n> ✿ Tipo: ${isMainBot? 'Principal' : 'Sub-Bot'}\n> ❏ Online: ${uptime}`
}).join("\n\n") : `✧ No hay SubBots activos en este grupo`

const message = ` \`MANGUITO PROGRAMS™ - LISTA DE BOTS\`

 ˗ˏˋ 🍙 ˎˊ˗ Principal: *1*
 ˗ˏˋ 🌾 ˎˊ˗ Subs activos: *${users.length - 1}*
 ˗ˏˋ 🍄 ˎˊ˗ En este grupo: *${groupBots.length}* bots

${botsGroup}

> Usa.vincular para ser SubBot`

const mentionList = groupBots.map(bot => bot.endsWith("@s.whatsapp.net")? bot : `${bot}@s.whatsapp.net`)
rcanal.contextInfo.mentionedJid = mentionList

await conn.sendMessage(m.chat, { text: message,...rcanal }, { quoted: m })
} catch (error) {
console.log(error)
m.reply(`⚠︎ Error en botlist:\n> Usa *${usedPrefix}report* para informarlo.\n\n${error.message}`)
}}

handler.tags = ["serbot"]
handler.help = ["botlist", "listbots"]
handler.command = ["botlist", "listbots", "listbot", "bots", "sockets"]

export default handler
