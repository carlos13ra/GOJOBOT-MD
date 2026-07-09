import axios from 'axios'
import FormData from 'form-data'
import * as cheerio from 'cheerio'

const handler = async (m, { conn }) => {
  try {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''

    if (!mime) {
      return m.reply('❀ Responde a un archivo.')
    }

    await m.react('🕒')

    const media = await q.download()
    const sizeMb = (media.length / 1024 / 1024).toFixed(2)

    let result = null
    let server = null

    // CATBOX
    try {
      result = await uploadCatbox(media, mime)

      if (result) {
        server = 'Catbox'
      }
    } catch {}

    // LITTERBOX
    if (!result) {
      try {
        result = await uploadLitterbox(media, mime)

        if (result) {
          server = 'Litterbox'
        }
      } catch {}
    }

    // TMPFILES
    if (!result) {
      try {
        result = await uploadTmpfiles(media, mime)

        if (result) {
          server = 'TmpFiles'
        }
      } catch {}
    }

    // KRAKENFILES
    if (!result) {
      try {
        result = await uploadKraken(media, mime)

        if (result) {
          server = 'KrakenFiles'
        }
      } catch {}
    }

    if (!result) {
      throw new Error('Todos los servidores fallaron')
    }

    await conn.reply(
      m.chat,
`🫒 *Upload Completo*

🌳 *Link:* ${result}
🍃 *Tipo:* ${mime}
🍜 *Peso:* ${sizeMb} MB
🛰️ *Servidor:* ${server}`,
      m
    )

    await m.react('✅')

  } catch (e) {
    console.log(e.response?.data || e)

    await m.react('✖️')

    m.reply(
`✘ Error:

${e.response?.data || e.message || e}`
    )
  }
}

handler.help = ['upload']
handler.tags = ['tools']
handler.command = ['catbox', 'upload']

export default handler

function generateUniqueFilename(mime = 'application/octet-stream') {
  const ext = mime.split('/')[1] || 'bin'
  return `${Date.now()}.${ext}`
}

// CATBOX
async function uploadCatbox(buffer, mime) {
  const form = new FormData()

  form.append('reqtype', 'fileupload')

  form.append('fileToUpload', buffer, {
    filename: generateUniqueFilename(mime),
    contentType: mime
  })

  const res = await axios.post(
    'https://catbox.moe/user/api.php',
    form,
    {
      timeout: 120000,
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      validateStatus: () => true,
      headers: {
        ...form.getHeaders(),
        accept: '*/*',
        'user-agent': 'Mozilla/5.0'
      }
    }
  )

  if (
    typeof res.data === 'string' &&
    res.data.startsWith('https://')
  ) {
    return res.data.trim()
  }

  return null
}

// LITTERBOX
async function uploadLitterbox(buffer, mime) {
  const form = new FormData()

  form.append('reqtype', 'fileupload')
  form.append('time', '1h')

  form.append('fileToUpload', buffer, {
    filename: generateUniqueFilename(mime),
    contentType: mime
  })

  const res = await axios.post(
    'https://litterbox.catbox.moe/resources/internals/api.php',
    form,
    {
      timeout: 120000,
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      validateStatus: () => true,
      headers: {
        ...form.getHeaders(),
        accept: '*/*',
        'user-agent': 'Mozilla/5.0'
      }
    }
  )

  if (
    typeof res.data === 'string' &&
    res.data.startsWith('https://')
  ) {
    return res.data.trim()
  }

  return null
}

// TMPFILES
async function uploadTmpfiles(buffer, mime) {
  const form = new FormData()

  form.append('file', buffer, {
    filename: generateUniqueFilename(mime),
    contentType: mime
  })

  form.append('expire', '21600')

  const res = await axios.post(
    'https://tmpfiles.org/api/v1/upload',
    form,
    {
      timeout: 120000,
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      validateStatus: () => true,
      headers: {
        ...form.getHeaders(),
        accept: 'application/json',
        'user-agent': 'Mozilla/5.0'
      }
    }
  )

  return res.data?.data?.url || null
}

// KRAKENFILES
async function uploadKraken(buffer, mime) {
  const UA =
    'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 Chrome/147.0.0.0 Mobile Safari/537.36'

  const form = new FormData()

  form.append('files[]', buffer, {
    filename: generateUniqueFilename(mime),
    contentType: mime
  })

  const res = await axios.post(
    'https://hs9.krakencloud.net/_uploader/gallery/upload',
    form,
    {
      timeout: 120000,
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      validateStatus: () => true,
      headers: {
        ...form.getHeaders(),
        accept: 'application/json, text/javascript, */*; q=0.01',
        origin: 'https://krakenfiles.com',
        referer: 'https://krakenfiles.com/',
        'user-agent': UA
      }
    }
  )

  const viewUrl = res.data?.files?.[0]?.url || null

  if (!viewUrl) {
    return null
  }

  const page = await axios.get(viewUrl, {
    headers: {
      'user-agent': UA
    }
  })

  const $ = cheerio.load(page.data || '')

  return (
    $('#link1').attr('value')?.trim() ||
    $('meta[property="og:image"]').attr('content')?.trim() ||
    $('.image-preview a[href]').attr('href')?.trim() ||
    viewUrl
  )
}