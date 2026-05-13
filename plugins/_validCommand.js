import fetch from 'node-fetch';

export async function before(m, { conn }) {
  if (!m.text ||!global.prefix.test(m.text)) return;

  const usedPrefix = global.prefix.exec(m.text)[0];
  const command = m.text.slice(usedPrefix.length).trim().split(' ')[0].toLowerCase();

  if (!command || command === 'bot') return;

  const isValidCommand = (command, plugins) => {
    for (let plugin of Object.values(plugins)) {
      const cmd = Array.isArray(plugin.command)? plugin.command : [plugin.command];
      if (cmd.includes(command)) return true;
    }
    return false;
  };

  if (isValidCommand(command, global.plugins)) {
    if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = {}
    global.db.data.users[m.sender].commands = (global.db.data.users[m.sender].commands || 0) + 1
    return;
  }

  // Evita el crash si no definiste estas variables
  const newsletterJid = '120363421367237421@newsletter'
  const newsletterName = 'ׄ﹙ׅ🍜﹚ּ 𝐆𝐨𝐣𝐨𝐁𝐨𝐭-𝐌𝐃 › 𝘊𝘩𝘢𝘯𝘦𝘭 𝘰𝘧𝘪𝘤𝘪𝘢𝘭 ᰔᩚ.ᐟ.ᐟ'
  const botname = global.botname || 'GOJOBOT-MD'
  const banner = global.banner || ''

  try {
    await conn.sendMessage(m.chat, {
      text: `🍛 ᴇʟ ᴄᴏᴍᴀɴᴅᴏ *${command}* ɴᴏ ᴇxɪsᴛᴇ.
> 🍜 ᴜsᴀ *${usedPrefix}ʜᴇʟᴘ* ᴘᴀʀᴀ ᴠᴇʀ ʟᴀ ʟɪsᴛᴀ ᴅᴇ ᴄᴏᴍᴀɴᴅᴏs.`,
      mentions: [m.sender],
      contextInfo: {
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: newsletterJid,
          serverMessageId: '',
          newsletterName: newsletterName
        },
        externalAdReply: banner? {
          title: botname,
          body: 'Sistema de comandos',
          thumbnailUrl: banner,
          mediaType: 1,
          renderLargerThumbnail: true
        } : undefined
      }
    }, { quoted: m })
  } catch (e) {
    // Si falla el mensaje con newsletter, manda uno simple
    await conn.sendMessage(m.chat, {
      text: `🍛 ᴇʟ ᴄᴏᴍᴀɴᴅᴏ *${command}* ɴᴏ ᴇxɪsᴛᴇ.\n> 🍜 ᴜsᴀ *${usedPrefix}ʜᴇʟᴘ* ᴘᴀʀᴀ ᴠᴇʀ ʟᴀ ʟɪsᴛᴀ ᴅᴇ ᴄᴏᴍᴀɴᴅᴏs.`
    }, { quoted: m })
  }
          }
