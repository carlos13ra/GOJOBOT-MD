import fs from 'fs'
const file = './lib/reinos.json'
let data = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file)) : {}

function save() {
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
}

function baseDamage() {
  return Math.floor(Math.random() * 20) + 10
}

export default async function handler(m, { conn, args }) {
  const chat = m.chat

  if (!data[chat]) {
    data[chat] = {
      king: null,
      clans: {
        A: { name: 'Clan Fuego', general: null, members: {} },
        B: { name: 'Clan Sombra', general: null, members: {} }
      },
      players: {}
    }
  }

  const game = data[chat]
  const user = m.sender

  // ================= UNIRSE =================
  if (args[0] === 'unir') {
    if (game.players[user]) return conn.reply(chat, 'Ya estás en el reino', m)

    game.players[user] = {
      hp: 100,
      gold: 100,
      power: 'ninguno',
      weapon: 'puños',
      clan: null,
      rank: 'recluta',
      position: 'civil'
    }
    save()
    return conn.reply(chat,
      '⚔️ Bienvenido al Reino de Góticas\n💰 100 góticas\nUsa: .reino clan A o B', m)
  }

  const p = game.players[user]
  if (!p) return

  // ================= CLAN =================
  if (args[0] === 'clan') {
    const c = args[1]
    if (!['A','B'].includes(c)) return

    p.clan = c
    game.clans[c].members[user] = 'recluta'

    if (!game.clans[c].general) {
      game.clans[c].general = user
      p.rank = 'general'
    }

    if (!game.king) {
      game.king = user
      p.rank = 'rey'
    }

    save()
    return conn.reply(chat, `🏰 Entraste al ${game.clans[c].name}\n🎖 Rango: ${p.rank}`, m)
  }

  // ========== RENOMBRAR CLAN ==========
  if (args[0] === 'clannombre') {
    if (p.rank !== 'rey') return conn.reply(chat, 'Solo el Rey puede cambiar nombres', m)
    const c = args[1]
    const name = args.slice(2).join(' ')
    if (!['A','B'].includes(c) || !name) return
    game.clans[c].name = name
    save()
    return conn.reply(chat, `🏰 Clan ${c} ahora se llama ${name}`, m)
  }

  // ================= PERFIL =================
  if (args[0] === 'perfil') {
    return conn.reply(chat,
      `🧾 PERFIL\n❤️ Vida: ${p.hp}\n💰 Góticas: ${p.gold}\n🏰 Clan: ${game.clans[p.clan]?.name}\n🎖 Rango: ${p.rank}\n🎭 Posición: ${p.position}\n✨ Poder: ${p.power}\n⚔️ Arma: ${p.weapon}`, m)
  }

  // ================= POSICION =================
  if (args[0] === 'posicion') {
    p.position = args[1]
    save()
    return conn.reply(chat, `🎭 Ahora eres ${args[1]}`, m)
  }

  // ================= PODER =================
  if (args[0] === 'poder') {
    p.power = args[1]
    save()
    return conn.reply(chat, `✨ Poder equipado: ${args[1]}`, m)
  }

  // ================= TIENDA =================
  if (args[0] === 'tienda') {
    return conn.reply(chat,
      '🛒 TIENDA\n🗡 espada - 100 góticas\n🔫 rifle - 200 góticas', m)
  }

  // ================= COMPRAR =================
  if (args[0] === 'comprar') {
    if (args[1] === 'espada' && p.gold >= 100) {
      p.gold -= 100
      p.weapon = 'espada'
    } else if (args[1] === 'rifle' && p.gold >= 200) {
      p.gold -= 200
      p.weapon = 'rifle'
    } else return conn.reply(chat, 'No tienes suficientes góticas', m)

    save()
    return conn.reply(chat, `🛒 Compraste ${args[1]}`, m)
  }

  // ================= CURAR =================
  if (args[0] === 'curar') {
    if (p.power !== 'cura') return

    let heal = Math.floor(Math.random() * 30) + 20
    if (p.position === 'mago') heal += 10
    p.hp += heal
    if (p.hp > 100) p.hp = 100

    save()
    return conn.reply(chat, `💚 +${heal} vida\n❤️ ${p.hp}`, m)
  }

  // ================= ATACAR =================
  if (args[0] === 'atacar') {
    const target = m.mentionedJid[0]
    if (!target || !game.players[target]) return

    const t = game.players[target]
    let dmg = baseDamage()

    if (p.weapon === 'espada') dmg += 10
    if (p.weapon === 'rifle') dmg += 20
    if (p.power === 'fuego') dmg += 10
    if (p.power === 'rayo') dmg += 15
    if (p.position === 'delantero') dmg += 10
    if (p.position === 'asesino') dmg += 5
    if (p.rank === 'rey') dmg += 15
    if (t.position === 'defensor') dmg *= 0.7

    dmg = Math.floor(dmg)
    t.hp -= dmg

    let msg = `⚔️ @${target.split('@')[0]} recibió ${dmg}\n❤️ Vida: ${t.hp}`

    // ===== GUERRA POR EL TRONO =====
    if (t.hp <= 0) {
      if (target === game.king) {
        game.king = user
        p.rank = 'rey'
        msg += '\n👑 ¡El trono fue conquistado!'
      }

      delete game.players[target]
      p.gold += 50
      msg += '\n🏆 Fue derrotado\n💰 +50 góticas'
    }

    save()
    return conn.sendMessage(chat, { text: msg, mentions: [target] }, { quoted: m })
  }
}

handler.command = ['reino']
handler.group = true
