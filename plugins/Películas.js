import axios from "axios";

const TMDB_KEY = "d337714ae1fe5cc5aeb43cebcd8db834"; // 🔑 Coloca tu propia API key de TMDb
const BASE = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p/w500";
const COUNTRY = "PE"; // 🇵🇪 Cambia a tu país (MX, ES, AR, CL, etc.)

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!TMDB_KEY || TMDB_KEY === "d337714ae1fe5cc5aeb43cebcd8db834")
    return m.reply("⚠️ Debes configurar tu API Key de TMDb. Crea una en https://www.themoviedb.org/settings/api");

  if (!text)
    return m.reply(`✨ Uso: ${usedPrefix + command} <nombre de película o serie>`);

  await m.reply(`🔍 Buscando *${text}*...`);

  try {
    // Buscar película o serie
    const { data } = await axios.get(`${BASE}/search/multi`, {
      params: { api_key: TMDB_KEY, query: text, language: "es-ES" },
    });

    if (!data.results.length)
      return m.reply("❌ No se encontraron resultados.");

    const res = data.results[0];
    const tipo = res.media_type === "tv" ? "📺 Serie" : "🎬 Película";
    const titulo = res.title || res.name;
    const fecha = res.release_date || res.first_air_date || "Desconocida";
    const descripcion = res.overview || "Sin descripción disponible.";
    const rating = res.vote_average ? `⭐ ${res.vote_average.toFixed(1)}/10` : "⭐ Sin puntuación";
    const id = res.id;
    const poster = res.poster_path ? IMG + res.poster_path : null;
    const enlace = `https://www.themoviedb.org/${res.media_type}/${id}`;

    // Proveedores legales
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

    // Tráiler oficial
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

    const mensaje = `🎬 *${titulo}*\n${tipo}\n📅 *${fecha}*\n${rating}\n\n📝 *Descripción:*\n${descripcion}\n\n🌍 *Dónde ver legalmente:*\n${proveedores}\n${trailerUrl ? `🎞️ *Tráiler:* ${trailerUrl}\n` : ""}🔗 *Más info:* ${enlace}`;

    if (poster) {
      await conn.sendMessage(m.chat, { image: { url: poster }, caption: mensaje }, { quoted: m });
    } else {
      await m.reply(mensaje);
    }
  } catch (err) {
    console.error(err);
    m.reply("⚠️ Error al buscar la información. Intenta nuevamente.");
  }
};

// 📌 Configuración para que el bot lo reconozca
handler.help = ["pelicula <nombre>", "movie <nombre>", "serie <nombre>", "film <nombre>"];
handler.tags = ["buscador"];
handler.command = ["pelicula", "movie", "serie", "film"]; // ✅ muy importante que sean minúsculas
handler.register = true;
handler.limit = false;

export default handler;
