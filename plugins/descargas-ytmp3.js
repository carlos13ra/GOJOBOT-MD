import yts from 'yt-search';
import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    if (!text?.trim())
      return conn.reply(m.chat, `🌱 Ingresa el nombre del video a buscar.\n\n> Ejemplo: ${usedPrefix + command} Rick Astley`, m);

    const search = await yts(text);
    const video = search.videos[0];
    if (!video) return conn.reply(m.chat, 'No se encontraron resultados.', m);

    const { title, duration, author, ago, url, views, thumbnail } = video;

    const caption = `*Título:* ${title}\n` +
      `*Duración:* ${duration}\n` +
      `*Canal:* ${author.name}\n` +
      `*Publicado:* ${ago}\n` +
      `*Vistas:* ${views.toLocaleString()}\n` +
      `*Link:* ${url}\n\n🌱 Descargando audio...`;

    await conn.sendMessage(m.chat, { image: { url: thumbnail }, caption }, { quoted: m });

    const apiUrl = `https://api.yupra.my.id/api/downloader/ytmp3?url=${encodeURIComponent(url)}`;
    const res = await fetch(apiUrl);
    const data = await res.json();

    if (!data.success) return conn.reply(m.chat, '❌ No se pudo descargar el audio.', m);

    const audioUrl = data.data.download_url;
    await conn.sendMessage(m.chat, { audio: { url: audioUrl }, mimetype: 'audio/mpeg', fileName: `${title}.mp3` }, { quoted: m });

  } catch (error) {
    console.error(error);
    conn.reply(m.chat, '⚠️ Ocurrió un error al buscar o descargar el audio.', m);
  }
};

handler.help = ['ytmp3 <url>'];
handler.tags = ['download'];
handler.command = ['ytmp3'];

export default handler;