import fetch from "node-fetch";

let handler = async (m, { conn, text }) => {
  try {
    if (!text) return m.reply("🌾 Ingresa el nombre del manga que deseas buscar.");

    const res = await fetch(`https://api.delirius.store/search/mangasearch?q=${encodeURIComponent(text)}`);
    const data = await res.json();

    if (!data.status || !data.data || data.data.length === 0) {
      return m.reply("No se encontraron resultados.");
    }

    let response = `🫒 *Resultados de tu búsqueda: "${text}"*\n\n`;

    data.data.forEach((item, index) => {
      response += `*${index + 1}.* ${item.title}\n`;
      response += `  • Tipo : ${item.type}\n`;
      response += `  • Volumenes : ${item.vol}\n`;
      response += `  • Puntuación : ${item.score}\n`;
      response += `  • Enlace : ${item.link}\n\n`;
    });

    const firstImage = data.data[0].image || banner;

    const fakex = {
      contextInfo: {
        externalAdReply: {
          title: `Resultados de "${text}"`,
          body: dev,
          thumbnailUrl: firstImage,
          mediaType: 1,
          renderLargerThumbnail: true,
          sourceUrl: "https://myanimelist.net/"
        }
      }
    };

    await conn.reply(m.chat, response, m, fakex);

  } catch (error) {
    console.log(error);
    m.reply("Ocurrió un error al buscar el manga.");
  }
};

handler.help = ["manga + [nombre]"];
handler.tags = ["tools"];
handler.command = ["manga"];
handler.group = true;

export default handler;