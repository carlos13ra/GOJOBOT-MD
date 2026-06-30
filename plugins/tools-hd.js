import fetch from 'node-fetch'
import crypto from 'crypto'

const API = 'https://a.android.api.remini.ai/v1/mobile'
const ORACLE = 'https://api.remini.ai/v1/mobile/oracle'

function genId() {
  const a = crypto.randomUUID().replace(/-/g, '').slice(0, 16)
  return { android_id: a, aaid: crypto.randomUUID(), backup_persistent_id: a + '_com.bigwinepot.nwdn.international', non_backup_persistent_id: crypto.randomUUID() }
}

let dev = genId()
let token = null

function bh(extra) {
  return {
    'bsp-id': 'com.bigwinepot.nwdn.international.android',
    'build-number': '202514479', 'build-version': '3.7.1020',
    'country': 'US', 'device-manufacturer': 'Samsung', 'device-model': 'SM-G998B',
    'device-type': '6.8', 'language': 'en', 'locale': 'en_US',
    'os-version': '33', 'platform': 'Android', 'timezone': 'America/New_York',
    'android-id': dev.android_id, 'aaid': dev.aaid,
    'accept-encoding': 'gzip', 'user-agent': 'okhttp/4.12.0',
    ...(extra || {}),
  }
}

function ah(extra) {
  const h = bh(extra)
  if (token) h['identity-token'] = token
  return h
}

async function auth() {
  dev = genId()
  const r = await fetch(ORACLE + '/setup', {
    headers: bh({
      'first-install-timestamp': Math.floor(Date.now() / 1000) + 'E9',
      'backup-persistent-id': dev.backup_persistent_id,
      'non-backup-persistent-id': dev.non_backup_persistent_id,
      'environment': 'Production', 'settings-response-version': 'v2',
      'is-app-running-in-background': 'false', 'is-old-user': 'true',
      'app-set-id': 'd44bd45a-a45d-4470-9674-7348a8e3fb71',
    })
  })
  const d = await r.json()
  token = d.settings.__identity__.token
  if (!token) throw new Error('No token')
  await fetch(API + '/users/@me', { headers: ah() })
}

async function reminiHD(buffer, mimeType) {
  await auth()

  const mime = mimeType || 'image/jpeg'
  const md5 = crypto.createHash('md5').update(buffer).digest('base64')
  const meta = { size: buffer.length }

  const taskR = await fetch(API + '/tasks', {
    method: 'POST',
    headers: ah({ 'content-type': 'application/json; charset=UTF-8' }),
    body: JSON.stringify({
      image_content_type: mime, image_md5: md5,
      feature: { type: 'enhance', models: [] },
      metadata: meta,
      options: { high_quality_output: false, save_input: true },
    })
  })
  const taskD = await taskR.json()
  if (!taskD.task_id || !taskD.upload_url || !taskD.upload_headers) throw new Error('Missing fields')

  await fetch(taskD.upload_url, {
    method: 'PUT',
    headers: { ...taskD.upload_headers, 'Content-Length': buffer.length, 'User-Agent': 'okhttp/4.12.0' },
    body: buffer,
  })

  await fetch(API + '/tasks/' + taskD.task_id + '/process', {
    method: 'POST',
    headers: ah({ 'content-length': '0' }),
  })

  let cdnUrl = null
  for (let i = 0; i < 40; i++) {
    await new Promise(r => setTimeout(r, 5000))
    const pr = await fetch(API + '/tasks/' + taskD.task_id, { headers: ah() })
    const pd = await pr.json()
    if (pd.status === 'completed') {
      const outs = pd.result && pd.result.outputs
      if (outs && Array.isArray(outs) && outs[0] && outs[0].url) cdnUrl = outs[0].url
      break
    }
    if (pd.status === 'failed' || pd.status === 'error') throw new Error('Task failed')
  }

  if (!cdnUrl) throw new Error('No output URL')
  return cdnUrl
}

let handler = async (m, { conn, usedPrefix, command }) => {
  const quoted = m.quoted ? m.quoted : m
  const mime = quoted.mimetype || quoted.msg?.mimetype || ''

  if (!/image\/(jpe?g|png)/i.test(mime)) {
    await conn.sendMessage(m.chat, { react: { text: '❗', key: m.key } })
    return m.reply(`🥭 Por favor, envie una imagen o responda a la imagen utilizando el comando.`)
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: '🍃', key: m.key } })
    conn.reply(m.chat, `*✧ Mejorando la calidad de la imagen....*`, m)

    const media = await quoted.download()
    const outputUrl = await reminiHD(media, mime)

    const resultBuffer = await (await fetch(outputUrl)).buffer()

    await conn.sendMessage(m.chat, {
      image: resultBuffer,
      caption: `🍃 *𝙰𝚀𝚄𝙸 𝚃𝙸𝙴𝙽𝙴𝚂 𝚃𝚄 𝙸𝙼𝙰𝙶𝙴𝙽 𝙴𝙽 𝙷𝙳* 🚀\n> ${global.textbot || ''}`.trim()
    }, { quoted: m })

    await conn.sendMessage(m.chat, { react: { text: '🚀', key: m.key } })
  } catch (err) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    m.reply(`❌ Ocurrio un error:\n${err.message || err}`)
  }
}

handler.help = ["hd"]
handler.tags = ["tools"]
handler.command = ["remini", "hd", "enhance"]

export default handler