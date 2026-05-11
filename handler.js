import { smsg } from "./lib/simple.js"
import { format } from "util"
import { fileURLToPath } from "url"
import path, { join } from "path"
import fs, { unwatchFile, watchFile } from "fs"
import chalk from "chalk"
import fetch from "node-fetch"
import ws from "ws"

const isNumber = x => typeof x === "number" && !isNaN(x)
const delay = ms => isNumber(ms) && new Promise(resolve => setTimeout(function () {
clearTimeout(this)
resolve()
}, ms))

export async function handler(chatUpdate) {
this.msgqueque = this.msgqueque || []
this.uptime = this.uptime || Date.now()
if (!chatUpdate) return
this.pushMessage(chatUpdate.messages).catch(console.error)
let m = chatUpdate.messages[chatUpdate.messages.length - 1]
if (!m) return
if (global.db.data == null)
await global.loadDatabase()
try {
m = smsg(this, m) || m
if (!m) return
m.exp = 0
try {
const user = global.db.data.users[m.sender]
if (typeof user !== "object") {
global.db.data.users[m.sender] = {}
}
if (user) {
if (!("name" in user)) user.name = m.name
if (!("exp" in user) || !isNumber(user.exp)) user.exp = 0
if (!("coin" in user) || !isNumber(user.coin)) user.coin = 0
if (!("bank" in user) || !isNumber(user.bank)) user.bank = 0
if (!("level" in user) || !isNumber(user.level)) user.level = 0
if (!("health" in user) || !isNumber(user.health)) user.health = 100
if (!("genre" in user)) user.genre = ""
if (!("birth" in user)) user.birth = ""
if (!("marry" in user)) user.marry = ""
if (!("description" in user)) user.description = ""
if (!("packstickers" in user)) user.packstickers = null
if (!("premium" in user)) user.premium = false
if (!("premiumTime" in user)) user.premiumTime = 0
if (!("banned" in user)) user.banned = false
if (!("bannedReason" in user)) user.bannedReason = ""
if (!("commands" in user) || !isNumber(user.commands)) user.commands = 0
if (!("afk" in user) || !isNumber(user.afk)) user.afk = -1
if (!("afkReason" in user)) user.afkReason = ""
if (!("warn" in user) || !isNumber(user.warn)) user.warn = 0
} else global.db.data.users[m.sender] = {
name: m.name,
exp: 0,
coin: 0,
bank: 0,
level: 0,
health: 100,
genre: "",
birth: "",
marry: "",
description: "",
packstickers: null,
premium: false,
premiumTime: 0,
banned: false,
bannedReason: "",
commands: 0,
afk: -1,
afkReason: "",
warn: 0
}
const chat = global.db.data.chats[m.chat]
if (typeof chat !== "object") {
global.db.data.chats[m.chat] = {}
}
if (chat) {
if (!("isBanned" in chat)) chat.isBanned = false
if (!("isMute" in chat)) chat.isMute = false;
if (!("welcome" in chat)) chat.welcome = true
if (!("sWelcome" in chat)) chat.sWelcome = ""
if (!("sBye" in chat)) chat.sBye = ""
if (!("detect" in chat)) chat.detect = true
if (!("primaryBot" in chat)) chat.primaryBot = null
if (!("modoadmin" in chat)) chat.modoadmin = false
if (!("antiLink" in chat)) chat.antiLink = true
if (!("nsfw" in chat)) chat.nsfw = false
if (!("economy" in chat)) chat.economy = true;
if (!("gacha" in chat)) chat.gacha = true
} else global.db.data.chats[m.chat] = {
isBanned: false,
isMute: false,
welcome: true,
sWelcome: "",
sBye: "",
detect: true,
primaryBot: null,
modoadmin: false,
antiLink: true,
nsfw: false,
economy: true,
gacha: true
}
const settings = global.db.data.settings[this.user.jid]
if (typeof settings !== "object") {
global.db.data.settings[this.user.jid] = {}
}
if (settings) {
if (!("self" in settings)) settings.self = false
if (!("restrict" in settings)) settings.restrict = true
if (!("jadibotmd" in settings)) settings.jadibotmd = true
if (!("antiPrivate" in settings)) settings.antiPrivate = false
if (!("gponly" in settings)) settings.gponly = false
} else global.db.data.settings[this.user.jid] = {
self: false,
restrict: true,
jadibotmd: true,
antiPrivate: false,
gponly: false
}} catch (e) {
console.error(e)
}
if (typeof m.text !== "string") m.text = ""
const user = global.db.data.users[m.sender]
try {
const actual = user.name || ""
const nuevo = m.pushName || await this.getName(m.sender)
if (typeof nuevo === "string" && nuevo.trim() && nuevo !== actual) {
user.name = nuevo
}} catch {}
const chat = global.db.data.chats[m.chat]
const settings = global.db.data.settings[this.user.jid]  
const isROwner = [...global.owner.map((number) => number)].map(v => v.replace(/[^0-9]/g, "") + "@s.whatsapp.net").includes(m.sender)
const isOwner = isROwner || m.fromMe
const isPrems = isROwner || global.prems.map(v => v.replace(/[^0-9]/g, "") + "@s.whatsapp.net").includes(m.sender) || user.premium == true
const isOwners = [this.user.jid, ...global.owner.map((number) => number + "@s.whatsapp.net")].includes(m.sender)
if (settings.self && !isOwners) return
if (settings.gponly && !isOwners && !m.chat.endsWith('g.us') && !/code|p|ping|qr|estado|status|infobot|botinfo|report|reportar|invite|join|logout|suggest|help|menu/gim.test(m.text)) return

if (m.isBaileys) return
m.exp += Math.ceil(Math.random() * 10)

let usedPrefix
const groupMetadata = m.isGroup ? await this.groupMetadata(m.chat).catch(_ => null) : {}
const participants = (groupMetadata?.participants || []).map(p => ({ ...p, id: p.jid }))
const userGroup = participants.find(u => u.id === m.sender) || {}
const botGroup = participants.find(u => u.id === this.user.jid) || {}
const isRAdmin = userGroup?.admin == "superadmin" || false
const isAdmin = isRAdmin || userGroup?.admin == "admin" || false
const isBotAdmin = botGroup?.admin || false

const ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), "./plugins")

for (const name in global.plugins) {
const plugin = global.plugins[name]
if (!plugin || plugin.disabled) continue
const __filename = join(___dirname, name)

// FIX BEFORE (welcome no se rompe)
if (typeof plugin.before === "function") {
try {
await plugin.before.call(this, m, {
conn: this,
participants,
groupMetadata,
user,
chat,
settings
})
} catch (err) {
console.error(err)
}
}

// FIX PRIMARY BOT (NO BLOQUEA TODO)
if (chat.primaryBot && chat.primaryBot !== this.user.jid) {
const alive = global.conns.find(c => c.user?.jid === chat.primaryBot && c.ws?.socket?.readyState !== ws.CLOSED)

if (alive) continue // 🔥 antes tenías return (eso rompía todo)
else chat.primaryBot = null
}

// PREFIX COMPATIBLE (string, array, regex)
const strRegex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&")
const pluginPrefix = plugin.customPrefix || this.prefix || global.prefix

const match = (
pluginPrefix instanceof RegExp ?
pluginPrefix.exec(m.text) :
Array.isArray(pluginPrefix) ?
pluginPrefix.map(p => new RegExp(strRegex(p)).exec(m.text)).find(v => v) :
new RegExp(strRegex(pluginPrefix)).exec(m.text)
)

if (!match) continue

usedPrefix = match[0]
const noPrefix = m.text.slice(usedPrefix.length)
let [command, ...args] = noPrefix.trim().split(" ")
command = (command || "").toLowerCase()

const isAccept = plugin.command instanceof RegExp ?
plugin.command.test(command) :
Array.isArray(plugin.command) ?
plugin.command.includes(command) :
plugin.command === command

if (!isAccept) continue

// BOT OFF (BIEN)
if (chat.isBanned && !isROwner && !isAdmin && command !== "bot") {
m.reply(`ꕥ El bot *${botname}* está desactivado en este grupo\n\n> ✦ Un *administrador* puede activarlo con el comando:\n> » *${usedPrefix}bot on*`)
return
}

try {
await plugin.call(this, m, {
conn: this,
args,
command,
usedPrefix, // 🔥 esto faltaba (clave para setprimary)
isAdmin,
isOwner,
groupMetadata,
chat
})
} catch (err) {
console.error(err)
m.reply("Error")
 }

} catch (err) {
console.error(err)
} finally {
if (opts["queque"] && m.text) {
const quequeIndex = this.msgqueque.indexOf(m.id || m.key.id)
if (quequeIndex !== -1)
this.msgqueque.splice(quequeIndex, 1)
}

let user, stats = global.db.data.stats
if (m) {
if (m.sender && (user = global.db.data.users[m.sender])) {
user.exp += m.exp
}}

try {
if (!opts["noprint"]) await (await import("./lib/print.js")).default(m, this)
} catch (err) {
console.warn(err)
console.log(m.message)
}
}}

global.dfail = (type, m, conn) => {
 const msg = {
   rowner: ` ׄ 🍃 ׅ  𝙀𝙡 𝙘𝙤𝙢𝙖𝙣𝙙𝙤 *${comando}* 𝙨𝙤𝙡𝙤 𝙥𝙪𝙚𝙙𝙚 𝙨𝙚𝙧 𝙪𝙨𝙖𝙙𝙤 𝙥𝙤𝙧 𝙡𝙤𝙨 𝙘𝙧𝙚𝙖𝙙𝙤𝙧𝙚𝙨 𝙙𝙚𝙡 𝙗𝙤𝙩.`,

   owner: ` ׄ 🌾 ׅ  𝙀𝙡 𝙘𝙤𝙢𝙖𝙣𝙙𝙤 *${comando}* 𝙨𝙤𝙡𝙤 𝙥𝙪𝙚𝙙𝙚 𝙨𝙚𝙧 𝙪𝙨𝙖𝙙𝙤 𝙥𝙤𝙧 𝙡𝙤𝙨 𝙙𝙚𝙨𝙖𝙧𝙧𝙤𝙡𝙡𝙖𝙙𝙤𝙧𝙚𝙨 𝙙𝙚𝙡 𝙗𝙤𝙩.`,

   mods: ` ׄ 🍉 ׅ  𝙀𝙡 𝙘𝙤𝙢𝙖𝙣𝙙𝙤 *${comando}* 𝙨𝙤𝙡𝙤 𝙥𝙪𝙚𝙙𝙚 𝙨𝙚𝙧 𝙪𝙨𝙖𝙙𝙤 𝙥𝙤𝙧 𝙡𝙤𝙨 𝙢𝙤𝙙𝙚𝙧𝙖𝙙𝙤𝙧𝙚𝙨 𝙙𝙚𝙡 𝙗𝙤𝙩.`,

   premium: ` ׄ 🍋 ׅ  𝙀𝙡 𝙘𝙤𝙢𝙖𝙣𝙙𝙤 *${comando}* 𝙨𝙤𝙡𝙤 𝙥𝙪𝙚𝙙𝙚 𝙨𝙚𝙧 𝙪𝙨𝙖𝙙𝙤 𝙥𝙤𝙧 𝙡𝙤𝙨 𝙪𝙨𝙪𝙖𝙧𝙞𝙤𝙨 𝙥𝙧𝙚𝙢𝙞𝙪𝙢.`,

   group: ` ׄ 🌿 ׅ  𝙀𝙡 𝙘𝙤𝙢𝙖𝙣𝙙𝙤 *${comando}* 𝙨𝙤𝙡𝙤 𝙥𝙪𝙚𝙙𝙚 𝙨𝙚𝙧 𝙪𝙨𝙖𝙙𝙤 𝙚𝙣 𝙜𝙧𝙪𝙥𝙤𝙨.`,

   private: ` ׄ 🌀 ׅ  𝙀𝙡 𝙘𝙤𝙢𝙖𝙣𝙙𝙤 *${comando}* 𝙨𝙤𝙡𝙤 𝙥𝙪𝙚𝙙𝙚 𝙨𝙚𝙧 𝙪𝙨𝙖𝙙𝙤 𝙖𝙡 𝙘𝙝𝙖𝙩 𝙥𝙧𝙞𝙫𝙖𝙙𝙤 𝙙𝙚𝙡 𝙗𝙤𝙩.`,

   admin: ` ׄ 🎋 ׅ  𝙀𝙡 𝙘𝙤𝙢𝙖𝙣𝙙𝙤 *${comando}* 𝙨𝙤𝙡𝙤 𝙥𝙪𝙚𝙙𝙚 𝙨𝙚𝙧 𝙪𝙨𝙖𝙙𝙤 𝙥𝙤𝙧 𝙡𝙤𝙨 𝙖𝙙𝙢𝙞𝙣𝙨 𝙙𝙚𝙡 𝙜𝙧𝙪𝙥𝙤.`,

   botAdmin: ` ׄ 🚀 ׅ  𝙋𝙖𝙧𝙖 𝙚𝙟𝙚𝙘𝙪𝙩𝙖𝙧 𝙚𝙡 𝙘𝙤𝙢𝙖𝙣𝙙𝙤 *${comando}* 𝙙𝙚𝙗𝙤 𝙨𝙚𝙧 𝙖𝙙𝙢𝙞𝙣𝙞𝙨𝙩𝙧𝙖𝙙𝙤𝙧 𝙙𝙚𝙡 𝙜𝙧𝙪𝙥𝙤.`,

   restrict: `*_ ׄ ☁️ ׅ  Esta caracteristica está desactivada._*`
 }[type]
if (msg) return conn.reply(m.chat, msg, m, rcanal).then(_ => m.react('✖️'))
}

let file = global.__filename(import.meta.url, true)
watchFile(file, async () => {
unwatchFile(file)
console.log(chalk.magenta("Se actualizo 'handler.js'"))
if (global.reloadHandler) console.log(await global.reloadHandler())
})
