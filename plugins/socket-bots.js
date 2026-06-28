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

let groupBots = users.filter((bot) => participants.some((p) => p.id === bot))
if (participants.some((p) => p.id === global.conn.user.jid) && !groupBots.includes(global.conn.user.jid)) { groupBots.push(global.conn.user.jid) }
const botsGroup = groupBots.length > 0 ? groupBots.map((bot) => {
const isMainBot = bot === global.conn.user.jid
const v = global.conns.find((conn) => conn.user.jid === bot)
const uptime = isMainBot ? convertirMsADiasHorasMinutosSegundos(Date.now() - global.conn.uptime) : v?.uptime ? convertirMsADiasHorasMinutosSegundos(Date.now() - v.uptime) : "Activo desde ahora"
const mention = bot.replace(/[^0-9]/g, '')
return `❀ @${mention}
> ✿ Bot: ${isMainBot ? 'Principal' : 'Sub-Bot'}
> ❏ Online: ${uptime}`}).join("\n\n") : `✧ No hay bots activos en este grupo`
const message = ` \`𝙻𝙸𝚂𝚃𝙰 𝙳𝙴 𝙱𝙾𝚃𝚂 𝙰𝙲𝚃𝙸𝚅𝙾𝚂 :\`

 ˗ˏˋ 🍙 ˎˊ˗ Principal: *1*
 ˗ˏˋ 🌾 ˎˊ˗ Subs: *${users.length - 1}*
 ˗ˏˋ 🍄 ˎˊ˗ En este grupo: *${groupBots.length}* bots
 
${botsGroup}

> Usa .code para ser SubBot`
const mentionList = groupBots.map(bot => bot.endsWith("@s.whatsapp.net") ? bot : `${bot}@s.whatsapp.net`)
      const thumbBuf = await fetch(icono).then(r => r.buffer())
     const b64 = Buffer.from(thumbBuf).toString('base64')

     await client.relayMessage(m.chat, {
      extendedTextMessage: {
        text: redes + message,
        matchedText: redes,
        description: dev,
        title: botname,
        previewType: 'PHOTO',
        jpegThumbnail: b64,
        contextInfo: {
          quotedMessage: m.message,
          participant: m.sender,
          stanzaId: m.id,
          remoteJid: m.chat,
          mentionList,
        }
      }
    },
    { quoted: m })
    
    
} catch (error) {
console.log(error)
m.reply(`⚠︎ Error en botlist:\n> Usa *${usedPrefix}report* para informarlo.\n\n${error.message}`)
}}

handler.tags = ["serbot"]
handler.help = ["botlist", "listbots"]
handler.command = ["botlist", "listbots", "listbot", "bots", "sockets"]

export default handler
