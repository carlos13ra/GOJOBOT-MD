import speed from 'performance-now'
import os from 'os'
import { exec } from 'child_process'

let handler = async (m, { conn }) => {
  const start = speed()

  exec('neofetch --stdout', async (error, stdout) => {
    let ramTotal = (os.totalmem() / 1024 / 1024).toFixed(0)
    let ramLibre = (os.freemem() / 1024 / 1024).toFixed(0)
    let ramUso = ramTotal - ramLibre
    let uptime = process.uptime()

    const latensi = speed() - start

    let teks = `*'ׄ𐚁ִㅤS T A T U S - PINGׄ ₍ ᐢ..ᐢ ₎'*

*🍄 Bot      : ›* ${botname}
*🌳 Latency : ›* ${latensi.toFixed(3)} ms
*🌱 Uptime  : ›* ${formatTime(uptime)}
*🪷 Sistema  : ›* ${os.platform()} (${os.arch()}) 
*🍙 Node  : ›* ${process.version}
*🌿 Ram usage  : ›* ${ramUso} MB / ${ramTotal} MB`

    conn.reply(m.chat, teks, m, rcanal)
  })
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
