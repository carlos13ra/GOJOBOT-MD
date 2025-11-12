const axios = require("axios");

const TMDB_KEY = "d337714ae1fe5cc5aeb43cebcd8db834"; // ✅ Tu API Key
const BASE = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p/w500";
const COUNTRY = "PE"; // 🇵🇪 Cambia si deseas

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text)
    return m.reply(`✨ Uso correcto: ${usedPrefix + command} <nombre de película o serie>`);

  await m.reply(`🔎 Buscando *${text}*...`);

  try {
    // Buscar película o serie
    const searchUrl = `${BASE}/search/multi?api_key=${TMDB_KEY}&query=${encodeURIComponent(text)}&language=es-ES`;
    const { data } = await axios.get(searchUrl);

    if (!data.results || data.results.length === 0)
      return m.reply("❌ No se encontraron resultados.");

    const res = data.results[0];
    const tipo = res.media_type === "tv" ? "📺 Serie" : "🎥 Película";
    const titulo = res.title || res.name || "Sin título";
    const fecha = res.release_date || res.first_air_date || "Desconocida";
    const descripcion = res.overview || "Sin descripción disponible.";
    const rating = res.vote_average ? `⭐ ${res.vote_average.toFixed(1)}/10` : "⭐ Sin puntuación";
    const id = res.id;
    const poster = res.poster_path ? IMG + res.poster_path : null;
    const enlace = `https://www.themoviedb.org/${res.media_type}/${id}`;

    // Obtener proveedores legales
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
    } catch (e) {
      console.error("Error obteniendo proveedores:", e.message);
    }

    // Buscar tráiler
    let trailerUrl = null;
    try {
      const videosUrl = `${BASE}/${res.media_type}/${id}/videos?api_key=${TMDB_KEY}&language=es-ES`;
      const videos = await axios.get(videosUrl);
      const trailer = videos.data.results.find(
        (v) => v.type === "Trailer" && v.site === "YouTube"
      );
      if (trailer) trailerUrl = `https://www.youtube.com/watch?v=${trailer.key}`;
    } catch (e) {
      console.error("Error obteniendo tráiler:", e.message);
    }

    // Enlace de descarga (Google)
    const tituloQuery = encodeURIComponent(titulo + " ver online latino");
    const enlaceDescarga = `https://www.google.com/search?q=${tituloQuery}+película+completa`;

    // Mensaje final
    const texto = `🎬 *${titulo}*\n${tipo}\n📅 *${fecha}*\n${rating}\n\n📝 *Descripción:*\n${descripcion}\n\n🌍 *Dónde ver legalmente:*\n${proveedores}\n\n🔗 *Más info:* ${enlace}`;

    // Botones
    const buttons = [
      { buttonId: `#vertrailer ${titulo}`, buttonText: { displayText: "🎞️ Ver Tráiler" }, type: 1 },
      { buttonId: enlaceDescarga, buttonText: { displayText: "📥 Buscar Descarga" }, type: 1 },
    ];

    // Enviar mensaje con imagen y botones
    if (poster) {
      await conn.sendMessage(
        m.chat,
        {
          image: { url: poster },
          caption: texto,
          footer: "🎬 Buscador de Películas • Santaflow-Bot",
          buttons,
          headerType: 4,
        },
        { quoted: m }
      );
    } else {
      await conn.sendMessage(
        m.chat,
        {
          text: texto,
          footer: "🎬 Buscador de Películas • Santaflow-Bot",
          buttons,
          headerType: 1,
        },
        { quoted: m }
      );
    }
  } catch (err) {
    console.error("Error general:", err.message);
    m.reply("⚠️ Ocurrió un error al buscar la película. Revisa la consola para más detalles.");
  }
};

handler.help = ["pelicula <nombre>", "movie <nombre>", "serie <nombre>", "film <nombre>"];
handler.tags = ["buscador"];
handler.command = ["pelicula", "movie", "serie", "film"];
handler.register = true;

module.exports = handler;
