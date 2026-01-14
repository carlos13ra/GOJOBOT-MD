import yts from 'yt-search';
import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    if (!text?.trim())
      return conn.reply(m.chat, `🌱 Ingresa el nombre del video a buscar.\n\n> Ejemplo: ${usedPrefix + command} Rick Astley`, m);

    const search = await yts(text);
    const video = search.videos[0];
    if (!video) return conn.reply(m.chat, '❌ No se encontraron resultados.', m);

    const { title, duration, author, ago, url, views, thumbnail } = video;
    const caption = `*Título:* ${title}\n` +
      `*Duración:* ${duration}\n` +
      `*Canal:* ${author.name}\n` +
      `*Publicado:* ${ago}\n` +
      `*Vistas:* ${views.toLocaleString()}\n` +
      `*Link:* ${url}\n\n🌱 Descargando video...`;

    await conn.sendMessage(m.chat, { image: { url: thumbnail }, caption }, { quoted: m });

    const apiUrl = `https://api.yupra.my.id/api/downloader/ytmp4?url=${encodeURIComponent(url)}`;
    const res = await fetch(apiUrl);
    const data = await res.json();

    if (!data.success) return conn.reply(m.chat, '❌ No se pudo descargar el video.', m);

    const videoUrl = data.data.download_url;
    const safeTitle = title.replace(/[\\/:"*?<>|]/g, '');
    
    const head = await fetch(videoUrl, { method: 'HEAD' });
    const contentLength = head.headers.get('content-length');
    const sizeMB = contentLength ? parseInt(contentLength) / 1024 / 1024 : 0;

    if (sizeMB > 100) {
      // Enviar como documento
      await conn.sendMessage(
        m.chat,
        {
          document: { url: videoUrl },
          mimetype: 'video/mp4',
          fileName: `${safeTitle}.mp4`,
          caption: `💣 *${title}*\n🌿 Video grande (${sizeMB.toFixed(2)} MB) enviado como documento`
        },
        { quoted: m }
      );
    } else {

      await conn.sendMessage(
        m.chat,
        {
          video: { url: videoUrl },
          mimetype: 'video/mp4',
          fileName: `${safeTitle}.mp4`,
          caption: `💣 *${title}*`
        },
        { quoted: m }
      );
    }

  } catch (error) {
    console.error(error);
    conn.reply(m.chat, '⚠️ Ocurrió un error al buscar o descargar el video.', m);
  }
};

handler.help = ['ytmp4 <url>'];
handler.tags = ['download'];
handler.command = ['ytmp4''];

export default handler;