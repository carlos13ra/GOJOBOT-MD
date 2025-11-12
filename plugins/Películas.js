const axios = require("axios");
const TMDB_KEY = "d337714ae1fe5cc5aeb43cebcd8db834"; // 🔑 Tu API Key
const BASE = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p/w500";
const COUNTRY = "PE"; // 🇵🇪 cambia si quieres otro país (MX, ES, AR, etc.)

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text)
    return conn.reply(
      m.chat,
      `✨ Uso correcto:\n${usedPrefix + command} <nombre de película o serie>`,
      m
    );

  // 💬 Reacción inicial al mensaje
  await conn.sendReact(m.chat, '🔍', m.key);
  await conn.reply(m.chat, `🔎 Buscando *${text}*...`, m);

  try {
    // 🔍 Buscar en TMDb
    const searchUrl = `${BASE}/search/multi?api_key=${TMDB_KEY}&language=es-ES&query=${encodeURIComponent(text)}`;
    const { data } = await axios.get(searchUrl);

    if (!data.results || !data.results.length)
      return conn.reply(m.chat, "❌ No se encontraron resultados.", m);

    const res = data.results[0];
    const tipo = res.media_type === "tv" ? "📺 Serie" : "🎥 Película";
    const titulo = res.title || res.name || "Sin título";
    const fecha = res.release_date || res.first_air_date || "Desconocida";
    const descripcion = res.overview || "Sin descripción disponible.";
    const rating = res.vote_average
      ? `⭐ ${res.vote_average.toFixed(1)}/10`
      : "⭐ Sin puntuación";
    const id = res.id;
    const poster = res.poster_path ? IMG + res.poster_path : null;
    const enlace = `https://www.themoviedb.org/${res.media_type}/${id}`;

    // 🌍 Obtener proveedores legales
    let proveedores = "Sin información disponible.";
    try {
      const provUrl = `${BASE}/${res.media_type}/${id}/watch/providers?api_key=${TMDB_KEY}`;
      const prov = await axios.get(provUrl);
      const info = prov.data.results[COUNTRY];
      if (info) {
        const sub = info.flatrate?.map(p => p.provider_name).join(", ");
        const rent = info.rent?.map(p => p.provider_name).join(", ");
        const buy = info.buy?.map(p => p.provider_name).join(", ");
        proveedores = "";
        if (sub) proveedores += `📦 *Suscripción:* ${sub}\n`;
        if (rent) proveedores += `💸 *Alquiler:* ${rent}\n`;
        if (buy) proveedores += `🛒 *Compra:* ${buy}\n`;
      }
    } catch (err) {
      console.log("Error al obtener proveedores:", err.message);
    }

    // 🎞️ Buscar tráiler oficial (YouTube)
    let trailerUrl = null;
    try {
      const videosUrl = `${BASE}/${res.media_type}/${id}/videos?api_key=${TMDB_KEY}&language=es-ES`;
      const videos = await axios.get(videosUrl);
      const trailer = videos.data.results.find(
        v => v.type === "Trailer" && v.site === "YouTube"
      );
      if (trailer) trailerUrl = `https://www.youtube.com/watch?v=${trailer.key}`;
    } catch (err) {
      console.log("Error al obtener tráiler:", err.message);
    }

    // 🔽 Enlace de búsqueda de descarga (solo búsqueda, no descarga real)
    const enlaceDescarga = `https://www.google.com/search?q=${encodeURIComponent(titulo + " ver online latino")}`;

    // 📝 Texto final
    const texto = `
🎬 *${titulo}*
${tipo}
📅 *${fecha}*
${rating}

📝 *Descripción:*
${descripcion}

🌍 *Dónde ver legalmente:*
${proveedores}

🔗 *Más info:* ${enlace}
`.trim();

    // ✅ Reacción final (completado)
    await conn.sendReact(m.chat, '✅', m.key);

    // 📩 Enviar mensaje con botones
    const buttons = [
      ["🎞️ Ver Tráiler", trailerUrl || "https://www.youtube.com"],
      ["📥 Buscar Descarga", enlaceDescarga]
    ];

    if (poster) {
      await conn.sendButton(m.chat, texto, "🎬 Santaflow-Bot", poster, buttons, m);
    } else {
      await conn.sendButton(m.chat, texto, "🎬 Santaflow-Bot", null, buttons, m);
    }

  } catch (err) {
    console.error("❌ Error general:", err.message);
    conn.sendReact(m.chat, '❌', m.key);
    conn.reply(m.chat, "⚠️ Ocurrió un error al buscar la película.", m);
  }
};

handler.help = ["pelicula <nombre>", "movie <nombre>", "serie <nombre>", "film <nombre>"];
handler.tags = ["buscador"];
handler.command = ["pelicula", "movie", "serie", "film"];
handler.register = true;

module.exports = handler;
