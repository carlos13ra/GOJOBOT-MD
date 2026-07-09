import fetch from 'node-fetch'
import { FormData, Blob } from 'formdata-node'

async function uploadImage(buffer) {
  try {
    const body = new FormData()
    body.append('files[]', new Blob([buffer], { type: 'image/jpeg' }), 'image.jpg')
    
    const res = await fetch('https://uguu.se/upload.php', { 
      method: 'POST', 
      body 
    })
    
    const json = await res.json()
    return json.files?.[0]?.url || null
  } catch (e) {
    console.error('Error uploading:', e)
    return null
  }
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
      return conn.reply(m.chat, 
        `🍡 Por favor responde a una imagen con el prompt.`, 
        m
      )
    }
    
    let q = m.quoted ? m.quoted : m
    let mimeType = (q.msg || q).mimetype || ''
    
    if (!/image\/(jest|jpeg|png)/.test(mimeType)) {
      return conn.reply(m.chat, `🥢 Por favor responde o etiqueta una **imagen** con el comando.`, m)
    }

    await m.react('🕒')
    
    try {
        let imgBuffer = await q.download()
        let imageUrl = await uploadImage(imgBuffer)
        
        if (!imageUrl) {
          return conn.reply(m.chat, `⚠︎ Error al subir la imagen.`, m)
        }

        const apiUrl = `https://nexus-light.onrender.com/ai/nanobanana?image=${encodeURIComponent(imageUrl)}&prompt=${encodeURIComponent(text)}`
        
        const res = await fetch(apiUrl)
        const json = await res.json()

        if (!json.status || !json.data?.image) {
          return conn.reply(m.chat, `⚠︎ Error en la API: ${json.message || 'Desconocido'}`, m)
        }
        const editedRes = await fetch(json.data.image)
        const editedBuffer = await editedRes.buffer()

        await conn.sendFile(m.chat, editedBuffer, 'nanobanana.jpg', ` 🍡 NanoBanana - imagen editada\n🌷 *Prompt:* ${text}`, m)
        await m.react('✔️')

    } catch (error) {
        await conn.reply(m.chat, `⚠︎ Error al procesar la imagen.\n\n${error.message}`, m)
    }
}

handler.help = ['nanobanana <prompt>']
handler.tags = ['ai', 'tools', 'image']
handler.command = ['nanobanana', 'banana', 'nb', 'editimg']

export default handler