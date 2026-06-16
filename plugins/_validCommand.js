import fetch from 'node-fetch';

export async function before(m, { conn }) {
  if (!m.text || !global.prefix.test(m.text)) return;

  const usedPrefix = global.prefix.exec(m.text)[0];
  const command = m.text.slice(usedPrefix.length).trim().split(' ')[0].toLowerCase();

  if (!command || command === 'bot') return;

  const isValidCommand = (command, plugins) => {
    for (let plugin of Object.values(plugins)) {
      const cmd = Array.isArray(plugin.command) ? plugin.command : [plugin.command];
      if (cmd.includes(command)) return true;
    }
    return false;
  };

  if (isValidCommand(command, global.plugins)) {
    if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = {}
    global.db.data.users[m.sender].commands = (global.db.data.users[m.sender].commands || 0) + 1
    return;
  }
  
  const thumbBuf = await fetch('https://cdn.phototourl.com/free/2026-06-14-4ceecbcc-c73a-4b5a-b3de-df9123b4f586.jpg').then(r => r.buffer())
  const b64 = Buffer.from(thumbBuf).toString('base64')

  await conn.relayMessage(
    m.chat,
    {
      extendedTextMessage: {
        text: `https://api.gojo.biz.id\nᥱᥣ ᥴ᥆mᥲᥒძ᥆ *${command}*🌵 ᥒ᥆ ᥱ᥊іs𝗍ᥱ <:3\n> 🍜 ᥙsᥲ *${usedPrefix}ʜᴇʟᴘ* ⍴ᥲrᥲ ᥎ᥱr ᥣᥲ ᥣіs𝗍ᥲ ძᥱ ᥴ᥆mᥲᥒძ᥆s.`,
        matchedText: 'https://api.gojo.biz.id',
        description: '🥢 Welcome, to Satoru Gojo.',
        title: botname,
        previewType: 'shadow',
        jpegThumbnail: b64,
        contextInfo: {
          quotedMessage: m.message,
          participant: m.sender,
          stanzaId: m.id,
          remoteJid: m.chat
        }
      }
    },
    { quoted: m }
  )
}