import { smsg } from "./lib/simple.js"
import { format } from "util"
import { fileURLToPath } from "url"
import path, { join } from "path"
import fs, { unwatchFile, watchFile } from "fs"
import chalk from "chalk"
import fetch from "node-fetch"
import ws from "ws"

const isNumber = x => typeof x === "number" && !isNaN(x)
const delay = ms => isNumber(ms) && new Promise(resolve => setTimeout(resolve, ms))

// Función para defaults de usuario
function defaultUser(sender, name) {
  return global.db.data.users[sender] ||= {
    name: name,
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
}

// Función para defaults de chat
function defaultChat(chatId) {
  return global.db.data.chats[chatId] ||= {
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
}

// Función para defaults de settings
function defaultSettings(jid) {
  return global.db.data.settings[jid] ||= {
    self: false,
    restrict: true,
    jadibotmd: true,
    antiPrivate: false,
    gponly: false
  }
}

export async function handler(chatUpdate) {
  this.msgqueque = this.msgqueque || []
  this.uptime = this.uptime || Date.now()
  if (!chatUpdate) return
  this.pushMessage(chatUpdate.messages).catch(console.error)

  let m = chatUpdate.messages[chatUpdate.messages.length - 1]
  if (!m) return

  if (global.db.data == null) await global.loadDatabase()

  try {
    m = smsg(this, m) || m
    if (!m) return

    m.exp = 0

    // Defaults
    const user = defaultUser(m.sender, m.name)
    const chat = defaultChat(m.chat)
    const settings = defaultSettings(this.user.jid)

    // Actualiza pushName si cambió
    try {
      const nuevo = m.pushName?.trim() || await this.getName(m.sender)
      if (nuevo && nuevo !== user.name) user.name = nuevo
    } catch {}

    // Permisos
    const isROwner = [...global.owner.map(n => n.replace(/[^0-9]/g, "") + "@s.whatsapp.net")].includes(m.sender)
    const isOwner = isROwner || m.fromMe
    const isPrems = isROwner || global.prems.map(v => v.replace(/[^0-9]/g, "") + "@s.whatsapp.net").includes(m.sender) || user.premium
    const isOwners = [this.user.jid, ...global.owner.map(n => n + "@s.whatsapp.net")].includes(m.sender)

    if (settings.self && !isOwners) return
    if (settings.gponly && !isOwners && !m.chat.endsWith('g.us') && !/code|p|ping|qr|estado|status|infobot|botinfo|report|reportar|invite|join|logout|suggest|help|menu/gim.test(m.text)) return

    // Cola de mensajes
    if (opts["queque"] && m.text && !isPrems) {
      const queque = this.msgqueque
      queque.push(m.id || m.key.id)
      await delay(5000)
      const index = queque.indexOf(m.id || m.key.id)
      if (index !== -1) queque.splice(index, 1)
    }

    if (m.isBaileys) return
    m.exp += Math.ceil(Math.random() * 10)

    // Metadata de grupo
    const groupMetadata = m.isGroup ? { ...(conn.chats[m.chat]?.metadata || await this.groupMetadata(m.chat).catch(() => ({}))) } : {}
    const participants = ((m.isGroup ? groupMetadata.participants : []) || []).map(p => ({ ...p, id: p.jid, jid: p.jid }))
    const userGroup = (m.isGroup ? participants.find(u => conn.decodeJid(u.jid) === m.sender) : {}) || {}
    const botGroup = (m.isGroup ? participants.find(u => conn.decodeJid(u.jid) == this.user.jid) : {}) || {}
    const isRAdmin = userGroup?.admin == "superadmin" || false
    const isAdmin = isRAdmin || userGroup?.admin == "admin" || false
    const isBotAdmin = botGroup?.admin || false

    // Primary Bot
    if (chat.primaryBot && chat.primaryBot !== this.user.jid) {
      const primaryBotConn = global.conns.find(c => c.user.jid === chat.primaryBot && c.ws.socket && c.ws.socket.readyState !== ws.CLOSED)
      const primaryBotInGroup = participants.some(p => p.jid === chat.primaryBot)
      if (primaryBotConn && primaryBotInGroup) return
      else chat.primaryBot = null
    }

    // Plugins
    const ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), "./plugins")
    for (const name in global.plugins) {
      const plugin = global.plugins[name]
      if (!plugin || plugin.disabled) continue

      const __filename = join(___dirname, name)

      if (typeof plugin.all === "function") {
        try {
          await plugin.all.call(this, m, { chatUpdate, __dirname: ___dirname, __filename, user, chat, settings })
        } catch (err) { console.error(err) }
      }

      // Prefijo
      const strRegex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&")
      const pluginPrefix = plugin.customPrefix || conn.prefix || global.prefix
      let match = [[[], new RegExp()]]
      try {
        if (pluginPrefix instanceof RegExp) match = [[pluginPrefix.exec(m.text), pluginPrefix]]
        else if (Array.isArray(pluginPrefix)) {
          match = pluginPrefix.map(p => [p instanceof RegExp ? p.exec(m.text) : new RegExp(strRegex(p)).exec(m.text), p]).find(f => f[0])
        }
        else match = [[new RegExp(strRegex(pluginPrefix)).exec(m.text), new RegExp(strRegex(pluginPrefix))]]
      } catch { match = [[[], new RegExp()]] }

      const usedPrefix = match[0][0] || ""
      const noPrefix = m.text.replace(usedPrefix, "")
      let [command, ...args] = noPrefix.trim().split(" ").filter(Boolean)
      args = args || []
      const _args = noPrefix.trim().split(" ").slice(1)
      const text = _args.join(" ")
      command = (command || "").toLowerCase()

      const fail = plugin.fail || global.dfail
      const isAccept = plugin.command instanceof RegExp ? plugin.command.test(command) :
                       Array.isArray(plugin.command) ? plugin.command.some(c => c instanceof RegExp ? c.test(command) : c === command) :
                       typeof plugin.command === "string" ? plugin.command === command : false

      if (!isAccept) continue
      m.plugin = name
      user.commands += 1

      // Ban y restricción
      const botId = this.user.jid
      const primaryBotId = chat.primaryBot
      if (chat.isBanned && !isROwner && (!primaryBotId || primaryBotId === botId)) {
        await m.reply(`ꕥ El bot está desactivado en este grupo\n> ✦ Actívalo con: ${usedPrefix}bot on`)
        return
      }
      if (user.banned && !isROwner && (!primaryBotId || primaryBotId === botId)) {
        await m.reply(`ꕥ Estás baneado, no puedes usar comandos\n> Razón: ${user.bannedReason}`)
        return
      }

      // Permisos
      if (plugin.rowner && !isROwner) { fail("rowner", m, this); continue }
      if (plugin.owner && !isOwner) { fail("owner", m, this); continue }
      if (plugin.premium && !isPrems) { fail("premium", m, this); continue }
      if (plugin.group && !m.isGroup) { fail("group", m, this); continue }
      if (plugin.botAdmin && !isBotAdmin) { fail("botAdmin", m, this); continue }
      if (plugin.admin && !isAdmin) { fail("admin", m, this); continue }
      if (plugin.private && m.isGroup) { fail("private", m, this); continue }

      // Ejecutar plugin
      m.isCommand = true
      m.exp += plugin.exp ? parseInt(plugin.exp) : 10
      const extra = { match, usedPrefix, noPrefix, _args, args, command, text, conn: this, participants, groupMetadata, userGroup, botGroup, isROwner, isOwner, isRAdmin, isAdmin, isBotAdmin, isPrems, chatUpdate, __dirname: ___dirname, __filename, user, chat, settings }

      try {
        await plugin.call(this, m, extra)
      } catch (err) {
        m.error = err
        console.error(`Plugin fallido: ${name}`, err)
      } finally {
        if (typeof plugin.after === "function") {
          try { await plugin.after.call(this, m, extra) } catch (err) { console.error(err) }
        }
      }
    }

  } catch (err) {
    console.error(err)
  } finally {
    // Limpiar cola
    if (opts["queque"] && m.text) {
      const quequeIndex = this.msgqueque.indexOf(m.id || m.key.id)
      if (quequeIndex !== -1) this.msgqueque.splice(quequeIndex, 1)
    }

    // Exp a stats
    try {
      const stats = global.db.data.stats
      if (m && m.sender && global.db.data.users[m.sender]) global.db.data.users[m.sender].exp += m.exp
    } catch {}

    // Print
    try {
      if (!opts["noprint"]) await (await import("./lib/print.js")).default(m, this)
    } catch (err) { console.warn(err); console.log(m.message) }
  }
}

// Watcher
let file = global.__filename(import.meta.url, true)
watchFile(file, async () => {
  unwatchFile(file)
  console.log(chalk.magenta("Se actualizó 'handler.js'"))
  if (typeof global.reloadHandler === "function") console.log(await global.reloadHandler())
})
