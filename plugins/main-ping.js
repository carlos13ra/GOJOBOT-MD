import speed from 'performance-now'
import os from 'os'

let handler = async (m, { conn }) => {
  const start = Date.now()

  const fakePaymentQuote = {
    key: {
      participant: m.sender,
      remoteJid: m.chat,
      fromMe: false,
      id: 'PAYQUOTE'
    },
    message: {
      requestPaymentMessage: {
        currencyCodeIso4217: 'USD',
        amount1000: 1000000000,
        requestFrom: m.sender,
        noteMessage: {
          extendedTextMessage: {
            text: global.botname || ''
          }
        },
        expiryTimestamp: Math.floor(Date.now() / 1000) + 86400,
        amount: {
          value: 1000000000,
          offset: 1000,
          currencyCode: 'USD'
        }
      }
    },
    participant: m.sender
  }

  await conn.reply(m.chat, '`🌱 ¡Pong!`', m)

  const latensi = Date.now() - start

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

  *｡ speed :* ${latensi} ms (${pingEmoji})
  *｡ Runtime :* ${formatTime(uptime)}
  *｡ Plataforma :* ${os.platform()} (${os.arch()})
  *｡ Node v :* ${process.version}
  *｡ Ram :* ${ramUso} MB / ${ramTotal} MB

${dev}`

  await conn.reply(m.chat, teks, fakePaymentQuote)
}

handler.help = ['ping']
handler.tags = ['info']
handler.command = ['ping', 'p']

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