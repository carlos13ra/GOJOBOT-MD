import axios from 'axios'
import * as cheerio from 'cheerio'

/* ───────── CONFIG ───────── */
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

const BASE_PAGE = 'https://fdownloader.net/es'
const VERIFY_ENDPOINT = 'https://fdownloader.net/api/userverify'
const MAX_RESULTS = 3

const delay = ms => new Promise(r => setTimeout(r, ms))

/* ───────── FDOWNLOADER ───────── */
async function fetchConfigFromPage() {
  const { data } = await axios.get(BASE_PAGE, {
    headers: { 'User-Agent': USER_AGENT }
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

async function getCFTurnstileToken(url) {
  const body = new URLSearchParams({ url }).toString()

  const { data } = await axios.post(VERIFY_ENDPOINT, body, {
    headers: {
      'User-Agent': USER_AGENT,
      'Content-Type': 'application/x-www-form-urlencoded',
      Origin: 'https://fdownloader.net',
      Referer: BASE_PAGE
    }
  })

  if (!data?.success || !data.token)
    throw 'No token CF'

  return data.token
}

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
    }
  })

  if (data?.status !== 'ok') throw 'FD error'
  return data.data
}

function parseRows(html) {
  const $ = cheerio.load(html)
  const rows = []

  $('.table tbody tr').each((_, tr) => {
    const quality = $(tr).find('.video-quality').text().trim()
    const link = $(tr).find('a[href]')
    if (link.length) rows.push({ quality, url: link.attr('href') })
  })

  return rows
}

function pickBest(formats = []) {
  return (
    formats.find(v => /HD/i.test(v.quality))?.url ||
    formats.find(v => /SD/i.test(v.quality))?.url ||
    formats[0]?.url ||
    null
  )
}

async function getDirectVideoUrl(fbUrl) {
  const cfg = await fetchConfigFromPage()
  const token = await getCFTurnstileToken(fbUrl)
  await delay(600)
  const html = await postSearch(cfg, fbUrl, token)
  const formats = parseRows(html)
  return pickBest(formats)
}

/* ───────── BUSCAR EN BING ───────── */
async function searchFacebookLinks(query) {
  const q = `site:facebook.com OR site:fb.watch ${query}`
  const url = `https://www.bing.com/search?q=${encodeURIComponent(q)}`

  const { data } = await axios.get(url, {
    headers: { 'User-Agent': USER_AGENT }
  })

  const $ = cheerio.load(data)
  const links = new Set()

  $('a[href^="https://www.facebook.com"], a[href^="https://fb.watch"]').each(
    (_, a) => {
      const href = $(a).attr('href')
      if (href && href.includes('facebook.com/videos')) {
        links.add(href)
      }
      if (href && href.includes('fb.watch')) {
        links.add(href)
      }
    }
  )

  return [...links].slice(0, MAX_RESULTS)
}

/* ───────── HANDLER ───────── */
let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text)
    throw `Ejemplo:\n${usedPrefix + command} gatos graciosos`

  m.reply('🔎 Buscando videos en Facebook...')

  try {
    const links = await searchFacebookLinks(text)

    if (!links.length)
      return m.reply('❌ No se encontraron videos públicos.')

    let sent = 0

    for (const link of links) {
      try {
        const videoUrl = await getDirectVideoUrl(link)
        if (!videoUrl) continue

        await conn.sendMessage(
          m.chat,
          {
            video: { url: videoUrl },
            caption: '🎬 Facebook Video'
          },
          { quoted: m }
        )

        sent++
        if (sent >= MAX_RESULTS) break
        await delay(1200)
      } catch {}
    }

    if (!sent)
      m.reply('❌ Se encontraron links pero no eran descargables.')

  } catch (e) {
    console.error(e)
    m.reply('❌ Error al buscar videos')
  }
}

handler.help = ['fbsearch <palabras>']
handler.command = ['fbsearch', 'fbplay']
handler.tags = ['download']
handler.group = true

export default handler
