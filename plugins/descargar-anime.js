import fetch from "node-fetch";
import Jimp from "jimp";
import fs from "fs";
import path from "path";
import { download, detail, search } from "../lib/anime.js";

const TMP_DIR = "./tmp";
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR);

async function getLangs(episodes) {
  const list = [];
  for (const ep of episodes) {
    try {
      const dl = await download(ep.link);
      const langs = [];
      if (dl?.dl?.sub) langs.push("sub");
      if (dl?.dl?.dub) langs.push("dub");
      list.push({ ...ep, lang: langs });
    } catch {
      list.push({ ...ep, lang: [] });
    }
  }
  return list;
}

let handler = async (m, { command, usedPrefix, conn, text, args }) => {
  if (!text) return m.reply(
    `❄️ *Ingresa el nombre del anime o la URL*\n\n` +
    `• ${usedPrefix + command} Jujutsu Kaisen\n` +
    `• ${usedPrefix + command} https://animeav1.com/media/jujutsu-kaisen`
  );

  try {
    // ===== URL DIRECTA =====
    if (text.includes("https://animeav1.com/media/")) {
      m.react("⌛");

      const info = await detail(args[0]);
      const { title, altTitle, description, cover, rating, total, genres } = info;

      const episodes = await getLangs(info.episodes);
      const gen = genres.join(", ");

      const eps = episodes.map(e =>
        `• Episodio ${e.ep} (${e.lang.includes("sub") ? "SUB" : ""}${e.lang.includes("dub") ? (e.lang.includes("sub") ? " & " : "") + "DUB" : ""})`
      ).join("\n");

      const caption = `
乂 \`\`\`ANIME - DOWNLOAD\`\`\`

🎬 *Título:* ${title}
📝 *Descripción:* ${description}
⭐ *Rating:* ${rating}
🍂 *Géneros:* ${gen}
🎞️ *Episodios:* ${total}

${eps}

> Responde con: *1 sub* o *1 dub*
`.trim();

      const img = await Jimp.read(cover);
      img.resize(400, Jimp.AUTO).quality(80);
      const thumb = await img.getBufferAsync(Jimp.MIME_JPEG);

      const sent = await conn.sendMessage(
        m.chat,
        { image: thumb, caption },
        { quoted: m }
      );

      conn.anime = conn.anime || {};
      conn.anime[m.sender] = {
        title,
        episodes,
        cover,
        key: sent.key,
        downloading: false,
        timeout: setTimeout(() => delete conn.anime[m.sender], 600_000)
      };

    } else {
      // ===== BUSCADOR =====
      m.react("🔍");
      const results = await search(text);
      if (!results.length) return m.reply("❌ No se encontraron resultados.");

      let cap = "乂 *ANIME - SEARCH*\n";
      results.slice(0, 15).forEach((res, i) => {
        cap += `\n\`${i + 1}\` ${res.title}\n${res.link}\n`;
      });

      await conn.sendMessage(m.chat, { text: cap }, { quoted: m });
    }
  } catch (e) {
    console.error(e);
    m.reply("⚠️ Error al procesar el anime.");
  }
};

handler.before = async (m, { conn }) => {
  conn.anime = conn.anime || {};
  const session = conn.anime[m.sender];
  if (!session || !m.quoted || m.quoted.id !== session.key.id) return;
  if (session.downloading) return m.reply("⏳ Espera, ya se está descargando.");

  let [epStr, lang] = m.text.trim().split(/\s+/);
  const epi = parseInt(epStr);
  lang = lang?.toLowerCase();

  if (isNaN(epi)) return m.reply("❌ Episodio inválido.");

  const episode = session.episodes.find(e => parseInt(e.ep) === epi);
  if (!episode) return m.reply("❌ Episodio no encontrado.");

  const inf = await download(episode.link);
  const idiomas = Object.keys(inf.dl || {});
  if (!idiomas.length) return m.reply("❌ No hay idiomas disponibles.");

  if (!lang || !idiomas.includes(lang)) lang = idiomas[0];

  const videoUrl = inf.dl[lang];
  const idiomaLabel = lang === "sub" ? "SUB ESPAÑOL" : "LATINO";

  session.downloading = true;
  m.react("📥");

  // ===== MINIATURA =====
  let thumb;
  try {
    const img = await Jimp.read(session.cover);
    img.resize(300, Jimp.AUTO).quality(80);
    thumb = await img.getBufferAsync(Jimp.MIME_JPEG);
  } catch {
    thumb = Buffer.alloc(0);
  }

  // ===== DESCARGA REAL DEL VIDEO =====
  const filePath = path.join(
    TMP_DIR,
    `${session.title}-cap-${epi}.mp4`
  );

  const res = await fetch(videoUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Referer": "https://animeav1.com/"
    }
  });

  if (!res.ok) throw new Error("No se pudo descargar el video");

  const stream = fs.createWriteStream(filePath);
  await new Promise((resolve, reject) => {
    res.body.pipe(stream);
    res.body.on("error", reject);
    stream.on("finish", resolve);
  });

  // ===== ENVÍO CORRECTO A WHATSAPP =====
  await conn.sendMessage(
    m.chat,
    {
      video: fs.readFileSync(filePath),
      mimetype: "video/mp4",
      fileName: `${session.title} - cap ${epi} [1080p].mp4`,
      jpegThumbnail: thumb,
      caption:
        `🎬 *${session.title}*\n` +
        `📺 Capítulo: ${epi}\n` +
        `🎧 Idioma: ${idiomaLabel}\n` +
        `💿 Calidad: *máxima disponible*`
    },
    { quoted: m }
  );

  fs.unlinkSync(filePath);
  m.react("✅");

  clearTimeout(session.timeout);
  delete conn.anime[m.sender];
};

handler.command = ["anime", "animedl"];
handler.tags = ["download"];
handler.help = ["animedl"];
handler.group = true;
handler.register = true;
handler.premium = true;

export default handler;
