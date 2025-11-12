// pelicula-handler.js
const axios = require("axios");

const TMDB_KEY = process.env.TMDB_KEY || "d337714ae1fe5cc5aeb43cebcd8db834"; // pon tu key en env o aquí
const BASE = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p/w500";
const COUNTRY = "PE"; // Cambia si necesitas otro país

const handler = async (m, { conn, text, usedPrefix = "", command = "" } = {}) => {
  try {
    console.log(`[pelicula] invocado por ${m?.sender || "usuario"} comando: ${command} texto: ${text}`);

    if (!TMDB_KEY || TMDB_KEY === "d337714ae1fe5cc5aeb43cebcd8db834") {
      return await m.reply
        ? m.reply("⚠️ Debes configurar tu API Key de TMDb. Crea una en https://www.themoviedb.org/settings/api y colócala en la variable TMDB_KEY.")
        : void 0;
    }

    if (!text || !text.trim()) {
      return await m.reply
        ? m.reply(`✨ Uso: ${usedPrefix + (command || "pelicula")} <nombre de película o serie>`)
        : void 0;
    }

    await m.reply?.(`🔎 Buscando *${text}*...`);

    // Buscar (multi: movie/tv/person)
    const { data } = await axios.get(`${BASE}/search/multi`, {
      params: { api_key: TMDB_KEY, query: text, language: "es-ES" },
    });

    if (!data?.results?.length) return await m.reply?.("❌ No se encontraron resultados.");

    const res = data.results[0];
    const tipo = res.media_type === "tv" ? "📺 Serie" : "🎥 Película";
    const titulo = res.title || res.name || "Sin título";
    const fecha = res.release_date || res.first_air_date || "Desconocida";
    const descripcion = res.overview || "Sin descripción disponible.";
    const rating = res.vote_average ? `⭐ ${res.vote_average.toFixed(1)}/10` : "⭐ Sin puntuación";
    const id = res.id;
    const poster = res.poster_path ? IMG + res.poster_path : null;
    const enlace = `https://www.themoviedb.org/${res.media_type}/${id}`;

    // Proveedores
    let proveedores = "Sin información disponible.";
    try {
      const prov = await axios.get(`${BASE}/${res.media_type}/${id}/watch/providers`, {
        params: { api_key: TMDB_KEY },
      });
      const info = prov.data.results?.[COUNTRY];
      if (info) {
        const sub = info.flatrate?.map(p => p.provider_name).join(", ");
        const rent = info.rent?.map(p => p.provider_name).join(", ");
        const buy = info.buy?.map(p => p.provider_name).join(", ");
        proveedores = "";
        if (sub) proveedores += `📦 Suscripción: ${sub}\n`;
        if (rent) proveedores += `💸 Alquiler: ${rent}\n`;
        if (buy) proveedores += `🛒 Compra: ${buy}\n`;
      }
    } catch (err) {
      proveedores = "❌ No hay información de proveedores en tu país.";
    }

    // Trailer
    let trailerUrl = null;
    try {
      const videos = await axios.get(`${BASE}/${res.media_type}/${id}/videos`, {
        params: { api_key: TMDB_KEY, language: "es-ES" },
      });
      const trailer = videos.data.results?.find(v => v.type === "Trailer" && v.site === "YouTube");
      if (trailer) trailerUrl = `https://www.youtube.com/watch?v=${trailer.key}`;
    } catch (err) { /* ignora */ }

    const texto = `🎬 *${titulo}*\n${tipo}\n📅 *${fecha}*\n${rating}\n\n📝 *Descripción:*\n${descripcion}\n\n🌍 *Dónde ver legalmente:*\n${proveedores}\n${trailerUrl ? `🎞️ *Tráiler:* ${trailerUrl}\n` : ""}🔗 *Más info:* ${enlace}`;

    if (poster && conn?.sendMessage) {
      await conn.sendMessage(m.chat, { image: { url: poster }, caption: texto }, { quoted: m });
    } else {
      await m.reply?.(texto);
    }
  } catch (e) {
    console.error("[pelicula] error:", e);
    try { await m.reply?.("⚠️ Error al buscar la información. Intenta nuevamente."); } catch {}
  }
};

// metadata que muchos loaders esperan
handler.help = ["pelicula <nombre>", "movie <nombre>", "serie <nombre>", "film <nombre>"];
handler.tags = ["buscador", "entretenimiento"];
// Usamos regex para asegurar coincidencia con prefijos y variantes
handler.command = /^(pelicula|movie|serie|film)$/i;
handler.register = true;
handler.diamond = false;

// export compatible CommonJS + ESM
module.exports = handler;
module.exports.default = handler;
exports.default = handler;
