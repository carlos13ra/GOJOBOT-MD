process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

import './config.js'
import { createRequire } from 'module'
import path, { join } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import { platform } from 'process'
import * as ws from 'ws'
import pino from 'pino'
import { Boom } from '@hapi/boom'
import fs from 'fs'
import readline from 'readline'
import NodeCache from 'node-cache'
import yargs from 'yargs'
import chalk from 'chalk'
import syntaxerror from 'syntax-error'
import fetch from 'node-fetch'
import lodash from 'lodash'

//══════════════════════//
//  IMPORTACIÓN ÚNICA   //
//══════════════════════//

const baileysModule = await import('@whiskeysockets/baileys')

const { default: baileysDefault } = baileysModule
const { proto } = baileysDefault

const {
    DisconnectReason,
    useMultiFileAuthState,
    MessageRetryMap,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    jidNormalizedUser,
    getContentType,
    makeInMemoryStore,
    PHONENUMBER_MCC,
} = baileysModule

//══════════════════════//

const { CONNECTING } = ws
const { chain } = lodash

const { CONNECTING: WA_CONNECTING } = ws

const { default: _makeWaSocket, makeWASocket } = baileysDefault

const { color } = await import('./lib/console.js')
const { smsg, sleep, makeWASocket: makeWASocketHelper } = await import('./lib/simple.js')

const store = makeInMemoryStore({
    logger: pino().child({ level: 'silent', stream: 'store' })
})

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
})

const question = (text) => new Promise((resolve) => rl.question(text, resolve))

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const require = createRequire(__dirname)

//════════════════════════════════════════════════════════════//
//                   PARÁMETROS DEL BOT                      //
//════════════════════════════════════════════════════════════//

const pairingCode = process.argv.includes('--pairing-code')
let useMobile = process.argv.includes('--mobile')
const singleFileAuth = process.argv.includes('--singleauth')
const useQr = process.argv.includes('--qr')
const useStore = process.argv.includes('--store')
const yargsCli = yargs(process.argv.slice(2)).exitProcess(false).parse()

let phoneNumber = ''

if (pairingCode && !useMobile) useMobile = true

const msgRetryCounterCache = new NodeCache()

//════════════════════════════════════════════════════════════//
//                    CONEXIÓN DEL BOT                        //
//════════════════════════════════════════════════════════════//

async function startBot() {

    const { state, saveCreds } = singleFileAuth
        ? await baileysModule.useSingleFileAuthState(global.authFile)
        : await useMultiFileAuthState(global.authFolder)

    const { version } = await fetchLatestBaileysVersion()

    const socketConfig = {
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: !pairingCode,
        browser: useMobile
            ? ['Ubuntu', 'Chrome', '20.0.04']
            : ['Chrome (Linux)', '', ''],
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino().child({ level: 'fatal', stream: 'store' })),
        },
        markOnlineOnConnect: true,
        syncFullHistory: true,
        defaultQueryTimeoutMs: undefined,
        getMessage: async (key) => {
            let msg = await store.loadMessage(key.remoteJid, key.id)
            return msg?.message || undefined
        },
        msgRetryCounterCache,
        generateHighQualityLinkPreview: true,
        shouldIgnoreJid: () => false,
    }

    const conn = makeWASocket(socketConfig)

    store?.bind(conn.ev)

    if (pairingCode && !conn.authState.creds.registered) {
        if (!phoneNumber) {
            phoneNumber = await question(color('| Código de emparejamiento | Ingresa tu número:', 'red'))
            phoneNumber = phoneNumber.replace(/[^0-9]/g, '')
        }

        setTimeout(async () => {
            let code = await conn.requestPairingCode(phoneNumber)
            code = code?.match(/.{1,4}/g)?.join('-') || code

            console.log(color(`✦ Código de emparejamiento: `, 'red'), color(code, 'white'))
        }, 3000)
    }

    conn.ev.on('messages.upsert', async (update) => {
        const m = update.messages[0]

        if (!m?.message || m.key.remoteJid === 'status@broadcast') return

        const msg = smsg(conn, m)

        await handleMessage(conn, msg)
    })

    conn.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update

        if (connection === 'close') {
            const reason = new Boom(lastDisconnect?.error)?.output.statusCode

            if (reason === DisconnectReason.connectionClosed) startBot()
            else if (reason === DisconnectReason.connectionLost) startBot()
            else if (reason === DisconnectReason.restartRequired) startBot()
            else if (reason === DisconnectReason.timedOut) startBot()
            else conn.logout()
        }

        if (connection === 'open') {
            console.log(color('⚡ Bot conectado correctamente ⚡', 'green'))
        }
    })

    conn.ev.on('creds.update', saveCreds)

    return conn
}

//════════════════════════════════════════════════════════════//
//                SISTEMA DE PLUGINS CORREGIDO                //
//════════════════════════════════════════════════════════════//

const pluginFolder = join(__dirname, './plugins/index')
const pluginFilter = (file) => /\.js$/.test(file)
global.plugins = {}

async function loadPlugins() {
    const files = fs.readdirSync(pluginFolder).filter(pluginFilter)
    console.log(color(`⌬ Cargando ${files.length} plugins...`, 'cyan'))

    for (const file of files) {
        const filepath = pathToFileURL(join(pluginFolder, file)).href

        try {
            const module = await import(filepath + '?update=' + Date.now())

            if (!module || typeof module !== 'object') continue

            global.plugins[file] = module.default || module

            console.log(color(`✔ Plugin cargado: ${file}`, 'green'))
        } catch (e) {
            console.log(color(`✘ Error al cargar plugin ${file}: ${e}`, 'red'))
        }
    }
}

async function watcher() {
    fs.watch(pluginFolder, async (event, filename) => {
        if (!pluginFilter(filename)) return

        console.log(color(`⌁ Cambio detectado en plugin: ${filename}`, 'yellow'))

        await loadPlugins()
    })
}

//════════════════════════════════════════════════════════════//
//                      MANEJO DE MENSAJES                    //
//════════════════════════════════════════════════════════════//

async function handleMessage(conn, m) {
    for (const name in global.plugins) {
        const plugin = global.plugins[name]

        try {
            if (plugin && typeof plugin === 'function') {
                await plugin(conn, m)
            }
        } catch (e) {
            console.error(color(`Error en plugin ${name}: ${e}`, 'red'))
        }
    }
}

//════════════════════════════════════════════════════════════//
//                           START                             //
//════════════════════════════════════════════════════════════//

await loadPlugins()
await watcher()
startBot()

//══════════════════════════════════════════════════════════════════════════════════════════════════════//
