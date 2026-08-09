import { watchFile, unwatchFile } from "fs"
import chalk from "chalk"
import { fileURLToPath } from "url"
import fs from "fs"
import { prepareWAMessageMedia } from '@whiskeysockets/baileys'

global.botNumber = "" 
global.owner = ["51963315293", "51934053286", "51919194987", "51922902497", "51966453839", "5213541145561", "51930958596"]
global.suittag = ["51963315293"] 
global.prems = ["51934053286"]


global.vs = "^1.8.2 • Latest"
global.sessions = "Sessions/Principal"
global.jadi = "Sessions/SubBot"
global.kanekiAIJadibts = true

global.botname = "𖹭  ׄ  ְ 🍜 𝐆𝐨𝐣𝐨𝐁𝐨𝐭-𝐌𝐃 ✩"
global.namebot = "Satoru Gojo"
global.dev = "ᴍᴀᴅᴇ ᴡɪᴛʜ ʙʏ ᴄᴀʀʟᴏs.ʀᴠ ©"
global.author = "ƈαɾʅσʂ.ɾʋ"
global.etiqueta = "✫ᴄᴀʀʟᴏs ʀᴀᴍɪʀᴇᴢ ❄️ ⊹꙰ "
global.currency = "g᥆𝗍іᥴᥲs"
global.banner = "https://raw.githubusercontent.com/Dev-lxyz/upload/main/uploads/0wfrp.jpeg"
global.icono = "https://raw.githubusercontent.com/Dev-lxyz/upload/main/uploads/g68u4.jpeg"

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*


global.links = {
  group: "https://chat.whatsapp.com/IDo5RtlTvyt59hqj7E9O28?mode=wwt",
  community: "https://chat.whatsapp.com/IDo5RtlTvyt59hqj7E9O28?mode=wwt",
  channel: "https://whatsapp.com/channel/0029VbBGlokA89MliWWv1x16",
  github: "https://github.com/Carlos13ra/GOJOBOT-MD",
  gmail: "shadowcore.xyz@gmail.com",
  api: "https://nexus-light.onrender.com/",
}

global.ch = {
  ch1: "120363421367237421@newsletter"
}

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

global.gojo = prepareWAMessageMedia
global.APIs = {
vreden: { url: "https://api.vreden.web.id", key: null },
delirius: { url: "https://api.delirius.store", key: null },
siputzx: { url: "https://api.siputzx.my.id", key: null },
stellar: { url: "https://api.stellarwa.xyz", key: "this-xyz"},
light: { url: "https://api--shadowcorexyz.replit.app", key: "miku_sakura" } // poble att: el creador 
}

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
unwatchFile(file)
console.log(chalk.redBright("Update 'settings'"))
import(`${file}?update=${Date.now()}`)
})
