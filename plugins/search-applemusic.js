import fetch from "node-fetch";

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(
      `👻 Ingresa un nombre de canción o álbum.\n\n🤖 *Ejemplo:*\n> ${usedPrefix + command} Hola`
    );
  }

  try {
    const res = await fetch(
      `https://api-yume.vercel.app/search/applemusic?q=${encodeURIComponent(text)}&limit=5`
    );
    const json = await res.json();

    if (!json.status || !json.results || json.results.length === 0) {
      return m.reply("❌ No se encontraron resultados en Apple Music.");
    }

    const results = json.results;

    let textMsg = `▶️ *Resultados de Apple Music* 🎵\n\n`;

    results.forEach((item, i) => {
      textMsg += `*${i + 1}.*  
> 💫 *Título:* ${item.title}  
> 👤 *Artista:* ${item.artist}  
> 💿 *Álbum:* ${item.album}  
> ⏱️ *Duración:* ${Math.floor(item.duration / 60)}:${String(item.duration % 60).padStart(2, "0")}  
> 🎧 *Género:* ${item.genre}  
> 🔞 *Explícito:* ${item.explicit ? "Sí" : "No"}  
> 🌐 *Apple Music:* ${item.apple_music_url}\n\n`;
    });

    await conn.sendMessage(
      m.chat,
      {
        image: { url: results[0].cover },
        caption: textMsg,
        ...rcanal
      },
      { quoted: m }
    );

  } catch (err) {
    console.error(err);
    m.reply("⚠️ Ocurrió un error al buscar en Apple Music.");
  }
};

handler.help = ["applemusicsearch <canción>"];
handler.tags = ["search"];
handler.command = ["applemusicsearch"];
handler.group = true;

export default handler;