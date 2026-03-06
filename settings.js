import { watchFile, unwatchFile } from "fs"
import chalk from "chalk"
import { fileURLToPath } from "url"
import fs from "fs"


//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

global.owner = ["51963315293", "523541145561", "51934 053286"]
global.suittag = ["51963315293"]
global.prems = ["51963315293", "523541145561"]

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

global.libreria = "Baileys Multi Device"
global.vs = "^1.8.2 • Latest"
global.nameqr = "ɢᴏᴊᴏ-ʙᴏᴛ ᴍᴅ"
global.sessions = "Sessions/Principal"
global.jadi = "Sessions/SubBot"
global.botNumber = "" //Ejemplo: 573218138672
global.kanekiAIJadibts = true

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

global.botname = "𖹭  ׄ  ְ ✰ 𝐆𝐨𝐣𝐨𝐁𝐨𝐭-𝐌𝐃 ✩"
global.textbot = "gσᴊσ вσт ν3 • мα∂є ву ¢αяℓσѕ.яν"
global.dev = "© ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝙲𝙰𝚁𝙻𝙾𝚂.𝚁𝚅"
global.author = "© mᥲძᥱ ᥕі𝗍һ ᑲᥡ ƈαɾʅσʂ.ɾʋ"
global.etiqueta = "✫ᴄᴀʀʟᴏs ʀᴀᴍɪʀᴇᴢ❄️ ⊹꙰ "
global.currency = "g᥆𝗍іᥴᥲs"
global.banner = "https://raw.githubusercontent.com/AkiraDevX/uploads/main/uploads/1767454349524_108341.jpeg"
global.icono = "https://raw.githubusercontent.com/Dev-lxyz/upload/main/uploads/vdoua.jpeg"
global.catalogo = fs.readFileSync('./lib/catalogo.jpg')

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

global.group = "https://chat.whatsapp.com/IDo5RtlTvyt59hqj7E9O28?mode=wwt"
global.community = "https://chat.whatsapp.com/IDo5RtlTvyt59hqj7E9O28?mode=wwt"
global.channel = "https://whatsapp.com/channel/0029VbBGlokA89MliWWv1x16"
global.github = "https://github.com/Carlos13ra/GOJOBOT-MD"
global.gmail = "shadowcore.xyz@gmail.com"
global.ch = {
ch1: "120363421367237421@newsletter"
}

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

global.APIs = {
xyro: { url: "https://xyro.site", key: null },
yupra: { url: "https://api.yupra.my.id", key: null },
vreden: { url: "https://api.vreden.web.id", key: null },
delirius: { url: "https://api.delirius.store", key: null },
zenzxz: { url: "https://api.zenzxz.my.id", key: null },
siputzx: { url: "https://api.siputzx.my.id", key: null },
adonix: { url: "https://api-adonix.ultraplus.click", key: 'shadow.xyz' },
light: { url: "https://api-light.vercel.app", key: null }
}

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
unwatchFile(file)
console.log(chalk.redBright("Update 'settings.js'"))
import(`${file}?update=${Date.now()}`)
})
