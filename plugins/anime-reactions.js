import fetch from 'node-fetch'

const captions = {
  angry: (from, to, genero) => from === to? `está muy ${genero === 'Hombre'? 'enojado' : genero === 'Mujer'? 'enojada' : 'enojadx'}.` : `está super ${genero === 'Hombre'? 'enojado' : genero === 'Mujer'? 'enojada' : 'enojadx'} con`,
  bleh: (from, to) => from === to? 'se sacó la lengua frente al espejo.' : 'le está haciendo muecas con la lengua a',
  bored: (from, to, genero) => from === to? `está muy ${genero === 'Hombre'? 'aburrido' : genero === 'Mujer'? 'aburrida' : 'aburridx'}.` : `está ${genero === 'Hombre'? 'aburrido' : genero === 'Mujer'? 'aburrida' : 'aburridx'} de`,
  clap: (from, to) => (from === to? 'está aplaudiendo por algo.' : 'está aplaudiendo por'),
  coffee: (from, to) => (from === to? 'está tomando café.' : 'está tomando café con'),
  dramatic: (from, to) => from === to? 'está haciendo un drama exagerado.' : 'le está haciendo un drama a',
  drunk: (from, to, genero) => from === to? `está demasiado ${genero === 'Hombre'? 'borracho' : genero === 'Mujer'? 'borracha' : 'borrachx'}` : `está ${genero === 'Hombre'? 'borracho' : genero === 'Mujer'? 'borracha' : 'borrachx'} con`,
  cold: (from, to, genero) => (from === to? 'tiene mucho frío.' : 'se congela por el frío de'),
  impregnate: (from, to) => (from === to? 'se embarazó.' : 'embarazó a'),
  kisscheek: (from, to) => from === to? 'se besó en la mejilla usando un espejo.' : 'le dio un beso en la mejilla a',
  laugh: (from, to) => (from === to? 'se está riendo de algo.' : 'se está burlando de'),
  love: (from, to, genero) => from === to? `se quiere mucho a sí ${genero === 'Hombre'? 'mismo' : genero === 'Mujer'? 'misma' : 'mismx'}.` : 'siente atracción por',
  pout: (from, to, genero) => from === to? `está haciendo pucheros ${genero === 'Hombre'? 'solo' : genero === 'Mujer'? 'sola' : 'solx'}.` : 'está haciendo pucheros con',
  punch: (from, to) => (from === to? 'lanzó un puñetazo al aire.' : 'le dio un puñetazo a'),
  run: (from, to) => (from === to? 'está corriendo por su vida.' : 'está corriendo con'),
  sad: (from, to) => (from === to? `está triste` : `está expresando su tristeza a`),
  scared: (from, to, genero) => from === to? `está ${genero === 'Hombre'? 'asustado' : genero === 'Mujer'? 'asustada' : 'asustxd'} por algo.` : `está ${genero === 'Hombre'? 'asustado' : genero === 'Mujer'? 'asustada' : 'asustxd'} por`,
  seduce: (from, to, genero) => from === to? 'lanzó una mirada seductora al vacío.' : 'está intentando seducir a',
  shy: (from, to, genero) => from === to? `se sonrojó tímidamente y desvió la mirada.` : `se siente demasiado ${genero === 'Hombre'? 'tímido' : genero === 'Mujer'? 'tímida' : 'tímide'} para mirar a`,
  sleep: (from, to, genero) => from === to? 'está durmiendo plácidamente.' : 'está durmiendo con',
  smoke: (from, to) => (from === to? 'está fumando tranquilamente.' : 'está fumando con'),
  spit: (from, to, genero) => from === to? `se escupió a sí ${genero === 'Hombre'? 'mismo' : genero === 'Mujer'? 'misma' : 'mismx'} por accidente.` : 'le escupió a',
  step: (from, to, genero) => from === to? `se pisó a sí ${genero === 'Hombre'? 'mismo' : genero === 'Mujer'? 'misma' : 'mismx'} por accidente.` : 'está pisando a',
  think: (from, to) => from === to? 'está pensando profundamente.' : 'no puede dejar de pensar en',
  walk: (from, to) => (from === to? 'salió a caminar en soledad.' : 'decidió dar un paseo con'),
  hug: (from, to, genero) => from === to? `se abrazó a sí ${genero === 'Hombre'? 'mismo' : genero === 'Mujer'? 'misma' : 'mismx'}.` : 'le dio un abrazo a',
  kill: (from, to) => (from === to? 'se autoeliminó en modo dramático.' : 'asesinó a'),
  eat: (from, to) => (from === to? 'está comiendo algo delicioso.' : 'está comiendo con'),
  kiss: (from, to) => (from === to? 'se mandó un beso al aire.' : 'le dio un beso a'),
  wink: (from, to, genero) => from === to? `se guiñó a sí ${genero === 'Hombre'? 'mismo' : genero === 'Mujer'? 'misma' : 'mismx'} en el espejo.` : 'le guiñó a',
  pat: (from, to) => (from === to? 'se acarició la cabeza con ternura.' : 'le dio una caricia a'),
  happy: (from, to) => (from === to? 'está feliz.' : 'está feliz con'),
  bully: (from, to, genero) => from === to? `se hace bullying ${genero === 'Hombre'? 'el mismo' : genero === 'Mujer'? 'ella misma' : 'el/ella mismx'}… alguien ${genero === 'Hombre'? 'que lo abrace' : genero === 'Mujer'? 'que la abrace' : `que ${genero === 'Hombre'? 'lo' : genero === 'Mujer'? 'la' : 'lx'} ayude`}.` : 'le está haciendo bullying a',
  bite: (from, to, genero) => from === to? `se mordió ${genero === 'Hombre'? 'solito' : genero === 'Mujer'? 'solita' : 'solitx'}.` : 'mordió a',
  blush: (from, to) => (from === to? 'se sonrojó.' : 'se sonrojó por'),
  wave: (from, to, genero) => from === to? `se saludó a sí ${genero === 'Hombre'? 'mismo' : genero === 'Mujer'? 'misma' : 'mismx'} en el espejo.` : 'está saludando a',
  bath: (from, to) => (from === to? 'se está bañando.' : 'está bañando a'),
  smug: (from, to) => (from === to? 'está presumiendo mucho últimamente.' : 'está presumiendo a'),
  smile: (from, to) => (from === to? 'está sonriendo.' : 'le sonrió a'),
  highfive: (from, to) => from === to? 'se chocó los cinco frente al espejo.' : 'chocó los 5 con',
  handhold: (from, to, genero) => from === to? `se dio la mano consigo ${genero === 'Hombre'? 'mismo' : genero === 'Mujer'? 'misma' : 'mismx'}.` : 'le agarró la mano a',
  cringe: (from, to) => (from === to? 'siente cringe.' : 'siente cringe por'),
  bonk: (from, to, genero) => from === to? `se dio un bonk a sí ${genero === 'Hombre'? 'mismo' : genero === 'Mujer'? 'misma' : 'mismx'}.` : 'le dio un golpe a',
  cry: (from, to) => (from === to? 'está llorando.' : 'está llorando por'),
  lick: (from, to) => (from === to? 'se lamió por curiosidad.' : 'lamió a'),
  slap: (from, to, genero) => from === to? `se dio una bofetada a sí ${genero === 'Hombre'? 'mismo' : genero === 'Mujer'? 'misma' : 'mismx'}.` : 'le dio una bofetada a',
  dance: (from, to) => (from === to? 'está bailando.' : 'está bailando con'),
  cuddle: (from, to, genero) => from === to? `se acurrucó ${genero === 'Hombre'? 'solo' : genero === 'Mujer'? 'sola' : 'solx'}.` : 'se acurrucó con',
}

const alias = {
  angry: ['angry','enojado','enojada'],
  bleh: ['bleh'],
  bored: ['bored','aburrido','aburrida'],
  clap: ['clap','aplaudir'],
  coffee: ['coffee','cafe','café'],
  dramatic: ['dramatic','drama'],
  drunk: ['drunk','borracho'],
  cold: ['cold'],
  impregnate: ['impregnate','preg','preñar','embarazar'],
  kisscheek: ['kisscheek','beso','besar'],
  laugh: ['laugh','reirse'],
  love: ['love','amor','enamorado','enamorada'],
  pout: ['pout','pucheros'],
  punch: ['punch','golpear','pegar'],
  run: ['run','correr'],
  sad: ['sad','triste'],
  scared: ['scared','asustado','asustada'],
  seduce: ['seduce','seducir'],
  shy: ['shy','timido','timida'],
  sleep: ['sleep','dormir'],
  smoke: ['smoke','fumar'],
  spit: ['spit','escupir'],
  step: ['step','pisar'],
  think: ['think','pensar'],
  walk: ['walk','caminar'],
  hug: ['hug','abrazar'],
  kill: ['kill','matar'],
  eat: ['eat','comer'],
  kiss: ['kiss','muak','besar'],
  wink: ['wink','guiñar'],
  pat: ['pat','acariciar','palmadita','palmada'],
  happy: ['happy','feliz'],
  bully: ['bully','molestar','bullying'],
  bite: ['bite','morder'],
  blush: ['blush','sonrojarse'],
  wave: ['wave','saludar','hola','ola'],
  bath: ['bath','bañarse'],
  smug: ['smug','presumir'],
  smile: ['smile','sonreir'],
  highfive: ['highfive','5','choca'],
  handhold: ['handhold','mano','tomar'],
  cringe: ['cringe','avergonzarse'],
  bonk: ['bonk','golpe'],
  cry: ['cry','llorar'],
  lick: ['lick','lamer'],
  slap: ['slap','bofetada'],
  dance: ['dance','bailar'],
  cuddle: ['cuddle','acurrucar','acurrucarse'],
}

const symbols = ['(⁠◠⁠‿⁠◕⁠)', '˃͈◡˂͈', '૮(˶ᵔᵕᵔ˶)ა', '(づ｡◕‿‿◕｡)づ', '(✿◡‿◡)', '(꒪⌓꒪)', '(✿✪‿✪｡)', '(*≧ω≦)', '(✧ω◕)', '˃ 𖥦 ˂', '(⌒‿⌒)', '(¬‿¬)', '(✧ω✧)', '✿(◕ ‿◕)✿', 'ʕ•́ᴥ•̀ʔっ', '(ㅇㅅㅇ❀)', '(∩︵∩)', '(✪ω✪)', '(✯◕‿◕✯)', '(•̀ᴗ•́)و ̑̑']
const getRandomSymbol = () => symbols[Math.floor(Math.random() * symbols.length)]

let handler = async (m, { conn, command }) => {
let mentionedJid = m.mentionedJid
let userId = mentionedJid.length > 0? mentionedJid[0] : (m.quoted? m.quoted.sender : m.sender)

let from = global.db.data.users[m.sender]?.name || await conn.getName(m.sender) || m.sender.split('@')[0]
let who = global.db.data.users[userId]?.name || await conn.getName(userId) || userId.split('@')[0]
let genero = global.db.data.users[userId]?.genero || 'Desconocido'
let action = Object.keys(alias).find(key => alias[key].includes(command))

if (!action ||!captions[action]) return

let captionFn = captions[action]
let str = `\`${from}\` ${captionFn(from, who, genero)} ${from!== who? `\`${who}\`` : ''} ${getRandomSymbol()}`

try {
const res = await fetch(`${global.APIs.light.url}/reaction/${action}`)
const json = await res.json()

if (!json.status ||!json.data?.dl) return m.reply('ꕥ No se encontró el gif.')

conn.sendMessage(m.chat, {
  video: { url: json.data.dl },
  gifPlayback: true,
  caption: str,
  mentions: [userId]
}, { quoted: m })

} catch (e) {
return m.reply(`⚠︎ Error en la API\n${e.message}`)
}}

handler.help = ['angry','enojado','enojada','bleh','bored','aburrido','aburrida','clap','aplaudir','coffee','cafe','dramatic','drama','drunk','cold','impregnate','preg','preñar','embarazar','kisscheek','beso','besar','laugh','love','amor','pout','mueca','punch','golpear','run','correr','sad','triste','scared','asustado','seduce','seducir','shy','timido','timida','sleep','dormir','smoke','fumar','spit','escupir','step','pisar','think','pensar','walk','caminar','hug','abrazar','kill','matar','eat','nom','comer','kiss','muak','wink','guiñar','pat','acariciar','happy','feliz','bully','molestar','bite','morder','blush','sonrojarse','wave','saludar','bath','bañarse','smug','presumir','smile','sonreir','highfive','choca','handhold','tomar','cringe','mueca','bonk','golpe','cry','llorar','lick','lamer','slap','bofetada','dance','bailar','cuddle','acurrucar','sing','cantar','tickle','cosquillas','scream','gritar','push','empujar','nope','no','jump','saltar','heat','calor','gaming','jugar','draw','dibujar','call','llamar','snuggle','acurrucarse','blowkiss','besito','trip','tropezar','stare','mirar','sniff','oler','curious','curioso','curiosa','thinkhard','pensar','comfort','consolar','peek','mirar']
handler.tags = ['anime']
handler.command = ['angry','enojado','enojada','bleh','bored','aburrido','aburrida','clap','aplaudir','coffee','cafe','dramatic','drama','drunk','cold','impregnate','preg','preñar','embarazar','kisscheek','beso','besar','laugh','love','amor','pout','mueca','punch','golpear','run','correr','sad','triste','scared','asustado','seduce','seducir','shy','timido','timida','sleep','dormir','smoke','fumar','spit','escupir','step','pisar','think','pensar','walk','caminar','hug','abrazar','kill','matar','eat','nom','comer','kiss','muak','wink','guiñar','pat','acariciar','happy','feliz','bully','molestar','bite','morder','blush','sonrojarse','wave','saludar','bath','bañarse','smug','presumir','smile','sonreir','highfive','choca','handhold','tomar','cringe','mueca','bonk','golpe','cry','llorar','lick','lamer','slap','bofetada','dance','bailar','cuddle','acurrucar','sing','cantar','tickle','cosquillas','scream','gritar','push','empujar','nope','no','jump','saltar','heat','calor','gaming','jugar','draw','dibujar','call','llamar','snuggle','acurrucarse','blowkiss','besito','trip','tropezar','stare','mirar','sniff','oler','curious','curioso','curiosa','thinkhard','pensar','comfort','consolar','peek','mirar']
handler.group = true

export default handler