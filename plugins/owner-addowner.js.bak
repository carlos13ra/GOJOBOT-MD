const handler = async (m, { conn, command, args }) => {
  let targetJid = null;

  if (m.mentionedJid?.length > 0) {
    targetJid = m.mentionedJid[0];
  }

  else if (m.quoted) {
    targetJid = m.quoted.sender;
  }

  else if (args[0]) {
    const num = args[0].replace(/[^0-9]/g, "");
    if (num) targetJid = num + "@s.whatsapp.net";
  }

  if (!targetJid)
    return conn.reply(
      m.chat,
      `🍜 *Por favo, menciona a un usuario pará agregar o quitar como owner.*`,
      m,
      { quoted: m }
    );

  const number = targetJid.replace(/[^0-9]/g, ""); 
  if (!number)
    return conn.reply(
      m.chat,
      `*No pude obtener un número válido.*`,
      m,
      { quoted: m }
    );


  const who = m.sender;
  const now = new Date().toLocaleString();
  const tagTarget = "@" + number;
  const tagWho = "@" + who.replace(/[^0-9]/g, "");

  if (command === "addowner") {
    if (global.owner.includes(number))
      return conn.reply(
        m.chat,
        `🍃 El usuario ${tagTarget} ya es owner.`,
        m,
        { quoted: m, mentions: [targetJid] }
      );

    global.owner.push(number);

    return conn.reply(
      m.chat,
      `✅ *Nuevo owner agregado:* ✅\n` +
      `> • Usuario: ${tagTarget}\n` +
      `> • Añadido por: ${tagWho}\n` +
      `> • Fecha: ${now}`,
      m,
      {
        quoted: m,
        mentions: [targetJid, who]
      }
    );
  }

  if (command === "delowner") {
    if (!global.owner.includes(number))
      return conn.reply(
        m.chat,
        `🍜 El usuario ${tagTarget} no es owner.`,
        m,
        { quoted: m, mentions: [targetJid] }
      );

    global.owner = global.owner.filter(v => v !== number);

    return conn.reply(
      m.chat,
      `🧊 *Owner eliminado:* 🌱\n` +
      `> • Usuario: ${tagTarget}\n` +
      `> • Removido por: ${tagWho}\n` +
      `> • Fecha: ${now}`,
      m,
      {
        quoted: m,
        mentions: [targetJid, who]
      }
    );
  }
};

handler.help = ["addowner", "delowner"];
handler.tags = ["owner"];
handler.command = ["addowner", "delowner"];
handler.owner = true;
export default handler;