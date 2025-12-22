function _0x4d67(_0x4434fd,_0x4d5886){const _0xa91055=_0xa910();return _0x4d67=function(_0x4d6757,_0x4482f8){_0x4d6757=_0x4d6757-0x153;let _0x4d72ba=_0xa91055[_0x4d6757];return _0x4d72ba;},_0x4d67(_0x4434fd,_0x4d5886);}
const _0x33a7f6=_0x4d67;
(function(_0xd6152f,_0xbcb842){
const _0x5bc5c2=_0x4d67,_0x360f4a=_0xd6152f();
while(!![]){
try{
const _0x567b86=
-parseInt(_0x5bc5c2(0x177))/0x1*(parseInt(_0x5bc5c2(0x197))/0x2)
+-parseInt(_0x5bc5c2(0x168))/0x3*(-parseInt(_0x5bc5c2(0x165))/0x4)
+parseInt(_0x5bc5c2(0x188))/0x5*(-parseInt(_0x5bc5c2(0x183))/0x6)
+-parseInt(_0x5bc5c2(0x172))/0x7*(parseInt(_0x5bc5c2(0x163))/0x8)
+-parseInt(_0x5bc5c2(0x174))/0x9
+parseInt(_0x5bc5c2(0x157))/0xa
+parseInt(_0x5bc5c2(0x181))/0xb*(parseInt(_0x5bc5c2(0x16d))/0xc);
if(_0x567b86===_0xbcb842)break;
else _0x360f4a.push(_0x360f4a.shift());
}catch{_0x360f4a.push(_0x360f4a.shift());}}
}(_0xa910,0xa0495));

import { promises as _0x41e875 } from 'fs';

const charactersFilePath='./lib/characters.json';

async function loadCharacters(){
const _0x38810a=_0x4d67,
_0x484d66=await _0x41e875[_0x38810a(0x17f)](charactersFilePath,_0x38810a(0x18e));
return JSON.parse(_0x484d66);
}

function flattenCharacters(_0x30b912){
const _0x4bf019=_0x4d67;
return Object[_0x4bf019(0x17a)](_0x30b912).flatMap(
_0x15c00d=>Array[_0x4bf019(0x15c)](_0x15c00d[_0x4bf019(0x153)])?_0x15c00d.characters:[]
);
}

const verifi=async()=>{
const _0x1839ed=_0x4d67;
try{
const _0xfc8c35=await _0x41e875[_0x1839ed(0x17f)]('./package.json',_0x1839ed(0x18e)),
_0x4b1529=JSON.parse(_0xfc8c35);
return _0x4b1529.repository?.url===_0x1839ed(0x18c);
}catch{return false;}
};

let handler=async(_0x3d2e06,{conn:_0xcf6e26,args:_0x95f554,usedPrefix:_0x5d18d8,command})=>{
const _0x33a651=_0x4d67;

if(!await verifi())
return _0xcf6e26.reply(
_0x3d2e06.chat,
'❀ El comando *'+command+'* solo está disponible para Kaneki Bot.\n> https://github.com/Carlos13ra/GOJOBOT-MD',
_0x3d2e06
);

try{
if(!global.db.data.characters)global.db.data.characters={};

let _0xd85d28=_0x3d2e06.mentionedJid,
_0x41a036=_0xd85d28&&_0xd85d28.length?_0xd85d28[0]:_0x3d2e06.sender;

const _0x2f5e54=await loadCharacters(),
_0x65dde0=flattenCharacters(_0x2f5e54);

const _0x55783c=Object.entries(global.db.data.characters)
.filter(([,c])=>(c.user||'').replace(/\D/g,'')===_0x41a036.replace(/\D/g,''))
.map(([id])=>id);

if(_0x55783c.length===0){
return _0xcf6e26.reply(
_0x3d2e06.chat,
'ꕥ No tienes personajes reclamados.',
_0x3d2e06
);
}

_0x55783c.sort((a,b)=>{
const ca=global.db.data.characters[a]||{},
cb=global.db.data.characters[b]||{};
return (cb.value||0)-(ca.value||0);
});

/* 🔥 AQUÍ ESTÁ EL FIX */
const _0x515552=parseInt(_0x95f554[0x0])||0x1;
/* 🔥 FIN DEL FIX */

const _0xd3e8fe=0x32,
_0x52506e=Math.ceil(_0x55783c.length/_0xd3e8fe);

const _0xeff6c7=(_0x515552-1)*_0xd3e8fe,
_0x140d59=Math.min(_0xeff6c7+_0xd3e8fe,_0x55783c.length);

let _0xffd830='✿ Personajes reclamados ✿\n';

for(let i=_0xeff6c7;i<_0x140d59;i++){
const id=_0x55783c[i],
info=_0x65dde0.find(x=>x.id===id)||{},
data=global.db.data.characters[id]||{};
_0xffd830+=
`ꕥ ${info.name||data.name||id}
» ID: ${id}
» Valor: ${(data.value||info.value||0).toLocaleString()}

`;
}

_0xffd830+=`\n⌦ _Página *${_0x515552} de ${_0x52506e}*_`;

await _0xcf6e26.reply(_0x3d2e06.chat,_0xffd830.trim(),_0x3d2e06);

}catch(e){
await _0xcf6e26.reply(
_0x3d2e06.chat,
'⚠︎ Se ha producido un problema.\nUsa *'+_0x5d18d8+'report*\n\n'+e.message,
_0x3d2e06
);
}
};

handler.help=['harem','claims','waifus'];
handler.tags=['anime'];
handler.command=['harem','claims','waifus'];
handler.group=true;

export default handler;

function _0xa910(){
return [
'repository','min','ꕥ *','ID:','users','sender','value',
'No tienes personajes reclamados.','length','quoted',
'readFile','Personajes reclamados','split','filter','git+https://github.com/Carlos13ra/GOJOBOT-MD.git',
'utf-8','reply','data','number','name','characters'
];
}
