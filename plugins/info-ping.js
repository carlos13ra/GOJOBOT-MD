import speed from 'performance-now'
import os from 'os'

let handler = async (m, { conn }) => {
  const start = speed()
  await new Promise(res => setTimeout(res, 1))

  const latensi = speed() - start

  let ramTotal = (os.totalmem() / 1024 / 1024).toFixed(0)
  let ramLibre = (os.freemem() / 1024 / 1024).toFixed(0)
  let ramUso = ramTotal - ramLibre

  let uptime = process.uptime()

  let pingEmoji =
    latensi < 50 ? '🟢 Excelente' :
    latensi < 120 ? '🟡 Bueno' :
    latensi < 200 ? '🟠 Medio' :
    '🔴 Lento'

  let teks = `*'ׄ𐚁ִㅤS T A T U S - P I N Gׄ ₍ ᐢ..ᐢ ₎'*

*🍄 Bot       : ›* ${botname}
*🌳 Latency   : ›* ${latensi.toFixed(2)} ms (${pingEmoji})
*🌱 Uptime    : ›* ${formatTime(uptime)}
*🪷 Sistema   : ›* ${os.platform()} (${os.arch()})
*🍙 Node      : ›* ${process.version}
*🌿 RAM       : ›* ${ramUso} MB / ${ramTotal} MB`

  await conn.reply(m.chat, teks, m, rcanal)
}

handler.help = ['ping']
handler.tags = ['info']
handler.command = ['ping', 'p']
handler.register = true

export default handler

function formatTime(seconds) {
  seconds = Number(seconds)
  let d = Math.floor(seconds / (3600 * 24))
  let h = Math.floor(seconds % (3600 * 24) / 3600)
  let m = Math.floor(seconds % 3600 / 60)
  let s = Math.floor(seconds % 60)

  return [
    d ? `${d}d` : '',
    h ? `${h}h` : '',
    m ? `${m}m` : '',
    s ? `${s}s` : ''
  ].filter(Boolean).join(' ')
}