/*import fetch from 'node-fetch'
import fs from 'fs'
import { exec } from 'child_process'
import { promisify } from 'util'

const execPromise = promisify(exec)

let handler = async (m, { conn, text, usedPrefix, command }) => {

  if (!text) {
    return m.reply(`❀ Ingresa lo que quieres buscar

> Ejemplo:
${usedPrefix + command} worry`)
  }

  const tmpMp3 = `./tmp/${Date.now()}.mp3`
  const tmpOgg = `./tmp/${Date.now()}.ogg`

  try {

    await m.react('🕒')

    const api = `${global.APIs.light.url}/search/yt-search?q=${encodeURIComponent(text)}`

    const res = await fetch(api)
    const json = await res.json()

    if (!json.status || !json.result) {
      throw 'No se encontraron resultados'
    }

    const data = json.result

    let caption =
`🧊 *Título:* ${data.title}
🌳 *Autor:* ${data.author}
⏱️ *Duración:* ${data.duration}
🍜 *Vistas:* ${data.views}
🍃 *Link:* ${data.url}`

    await conn.sendMessage(m.chat, {
      image: { url: data.thumbnail },
      caption
    }, { quoted: m })

    if (command === 'playaudio') {

      const api2 = `${global.APIs.light.url}/download/ytdl?q=${encodeURIComponent(data.url)}&format=mp3&quality=128`

      const res2 = await fetch(api2)
      const json2 = await res2.json()

      if (!json2.status || !json2.result?.dl_url) {
        throw 'Error al obtener el audio'
      }

      const audioRes = await fetch(json2.result.dl_url)
      const buffer = Buffer.from(await audioRes.arrayBuffer())

      fs.writeFileSync(tmpMp3, buffer)

      await execPromise(
        `ffmpeg -i "${tmpMp3}" -c:a libopus -b:a 128k "${tmpOgg}" -y`
      )

      await conn.sendMessage(m.chat, {
        audio: fs.readFileSync(tmpOgg),
        mimetype: 'audio/ogg; codecs=opus',
        ptt: true
      }, { quoted: m })

      if (fs.existsSync(tmpMp3)) fs.unlinkSync(tmpMp3)
      if (fs.existsSync(tmpOgg)) fs.unlinkSync(tmpOgg)
    }

    if (command === 'playvideo') {

      const api2 = `${global.APIs.light.url}/download/ytdl?q=${encodeURIComponent(data.url)}&format=mp4&quality=480`

      const res2 = await fetch(api2)
      const json2 = await res2.json()

      if (!json2.status || !json2.result?.dl_url) {
        throw 'Error al obtener el video'
      }

      await conn.sendFile(
        m.chat,
        json2.result.dl_url,
        `${json2.result.title}.mp4`,
        `🎞️ ${json2.result.title}`,
        m
      )
    }

    await m.react('✅')

  } catch (e) {
    console.log(e)

    if (fs.existsSync(tmpMp3)) fs.unlinkSync(tmpMp3)
    if (fs.existsSync(tmpOgg)) fs.unlinkSync(tmpOgg)

    await m.react('✖️')

    m.reply(`✘ Error:\n${e.message || e}`)
  }
}

handler.help = ['playaudio', 'playvideo']
handler.tags = ['download']
handler.command = ['playaudio', 'playvideo']

export default handler*/



import makeFetchCookie from "fetch-cookie"
import * as cheerio from "cheerio"
import yts from "yt-search"

const fetchw = makeFetchCookie(globalThis.fetch)
const base_url = "https://id.tunexa.io"
const UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36"

const hdrs = {
  "User-Agent": UA,
  "Origin": base_url,
  "Referer": `${base_url}/`,
  "X-Requested-With": "XMLHttpRequest"
}

const handler = async (m, { conn, text, command }) => {
  try {

    if (!text) {
      return m.reply(
        `🍜 Ingresa un link o nombre de YouTube`
      )
    }

    await m.react("🕒")
    let url = text
    if (!/youtu\.?be/.test(text)) {

      const search = await yts(text)

      if (!search.videos.length) {
        throw "No se encontró nada"
      }

      url = search.videos[0].url
    }

    const isAudio = ["ytaudio", "playaudio"].includes(command)

    const data = await tunexaDown(
      url,
      isAudio
        ? {
            download_type: "audio",
            audio_format: "mp3",
            audio_quality: "320K",
            selected_ext: "mp3",
            selected_quality_label: "320K"
          }
        : {
            download_type: "video",
            audio_format: "mp4",
            audio_quality: "best",
            selected_itag:
              "bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[height<=1080]",
            selected_ext: "mp4",
            selected_quality_label: "1080p_merged"
          }
    )

    await conn.reply(
      m.chat,
`🧊 *Descargando:* ${data.title}

> • *Formato:* ${data.format}
> • *Duración:* ${data.duration}
> • *Link:* ${url}`,
      m,
      {
        contextInfo: {
          externalAdReply: {
            title:
              "ᰋ ᰋ 🪽 ݂ 𝐘𝐨𝐮𝐓𝐮𝐛𝐞 ✿ 𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝 ݁ 𖨆",
            body: data.title,
            mediaType: 1,
            previewType: 0,
            mediaUrl: url,
            sourceUrl: url,
            thumbnailUrl: data.thumbnail,
            renderLargerThumbnail: true
          }
        }
      }
    )

    if (isAudio) {

      await conn.sendMessage(
        m.chat,
        {
          audio: {
            url: data.download_url
          },
          mimetype: "audio/mpeg",
          fileName: `${data.title}.mp3`
        },
        { quoted: m }
      )

    } else {

      await conn.sendMessage(
        m.chat,
        {
          video: {
            url: data.download_url
          },
          mimetype: "video/mp4",
          fileName: `${data.title}.mp4`,
          caption: data.title
        },
        { quoted: m }
      )
    }

  } catch (e) {
    m.reply(
`✘ Error:

${e.message || e}`
    )
  }
}

handler.command = ["ytvideo", "playvideo", "ytaudio", "playaudio"]
handler.help = handler.command
handler.tags = ["download"]

export default handler

async function solveTurnstile() {
  const res = await fetch(
    "https://cf-solver-renofc.my.id/api/solvebeta",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        url: base_url,
        siteKey: "0x4AAAAAACvMRVBY7pAdKlfv",
        mode: "turnstile-min"
      })
    }
  )

  const data = await res.json()

  if (!data?.token?.result?.token) {
    throw new Error(
      "Solver gagal"
    )
  }

  return data.token.result.token
}

async function getCsrfToken() {

  const res = await fetchw(
    base_url,
    {
      headers: {
        "User-Agent": UA
      }
    }
  )

  const html = await res.text()
  const $ = cheerio.load(html)

  const token = $('meta[name="csrf-token"]')
    .attr("content")

  return token
}

async function getFormats(videoUrl, csrfToken) {

  const res = await fetchw(
    `${base_url}/format-options`,
    {
      method: "POST",

      headers: {
        ...hdrs,
        "Content-Type":
          "application/x-www-form-urlencoded; charset=UTF-8"
      },

      body: new URLSearchParams({
        video_url: videoUrl,
        _token: csrfToken
      })
    }
  )

  return res.json()
}

async function convert(
  videoUrl,
  csrfToken,
  cfToken,
  opts = {}
) {

  const {
    download_type = "audio",
    audio_format = "mp3",
    audio_quality = "320K",
    selected_itag = "",
    selected_ext = "mp3",
    selected_quality_label = "320K",
    prefetched_title = "",
    prefetched_duration = "",
    prefetched_thumbnail = ""
  } = opts

  const body = new URLSearchParams({
    _token: csrfToken,
    video_url: videoUrl,
    trim_audio: "false",
    start_time: "",
    end_time: "",
    download_type,
    audio_format,
    audio_quality,
    selected_itag,
    selected_ext,
    selected_quality_label,
    is_fast: "0",
    prefetched_title,
    prefetched_duration,
    prefetched_thumbnail,
    separate_vocals: "0",
    detect_original_audio: "",
    youtube_target: "video",
    "cf-turnstile-response": cfToken
  })

  const res = await fetchw(
    `${base_url}/convert`,
    {
      method: "POST",
      headers: {
        ...hdrs,

        "Content-Type":
          "application/x-www-form-urlencoded; charset=UTF-8",

        "X-CSRF-TOKEN": csrfToken
      },

      body
    }
  )

  return res.json()
}

async function pollStatus(
  conversionId,
  interval = 3000,
  maxTry = 30
) {

  for (let i = 0; i < maxTry; i++) {
    await new Promise(r =>
      setTimeout(r, interval)
    )

    const ts = Date.now()

    const res = await fetchw(
      `${base_url}/conversion-status/${conversionId}?_ts=${ts}`,
      {
        headers: hdrs
      }
    )

    const data = await res.json()

    if (data.status === "done") {
      return data
    }

    if (data.status === "error") {
      throw new Error(
        JSON.stringify(data)
      )
    }
  }

  throw new Error("Timeout polling")
}

async function tunexaDown(
  videoUrl,
  opts = {}
) {

  const csrfToken =
    await getCsrfToken()

  const formats =
    await getFormats(
      videoUrl,
      csrfToken
    )

  const opts2 = {
    prefetched_title:
      formats.video?.title || "",
    prefetched_duration:
      formats.video?.duration || "",
    prefetched_thumbnail:
      formats.video?.thumbnail || "",

    ...opts
  }

  const cfToken =
    await solveTurnstile()

  const conv =
    await convert(
      videoUrl,
      csrfToken,
      cfToken,
      opts2
    )

  if (!conv.conversion_id) {
    throw new Error(
      JSON.stringify(conv)
    )
  }

  const result =
    await pollStatus(
      conv.conversion_id
    )

  return {
    status: 200,
    title: result.title,
    duration: result.duration,
    thumbnail: result.thumbnail,
    download_url:
      result.download_url,
    format:
      result.audio_format ||
      result.video_format ||
      opts.download_type
  }
}