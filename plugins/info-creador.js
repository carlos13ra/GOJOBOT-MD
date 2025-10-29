// by dv.shadow - https://github.com/Yuji-XDev

import { proto } from '@whiskeysockets/baileys';
import PhoneNumber from 'awesome-phonenumber';

const handler = async (m, { conn }) => {
  const name = 'GojoBot - MD | ᥆𝖿𝖿іᥴіᥲᥣ';
  const numCreador = '51900922660';
  const empresa = 'ɢᴏᴊᴏ ʙᴏᴛ ɪɴɪᴄ.';
  const about = '💫 𝑫𝒆𝒔𝒂𝒓𝒓𝒐𝒍𝒍𝒂𝒅𝒐𝒓 𝒐𝒇𝒇𝒊𝒄𝒊𝒂𝒍 𝒅𝒆 𝑮𝒐𝒋𝒐𝑩𝒐𝒕 - 𝑴𝑫';
  const correo = 'carlosramirezvillanueva30@gmail.com';
  const web = 'https://CarlosRv.vercel.app/';
  const direccion = 'Tokyo, Japón 🇯🇵';
  const fotoPerfil = 'https://files.catbox.moe/2vwn2d.jpg';

  const vcard = `
BEGIN:VCARD
VERSION:3.0
N:;${name};;;
FN:${name}
ORG:${empresa}
TITLE:CEO & Fundador
TEL;waid=${numCreador}:${new PhoneNumber('+' + numCreador).getNumber('international')}
EMAIL:${correo}
URL:${web}
NOTE:${about}
ADR:;;${direccion};;;;
X-ABADR:ES
X-WA-BIZ-NAME:${name}
X-WA-BIZ-DESCRIPTION:${about}
END:VCARD`.trim();

  const contactMessage = {
    displayName: name,
    vcard
  };
  m.react('☁️');
  await conn.sendMessage(m.chat, {
    contacts: {
      displayName: name,
      contacts: [contactMessage]
    },
    contextInfo: {
    mentionedJid: [m.sender],
      externalAdReply: {
        title: '📌 ƈσɳƚαƈƚσ ԃҽ ɱι ƈɾҽαԃσɾ •💫',
        body: '',
        mediaType: 1,
        thumbnailUrl: fotoPerfil,
        renderLargerThumbnail: true,
        sourceUrl: web
      }
    }
  }, { quoted: fkontak });
};

handler.help = ['creador'];
handler.tags = ['info'];
handler.command = ['creador', 'creator', 'owner'];
export default handler;