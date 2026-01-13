import axios from 'axios'
import * as cheerio from 'cheerio'

/* ───────── CONSTANTES ───────── */
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

const BASE_PAGE = 'https://fdownloader.net/es'
const VERIFY_ENDPOINT = 'https://fdownloader.net/api/userverify'
const MAX_RESULTS = 5

const delay = ms => new Promise(r => setTimeout(r, ms))

/* ───────── CONFIG FDOWNLOADER ───────── */
async function fetchConfigFromPage() {
  const { data } = await axios.get(BASE_PAGE, {
    headers: { 'User-Agent': USER_AGENT },
    timeout: 15000
  })

  const $ = cheerio.load(data)
  let blob = ''

  $('script').each((_, s) => {
    const t = $(s).html()
    if (t && t.includes('k_url_search')) blob += t
  })

  const grab = k =>
    blob.match(new RegExp(`${k}\\s*=\\s*"([^"]+)"`))?.[1] || ''

  return {
    k_exp: grab('k_exp'),
    k_token: grab('k_token'),
    k_url_search: grab('k_url_search'),
    k_lang: grab('k_lang') || 'es'
  }
}

/* ───────── TOKEN CLOUDFLARE ───────── */
async function getCFTurnstileToken(url) {
  const body = new URLSearchParams({ url }).toString()

  const { data } = await axios.post(VERIFY_ENDPOINT, body, {
    headers: {
      'User-Agent': USER_AGENT,
      'Content-Type': 'application/x-www-form-urlencoded',
      Origin: 'https://fdownloader.net',
      Referer: BASE_PAGE
    },
    timeout: 15000
  })

  if (!data?.success || !data.token)
    throw 'No se pudo obtener token de verificación'

  return data.token
}

/* ───────── BUSCAR EN FDOWNLOADER ───────── */
async function postSearch(cfg, url, token) {
  const payload = new URLSearchParams({
    k_exp: cfg.k_exp,
    k_token: cfg.k_token,
    q: url,
    lang: cfg.k_lang,
    web: 'fdownloader.net',
    v: 'v2',
    cftoken: token
  }).toString()

  const { data } = await axios.post(cfg.k_url_search, payload, {
    headers: {
      'User-Agent': USER_AGENT,
      'Content-Type': 'application/x-www-form-urlencoded',
      Origin: 'https://fdownloader.net',
      Referer: BASE_PAGE
    },
    timeout: 15000
  })

  if (data?.status !== 'ok') throw 'FDownloader rechazó la solicitud'
  return data.data
}

/* ───────── PARSEAR FORMATOS ───────── */
function parseRows(html) {
  const $ = cheerio.load(html)
  const rows = []

  $('.table tbody tr').each((_, tr) => {
    const quality = $(tr).find('.video-quality').text().trim()
    const link = $(tr).find('a[href]')

    if (link.length) {
      rows.push({
        quality,
        url: link.attr('href')
      })
    }
  })

  return rows
}

/* ───────── ELEGIR MEJOR URL ───────── */
function pickBest(formats = []) {
  return (
    formats.find(v => /HD/i.test(v.quality))?.url ||
    formats.find(v => /SD/i.test(v.quality))?.url ||
    formats[0]?.url ||
    null
  )
}

/* ───────── OBTENER VIDEO DIRECTO ───────── */
async function getDirectVideoUrl(fbUrl) {
  const cfg = await fetchConfigFromPage()
  const token = await getCFTurnstileToken(fbUrl)
  await delay(600)
  const html = await postSearch(cfg, fbUrl, token)
  const formats = parseRows(html)
  return pickBest(formats)
}

/* ───────── BUSCAR VIDEOS POR TEXTO ───────── */
async function fbSearchByText(query) {
  const api = `https://fbsearch.ryzecodes.xyz/search?q=${encodeURIComponent(query)}`
  const { data } = await axios.get(api, { timeout: 15000 })

  if (!data?.status || !Array.isArray(data.videos)) return []
  return data.videos.slice(0, MAX_RESULTS)
}

/* ───────── HANDLER ───────── */
let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text)
    throw `Ejemplo:\n${usedPrefix + command} gatos\n${usedPrefix + command} https://fb.watch/xxxx`

  const fbRegex =
    /^https?:\/\/(www\.|m\.)?(facebook\.com|fb\.watch)\//i

  /* ───── CASO 1: ENLACE ───── */
  if (fbRegex.test(text)) {
    await conn.reply(m.chat, '⏳ Descargando video...', m)

    try {
      const videoUrl = await getDirectVideoUrl(text)
      if (!videoUrl) throw 'Sin enlace directo'

      return await conn.sendMessage(
        m.chat,
        {
          video: { url: videoUrl },
          caption: '🎬 Facebook Video'
        },
        { quoted: m }
      )
    } catch (e) {
      console.error(e)
      return m.reply('❌ Error al descargar el video')
    }
  }

  /* ───── CASO 2: BÚSQUEDA ───── */
  m.reply('🔎 Buscando videos en Facebook...')

  try {
    const results = await fbSearchByText(text)
    if (!results.length)
      return m.reply('No se encontraron resultados.')

    let sent = 0

    for (const v of results) {
      try {
        const direct = await getDirectVideoUrl(v.link)
        if (!direct) continue

        await conn.sendMessage(
          m.chat,
          {
            video: { url: direct },
            caption: `🎬 ${v.title || 'Facebook Video'}`
          },
          { quoted: m }
        )

        sent++
        if (sent >= 3) break
        await delay(900)
      } catch {}
    }

    if (!sent)
      return m.reply('No pude descargar ningún resultado.')

  } catch (e) {
    console.error(e)
    m.reply('❌ Error en la búsqueda')
  }
}

/* ───────── EXPORT ───────── */
handler.help = ['fbsearch <texto|link>']
handler.command = ['fbsearch', 'fbplay']
handler.tags = ['download']
handler.group = true

export default handler
