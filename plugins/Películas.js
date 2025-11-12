const axios = require("axios");

const TMDB_KEY = "d337714ae1fe5cc5aeb43cebcd8db834"; // 🔑 Reemplázala con tu API Key de TMDb
const BASE = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p/w500";
const COUNTRY = "PE"; // 🇵🇪 Cambia por tu país (MX, ES, AR, CL, etc.)

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!TMDB_KEY || TMDB_KEY === "d337714ae1fe5cc5aeb43cebcd8db834")
    return m.reply("⚠️ Debes poner tu API Key de TMDb en la línea 7. Crea una gratis en https://www.themoviedb.org/settings/api");

  if (!text)
    return m.reply(`✨ Uso correcto: *${usedPrefix + command} <nombre de película o serie>*`);

  await m.reply(`🔎 Buscando *${text}*...`);

  try {
    // 🔍 Buscar película o serie
    const { data } = await axios.get(`${BASE}/search/multi`, {
      params: { api_key: TMDB_KEY, query: text, language: "es-ES" },
    });

    if (!data.results.length) return m.reply("❌ No se encontraron resultados.");

    const res = data.results[0];
    const tipo = res.media_type === "tv" ? "📺 Serie" : "🎥 Película";
    const titulo = res.title || res.name || "Sin título";
    const fecha = res.release_date || res.first_air_date || "Desconocida";
    const descripcion = res.overview || "Sin descripción disponible.";
    const rating = res.vote_average ? `⭐ ${res.vote_average.toFixed(1)}/10` : "⭐ Sin puntuación";
    const id = res.id;
    const poster = res.poster_path ? IMG + res.poster_path : null;
    const enlace = `https://www.themoviedb.org/${res.media_type}/${id}`;

    // 🎞️ Proveedores legales
    let proveedores = "Sin información disponible.";
    try {
      const prov = await axios.get(`${BASE}/${res.media_type}/${id}/watch/providers`, {
        params: { api_key: TMDB_KEY },
      });
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
    } catch {
      proveedores = "❌ No hay información de proveedores en tu país.";
    }

    // 🎥 Tráiler oficial (YouTube)
    let trailerUrl = null;
    try {
      const videos = await axios.get(`${BASE}/${res.media_type}/${id}/videos`, {
        params: { api_key: TMDB_KEY, language: "es-ES" },
      });
      const trailer = videos.data.results.find(
        (v) => v.type === "Trailer" && v.site === "YouTube"
      );
      if (trailer) trailerUrl = `https://www.youtube.com/watch?v=${trailer.key}`;
    } catch {}

    // 📝 Mensaje final
    const texto = `🎬 *${titulo}*\n${tipo}\n📅 *${fecha}*\n${rating}\n\n📝 *Descripción:*\n${descripcion}\n\n🌍 *Dónde ver legalmente:*\n${proveedores}\n${trailerUrl ? `🎞️ *Tráiler:* ${trailerUrl}\n` : ""}\n🔗 *Más info:* ${enlace}`;

    if (poster) {
      await conn.sendMessage(m.chat, { image: { url: poster }, caption: texto }, { quoted: m });
    } else {
      await m.reply(texto);
    }

  } catch (e) {
    console.error(e);
    m.reply("⚠️ Error al buscar la información. Intenta nuevamente.");
  }
};

// 🧩 Información del comando
handler.help = ["pelicula <nombre>", "movie <nombre>", "serie <nombre>", "film <nombre>"];
handler.tags = ["buscador", "entretenimiento"];
handler.command = ["pelicula", "movie", "serie", "film"];
handler.register = true;
handler.diamond = false;

export default handler; // ✅ Forma moderna (para bots tipo ESModule)
