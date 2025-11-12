import axios from 'axios';
import * as cheerio from 'cheerio';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const args = text.trim().split(/\s+/);
  const subCommand = args[0]?.toLowerCase();

  if (!subCommand || !['search', 'detail', 'read'].includes(subCommand)) {
    return conn.sendMessage(m.chat, {
      text: `📚 *Traveler*, ¡elige el modo que quieres usar! Ejemplo: *${usedPrefix + command} search <título>* → Buscar novela *${usedPrefix + command} detail <url>* → Ver detalle *${usedPrefix + command} read <url>* → Leer capítulo`
    });
  }

  try {
    switch (subCommand) {
      case 'search':
        if (!args[1]) return conn.sendMessage(m.chat, {
          text: `🔍 *Traveler*, ¡ingresa el título de la novela que deseas buscar! Ejemplo: *${usedPrefix + command} search yuusha*`
        });

        const searchResults = await searchNovel(args.slice(1).join(' '));

        if (searchResults.length === 0) {
          return conn.sendMessage(m.chat, {
            text: `🚫 *Traveler*, no se encontraron resultados para "${args.slice(1).join(' ')}" en MeioNovels`
          });
        }

        if (searchResults[0]?.thumb) {
          await conn.sendMessage(m.chat, {
            image: { url: searchResults[0].thumb },
            caption: `🔎 *Resultados de búsqueda para "${args.slice(1).join(' ')}"*:\n\n🔹 1. ${searchResults[0].title}\n🔗 ${searchResults[0].link}\n📅 Actualizado: ${searchResults[0].updateAt}`
          });
        } else {
          await conn.sendMessage(m.chat, {
            text: `🔎 *Resultados de búsqueda para "${args.slice(1).join(' ')}"*:\n\n🔹 1. ${searchResults[0].title}\n🔗 ${searchResults[0].link}\n📅 Actualizado: ${searchResults[0].updateAt}`
          });
        }

        let listCaption = `\n`;
        for (let i = 1; i < searchResults.length && i < 5; i++) {
          listCaption += `🔹 ${i + 1}. ${searchResults[i].title}\n🔗 ${searchResults[i].link}\n📅 Actualizado: ${searchResults[i].updateAt}\n\n`;
        }
        await conn.sendMessage(m.chat, { text: listCaption.trim() });
        break;

      case 'detail':
        if (!args[1]) return conn.sendMessage(m.chat, {
          text: `🔍 *Traveler*, ¡ingresa la URL de la novela para ver detalles! Ejemplo: *${usedPrefix + command} detail https:                                                           
        });

        const detailResult = await detailNovel(args[1]);
        await conn.sendMessage(m.chat, {
          image: { url: detailResult.thumb },
          caption: `//meionovels.com/novel/densetsu-no-yuusha-no-densetsu-ln/ `
        });

        const detailResult = await detailNovel(args[1]);
        await conn.sendMessage(m.chat, {
          image: { url: detailResult.thumb },
          caption: `📖 *Detalles de la novela* 📌 *Título:* ${detailResult.title} 🖋️ *Autor:* ${detailResult.author || 'Desconocido'} 🎨 *Ilustrador:* ${detailResult.artist || 'Desconocido'} 🔖 *Género:* ${detailResult.genre.join(', ') || 'Ninguno'} ⏳ *Estado:* ${detailResult.status || 'Desconocido'} 📅 *Fecha de lanzamiento:* ${detailResult.release || 'Desconocido'} 📝 *Sinopsis:* ${detailResult.sinopsis || 'No disponible'}`
        });
        break;

      case 'read':
        if (!args[1]) return conn.sendMessage(m.chat, {
          text: `📖 *Traveler*, ¡ingresa la URL del capítulo para leer! Ejemplo: *${usedPrefix + command} read https://meionovels.com/novel/densetsu-no-yuusha-no-densetsu-ln/volume-11-chapter-5-tamat/ `
        });

        const readResult = await readChapter(args[1]);
        if (!readResult) {
          return conn.sendMessage(m.chat, {
            text: `🚫 *Traveler*, no se pudo cargar el capítulo desde esa URL`
          });
        }
        await conn.sendMessage(m.chat, {
          text: `📜 *¡Capítulo comenzado!* 🔍 *Fuente:* ${args[1]} 📝 *Contenido del capítulo:* \n${readResult}`
        });
        break;
    }
  } catch (e) {
    console.error('Error:', e.message);
    let errorMsg = `⚠️ *Ups, ocurrió un error, Traveler!* Intenta de nuevo más tarde, esta función está fallando 😅`;
    if (e.message.includes('No results')) {
      errorMsg = `🚫 *Traveler*, no se encontraron resultados.`;
    }
    await conn.sendMessage(m.chat, { text: errorMsg });
  }
};

async function searchNovel(query) {
  try {
    const response = await axios.get(`https://meionovels.com/?s=${encodeURIComponent(query)}&post_type=wp-manga`);
    const $ = cheerio.load(response.data);
    const results = [];

    $('.c-tabs-item__content').each((i, el) => {
      const title = $(el).find('.post-title a').text().trim();
      const link = $(el).find('.post-title a').attr('href');
      const thumb = $(el).find('img').attr('src');
      const updateAt = $(el).find('.post-on .font-meta').text().trim();

      if (title && link && thumb) {
        results.push({ title, link, thumb, updateAt });
      }
    });

    return results;
  } catch (error) {
    throw new Error('Error al buscar novela');
  }
}

async function detailNovel(url) {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const title = $('.post-title h1').text().trim();
    const thumb = $('.summary_image img').attr('src');
    let genre = [];
    let kont = $('.summary-content');
    let author = kont.eq(2).find('a').text().trim();
    let artist = kont.eq(3).find('a').text().trim();
    let release = kont.eq(7).find('a').text().trim();
    let status = kont.eq(8).text().trim();
    let sinopsis = $('.summary__content p').text().trim();

    kont.eq(4).find('a').each((i, el) => {
      genre.push($(el).text().trim());
    });

    return { title, thumb, author, artist, genre, release, status, sinopsis };
  } catch (error) {
    throw new Error('Error al obtener detalles de la novela');
  }
}

async function readChapter(url) {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    let texto = '';
    $('.read-container p').each((i, el) => {
      texto += $(el).text() + '\n';
    });

    if (texto) return texto;
    throw new Error('No se encontró contenido en el capítulo');
  } catch (error) {
    throw new Error('Error al leer el capítulo');
  }
}

handler.help = ['meio <search|detail|read> <consulta/url>'];
handler.tags = ['internet'];
handler.command = /^meio$/i;
handler.register = true;
handler.limit = false;

export default handler;
