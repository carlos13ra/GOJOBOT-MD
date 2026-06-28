import fetch from 'node-fetch'

const captions = {      
  anal: (from, to) => from === to ? 'se la metió en el ano.' : 'se la metió en el ano a',
  cum: (from, to) => from === to ? 'se vino dentro de... Omitiremos eso.' : 'se vino dentro de',
  undress: (from, to) => from === to ? 'se está quitando la ropa' : 'le está quitando la ropa a',
  fuck: (from, to) => from === to ? 'se entrega al deseo' : 'se está cogiendo a',
  spank: (from, to) => from === to ? 'está dando una nalgada' : 'le está dando una nalgada a',
  lickpussy: (from, to) => from === to ? 'está lamiendo un coño' : 'le está lamiendo el coño a',
  fap: (from, to) => from === to ? 'se está masturbando' : 'se está masturbando pensando en',
  grope: (from, to) => from === to ? 'se lo está manoseando' : 'se lo está manoseando a',
  sixnine: (from, to) => from === to ? 'está haciendo un 69' : 'está haciendo un 69 con',
  suckboobs: (from, to) => from === to ? 'está chupando unas ricas tetas' : 'le está chupando las tetas a',
  grabboobs: (from, to) => from === to ? 'está agarrando unas tetas' : 'le está agarrando las tetas a',
  blowjob: (from, to) => from === to ? 'está dando una rica mamada' : 'le dio una mamada a',
  boobjob: (from, to) => from === to ? 'esta haciendo una rusa' : 'le está haciendo una rusa a',
  footjob: (from, to) => from === to ? 'está haciendo una paja con los pies' : 'le está haciendo una paja con los pies a',
  yuri: (from, to) => from === to ? 'está haciendo tijeras!' : 'hizo tijeras con',
  cummouth: (from, to) => from === to ? 'está llenando la boca de alguien con cariño' : 'está llenando la boca de',
  cumshot: (from, to) => from === to ? 'se la metió a alguien y ahora viene el regalo' : 'le dio un regalo sorpresa a',
  handjob: (from, to) => from === to ? 'le da una paja a alguien con cariño' : 'le está haciendo una paja a',
  lickass: (from, to) => from === to ? 'saborea un culo sin detenerse' : 'le está lamiendo el culo a',
  lickdick: (from, to) => from === to ? 'chupa con ganas un pene' : 'se la mete todo en la boca para',
  fingering: (from, to) => from === to ? 'se está metiendo los dedos' : 'le está metiendo los dedos a',
  creampie: (from, to) => from === to ? 'terminó dentro sin avisar...' : 'terminó dentro de',
  facesitting: (from, to) => from === to ? 'está sentándose en una cara' : 'se sentó en la cara de',
  deepthroat: (from, to) => from === to ? 'se la traga hasta el fondo' : 'le está haciendo una garganta profunda a',
  thighjob: (from, to) => from === to ? 'está frotando entre los muslos' : 'le está haciendo una entre piernas a',
  bondage: (from, to) => from === to ? 'está atado y sin escapatoria...' : 'ató bien amarrado a',
  pegging: (from, to) => from === to ? 'está recibiendo lo que no esperaba' : 'le está dando por detrás a',
  futanari: (from, to) => from === to ? 'tiene lo mejor de los dos mundos' : 'le demostró lo que tiene a',
  yaoi: (from, to) => from === to ? 'está disfrutando de un momento muy intenso' : 'se lo pasó genial con',
  bukkake: (from, to) => from === to ? 'terminó solo... de una forma muy especial' : 'invitó a sus amigos a acabar encima de',
  orgy: (from, to) => from === to ? 'está en una orgía' : 'organizó una orgía con',
  squirting: (from, to) => from === to ? 'llegó al límite y se vino con todo' : 'la llevó al límite hasta que se vino con todo'
}

const symbols = ['(⁠◠⁠‿⁠◕⁠)', '˃͈◡˂͈', '૮(˶ᵔᵕᵔ˶)ა', '(づ｡◕‿‿◕｡)づ', '(✿◡‿◡)', '(꒪⌓꒪)', '(✿✪‿✪｡)', '(*≧ω≦)', '(✧ω◕)', '˃ 𖥦 ˂', '(⌒‿⌒)', '(¬‿¬)', '(✧ω✧)', '✿(◕ ‿◕)✿', 'ʕ•́ᴥ•̀ʔっ', '(ㅇㅅㅇ❀)', '(∩︵∩)', '(✪ω✪)', '(✯◕‿◕✯)', '(•̀ᴗ•́)و ̑̑']

function getRandomSymbol() {
  return symbols[Math.floor(Math.random() * symbols.length)]
}

const endpointMap = {
  cummouth: 'cummoth'
}

const alias = {
  anal: ['anal','violar'],
  cum: ['cum'],
  undress: ['undress','encuerar'],
  fuck: ['fuck','coger'],
  spank: ['spank','nalgada'],
  lickpussy: ['lickpussy'],
  fap: ['fap','paja'],
  grope: ['grope'],
  sixnine: ['sixnine','69'],
  suckboobs: ['suckboobs'],
  grabboobs: ['grabboobs'],
  blowjob: ['blowjob','mamada','bj'],
  boobjob: ['boobjob'],
  yuri: ['yuri','tijeras'],
  footjob: ['footjob'],
  cummouth: ['cummouth','cummoth'],
  cumshot: ['cumshot'],
  handjob: ['handjob'],
  lickass: ['lickass'],
  lickdick: ['lickdick'],
  fingering: ['fingering'],
  creampie: ['creampie'],
  facesitting: ['facesitting'],
  deepthroat: ['deepthroat'],
  thighjob: ['thighjob'],
  bondage: ['bondage'],
  pegging: ['pegging'],
  futanari: ['futanari','futa'],
  yaoi: ['yaoi'],
  bukkake: ['bukkake'],
  orgy: ['orgy','orgia'],
  squirting: ['squirt','squirting']
}

let handler = async (m, { conn, usedPrefix, command }) => {
  try {
    const currentCommand = Object.keys(alias).find(key => alias[key].includes(command)) || command

    if (!captions[currentCommand]) {
      await m.react('✖️')
      return
    }

    const who = m.mentionedJid?.[0] || m.quoted?.sender || m.sender
    const fromName = m.pushName || '@' + m.sender.split('@')[0]
    const toName = m.mentionedJid?.[0]
      ? '@' + (m.mentionedJid[0].split('@')[0])
      : m.quoted?.pushName || '@' + who.split('@')[0]

    const captionText = captions[currentCommand](fromName, toName)
    const caption = who !== m.sender
      ? `\`${fromName}\` ${captionText} \`${toName}.\` ${getRandomSymbol()}.`
      : `\`${fromName}\` ${captionText} ${getRandomSymbol()}.`

    const apiEndpoint = endpointMap[currentCommand] || currentCommand
    const apiUrl = `${global.APIs.light.url}/reaction/nsfw/${apiEndpoint}`
    const response = await fetch(apiUrl)
    const data = await response.json()

    if (!data.data?.dl) {
      await m.react('✖️')
      return conn.reply(m.chat, `⚠︎ No se pudo obtener el contenido.`, m)
    }

    await conn.sendMessage(m.chat, {
      video: { url: data.data.dl },
      gifPlayback: true,
      caption,
      mentions: [who, m.sender]
    }, { quoted: m })

    await m.react('✔️')
  } catch (e) {
    await m.react('✖️')
    await conn.reply(m.chat, `⚠︎ Se ha producido un problema.\n> Usa *${usedPrefix}report* para informarlo.\n\n${e.message}`, m)
  }
}

handler.help = ['anal','violar','cum','undress','encuerar','fuck','coger','spank','nalgada','lickpussy','fap','paja','grope','sixnine','69','suckboobs','grabboobs','blowjob','mamada','bj','boobjob','yuri','tijeras','footjob','cummouth','cumshot','handjob','lickass','lickdick','fingering','creampie','facesitting','deepthroat','thighjob','bondage','pegging','futanari','futa','yaoi','bukkake','orgy','orgia','squirt','squirting']
handler.tags = ['nsfw']
handler.command = ['anal','violar','cum','undress','encuerar','fuck','coger','spank','nalgada','lickpussy','fap','paja','grope','sixnine','69','suckboobs','grabboobs','blowjob','mamada','bj','boobjob','yuri','tijeras','footjob','cummouth','cumshot','handjob','lickass','lickdick','fingering','creampie','facesitting','deepthroat','thighjob','bondage','pegging','futanari','futa','yaoi','bukkake','orgy','orgia','squirt','squirting']
handler.group = true

export default handler