import fetch from 'node-fetch';

let handler = async(m, { conn, usedPrefix, command }) => {
  await m.react('🥵');
  conn.sendMessage(m.chat, { text: 'Padre nuestro, que estás en los Cielos, santificado sea tu nombre, venga tu Reino, hágase tu voluntad así en la tierra como en el cielo. y perdónanos nuestras deudas así como nosotros perdonamos a nuestros deudores, y no nos dejes caer en la tentación, mas líbranos del mal.' });
}

handler.help = ['fototeta'];
handler.tags = ['fun'];
handler.command = ['fototeta', 'ftoteta'];

export default handler;
