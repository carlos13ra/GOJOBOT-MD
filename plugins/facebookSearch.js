import axios from 'axios';
import * as cheerio from 'cheerio';
import fetch from 'node-fetch';

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const BASE_PAGE = 'https://fdownloader.net/es';
const VERIFY_ENDPOINT = 'https://fdownloader.net/api/userverify';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchConfigFromPage = async () => {
    const response = await axios.get(BASE_PAGE, {
        headers: {
            'User-Agent': USER_AGENT
        }
    });

    const $ = cheerio.load(response.data);
    const scripts = [];

    $('script').each((_, script) => {
        const content = $(script).html();
        if (content && content.includes('var k_url_search')) {
            scripts.push(content);
        }
    });

    const blob = scripts.join('\n');

    const extract = (name) => {
        const pattern = new RegExp(`${name}\\s*=\\s*"([^"]+)"`);
        const match = blob.match(pattern);
        return match ? match[1] : '';
    };

    return {
        k_exp: extract('k_exp'),
        k_token: extract('k_token'),
        k_url_search: extract('k_url_search'),
        k_url_convert: extract('k_url_convert'),
        k_lang: extract('k_lang') || 'es',
        c_token: extract('c_token'),
        k_prefix_name: extract('k_prefix_name')
    };
};

const getCFTurnstileToken = async (targetUrl) => {
    const params = new URLSearchParams({ url: targetUrl });
    const { data } = await axios.post(VERIFY_ENDPOINT, params.toString(), {
        headers: {
            'User-Agent': USER_AGENT,
            'Content-Type': 'application/x-www-form-urlencoded',
            Origin: 'https://fdownloader.net',
            Referer: BASE_PAGE
        }
    });

    if (!data?.success || !data.token) {
        throw new Error('No se pudo obtener el token de verificación.');
    }
    return data.token;
};

const postAjaxSearch = async (config, targetUrl, cftoken) => {
    const payload = new URLSearchParams({
        k_exp: config.k_exp,
        k_token: config.k_token,
        q: targetUrl,
        html: '',
        lang: config.k_lang,
        web: 'fdownloader.net',
        v: 'v2',
        w: '',
        cftoken
    });

    const { data } = await axios.post(config.k_url_search, payload.toString(), {
        headers: {
            'User-Agent': USER_AGENT,
            'Content-Type': 'application/x-www-form-urlencoded',
            Origin: 'https://fdownloader.net',
            Referer: BASE_PAGE
        }
    });

    if (data?.status !== 'ok') {
        throw new Error(`Respuesta inesperada del API: ${JSON.stringify(data)}`);
    }

    return data;
};

const parseRows = (html) => {
    const $ = cheerio.load(html);
    const rows = [];

    $('.table tbody tr').each((_, tr) => {
        const row = $(tr);
        const quality = row.find('.video-quality').text().trim();
        const cells = row.find('td');
        const actionCell = cells.eq(2);
        const link = actionCell.find('a');

        if (link.length) {
            rows.push({
                quality,
                requiresRender: false,
                label: link.text().trim(),
                url: link.attr('href')
            });
            return;
        }

        const button = actionCell.find('button');
        if (button.length) {
            rows.push({
                quality,
                requiresRender: true,
                label: button.text().trim(),
                videourl: button.data('videourl'),
                videocodec: button.data('videocodec'),
                videotype: button.data('videotype'),
                fquality: button.data('fquality')
            });
        }
    });

    return rows;
};

const getFacebookDownloadInfo = async (targetUrl) => {
    if (!targetUrl.startsWith('http')) {
        throw new Error('Proporciona un enlace válido de Facebook.');
    }

    const config = await fetchConfigFromPage();
    const cftoken = await getCFTurnstileToken(targetUrl);

    await delay(500);

    const searchResponse = await postAjaxSearch(config, targetUrl, cftoken);
    const formats = parseRows(searchResponse.data || '');

    return {
        target: targetUrl,
        config,
        cftoken,
        formats
    };
};

const MAX_ALBUM = 5;

const pickBestDirectUrl = (formats = []) => {
    const hd = formats.find(f => !f.requiresRender && typeof f.url === 'string' && f.url && (f.quality || '').includes('HD'));
    const sd = formats.find(f => !f.requiresRender && typeof f.url === 'string' && f.url && (f.quality || '').includes('SD'));
    const anyDirect = formats.find(f => !f.requiresRender && typeof f.url === 'string' && f.url);
    const anyUrl = formats.find(f => typeof f.url === 'string' && f.url);
    return hd?.url || sd?.url || anyDirect?.url || anyUrl?.url || null;
};

const getDirectVideoUrl = async (facebookUrl) => {
    const info = await getFacebookDownloadInfo(facebookUrl);
    return pickBestDirectUrl(info.formats);
};

const downloadAndSend = async (m, conn, url, title = 'Facebook Video') => {
    try {
        const finalUrl = await getDirectVideoUrl(url);

        if (finalUrl) {
            await conn.sendMessage(m.chat, { 
                video: { url: finalUrl }, 
                caption: `🎬 *${title}*\n🔗 ${url}` 
            }, { quoted: m });
        } else {
            m.reply('No se pudo generar un enlace de descarga con FDownloader.');
        }

    } catch (err) {
        console.error(err);
        m.reply(`Error al descargar: ${err.message}`);
    }
};

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (text && text.match(/^https?:\/\/(www\.)?(facebook|fb|fb)\.(com|watch|me|gg)\/.+/i)) {
        await conn.reply(m.chat, `_Enlace detectado. Iniciando descarga..._`, m);
        return await downloadAndSend(m, conn, text);
    }

    if (!text) throw `*Por favor ingresa una búsqueda.*\nEjemplo: ${usedPrefix + command} gatos`;

    m.reply('*Buscando en Facebook... 🔎*');

    try {
        const apiUrl = `https://fbsearch.ryzecodes.xyz/search?q=${encodeURIComponent(text)}`;
        const response = await fetch(apiUrl);
        if (!response.ok) throw `API Error: ${response.statusText}`;

        const data = await response.json();

        if (!data.status || !data.videos || data.videos.length === 0) {
            return m.reply('No se encontraron resultados.');
        }

        const candidates = data.videos.slice(0, MAX_ALBUM);

        const medias = [];
        for (const v of candidates) {
            const title = v.title === 'Unknown' ? 'Facebook Video' : v.title;
            try {
                const directUrl = await getDirectVideoUrl(v.link);
                if (!directUrl) continue;
                medias.push({
                    type: 'video',
                    data: { url: directUrl },
                    caption: `🎬 *${title}*\n📌 ${v.type || 'Video'}\n🔗 ${v.link}`
                });
            } catch (e) {
                console.error(e);
            }
        }

        if (medias.length >= 2) {
            await conn.sendSylphy(m.chat, medias, { quoted: m, delay: 700 });
            return;
        }

        if (medias.length === 1) {
            await conn.sendMessage(m.chat, { video: medias[0].data, caption: medias[0].caption }, { quoted: m });
            return;
        }

        return m.reply('No pude generar enlaces directos para esos resultados.');

    } catch (e) {
        console.error(e);
        m.reply(`Error: ${e.message}`);
    }
};

handler.help = ['fbsearch']
handler.command = ['fbplay', 'fbsearch']
handler.tags = ["download"]
handler.group = true
