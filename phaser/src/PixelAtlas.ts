import type Phaser from 'phaser';

// Original project-drawn pixel sprites, not third-party packages.
// Every 16x16 texture is generated locally; no network fetch is needed.
export const TERRAIN_KINDS = ['grass', 'bush', 'tree', 'rock', 'water', 'bones'] as const;
export const ALLY_KINDS = ['guardian', 'ranger', 'mage', 'druid', 'cleric', 'runesmith'] as const;
export const ENEMY_KINDS = ['spear', 'archer', 'wolf', 'witch', 'shade', 'boss'] as const;
const S = 16;

type Brush = { box: (x:number,y:number,w:number,h:number,color:string)=>void; dot:(x:number,y:number,color:string)=>void };
const C = {
  ink:'#111a1c', skin:'#bc9379', light:'#e0c3a3',
  steel:'#afb6aa', iron:'#66757a', gold:'#dbb976',
  green:'#315342', leaf:'#629367', moss:'#8aaa76',
  burgundy:'#613643', crimson:'#aa5363', purple:'#675381',
  amethyst:'#b3a5dd', teal:'#78b6b6', fire:'#e7a267'
} as const;

function brush(ctx: CanvasRenderingContext2D): Brush {
  return {
    box(x,y,w,h,color) { ctx.fillStyle=color; ctx.fillRect(x,y,w,h); },
    dot(x,y,color) {ctx.fillStyle=color;ctx.fillRect(x,y,1,1);}
  };
}
function hash(value: number): number {
  let n=value|0;n=Math.imul(n^(n>>>16),0x7feb352d);
  n=Math.imul(n^(n>>>15),0x846ca68b);return (n^(n>>>16))>>>0;
}
function ground(p:Brush,kind:string,variation:number):void {
  const b=p.box, d=p.dot, seed=kind.length*379+variation*1031;
  b(0,0,16,16,kind==='water'?'#183b50':kind==='bones'?'#383732':kind==='rock'?'#333e3e':['#283a2c','#2a3d2e','#28382d','#22362a'][variation]);
  for(let n=0;n<22;n++){
    const h=hash(seed+n*43);
    d(h%16,(h>>>6)%15,kind==='water'?(n%3===0?'#3b7082':'#255368'):n%4===0?'#45664b':'#375039');
  }
  if(kind==='grass') {
    for(let n=0;n<7;n++){const x=hash(seed+n*97)%14+1,y=hash(seed+n*61+8)%13+1;
      b(x,y,1,2,n%3===0?'#7d9160':'#506f4d');}
  } else if(kind==='bush') {
    b(1,12,14,2,'#172b22');b(2,7,12,6,'#31543a');b(4,3,9,8,'#3b6946');
    b(6,1,5,5,'#467a50');b(1,8,5,3,'#598456');b(10,7,4,4,'#2c513c');
    b(7,4,2,2,'#79a26f');b(11,10,2,1,'#879f63');
  } else if(kind==='tree') {
    b(2,13,12,2,'#142720');b(7,8,3,6,'#5a4635');b(8,8,1,4,'#856347');
    b(5,8,8,3,'#244d35');b(3,5,11,5,'#315e3f');b(5,2,7,5,'#3c7148');
    b(7,0,4,4,'#47764c');b(4,6,3,3,'#61895e');b(8,3,3,2,'#82a26b');
  } else if(kind==='rock') {
    b(1,10,14,4,'#222e31');b(3,6,11,7,'#586563');b(4,4,8,6,'#7b817a');
    b(6,3,5,2,'#a6a396');b(10,7,3,3,'#3f5051');b(4,10,5,2,'#394445');
    b(8,5,1,4,'#c1bba3');
  } else if(kind==='water') {
    b(1,3,7,1,'#528596');b(10,6,5,1,'#649fac');b(0,11,9,1,'#427b8f');
    b(5,13,9,1,'#26536b');d(4,5,'#a3c6bc');d(14,9,'#99b8b3');
  } else if(kind==='bones') {
    b(1,11,14,4,'#48433c');b(2,6,6,4,'#65635a');b(7,3,6,7,'#7d796d');
    b(9,3,4,2,'#bbb09a');b(3,5,3,2,'#a69e84');b(11,9,3,4,'#363b3a');
    b(1,13,6,1,'#af9f84');
  }
  b(0,15,16,1,'#142522');
}
function humanoid(p:Brush,cloak:string):void {
  const b=p.box;
  b(3,13,10,2,C.ink);b(4,11,3,3,'#293034');b(9,11,3,3,'#293034');
  b(4,7,9,6,C.ink);b(5,8,7,5,cloak);b(4,9,3,4,cloak);b(10,9,3,4,cloak);
  b(5,4,7,5,C.ink);b(6,5,5,4,C.skin);b(7,7,1,1,C.ink);b(10,7,1,1,C.ink);
  b(7,9,3,2,'#3b3334');
}
function person(p:Brush,kind:string):void {
  const b=p.box;
  if(kind==='wolf'){
    b(1,12,13,2,C.ink);b(4,8,10,5,'#66676a');b(6,6,7,4,'#858487');
    b(2,7,6,5,'#7c8380');b(2,3,3,6,C.ink);b(3,4,2,4,'#aea79b');
    b(8,4,3,6,C.ink);b(9,5,2,4,'#a09a8e');b(4,12,3,3,'#394348');
    b(10,12,3,3,'#394348');b(4,8,1,2,C.gold);b(8,8,1,2,C.gold);
    return;
  }
  if(kind==='shade'){
    b(4,12,8,3,'#2b2c3e');b(3,9,10,5,'#49405e');b(4,4,8,8,C.purple);
    b(5,3,6,3,'#9280a6');b(6,7,2,1,'#e4c6ed');b(10,7,2,1,'#e4c6ed');
    b(2,11,2,3,'#584969');b(12,10,2,3,'#56405e');return;
  }
  const cloak:Record<string,string>={
    guardian:'#9f8260',ranger:'#355e4b',mage:'#5b4a83',druid:'#457452',
    cleric:'#bfa679',runesmith:'#784c40',
    spear:'#71404e',archer:'#5a364b',witch:'#674077',boss:'#723c55'
  };
  humanoid(p,cloak[kind]||'#655166');
  switch(kind){
    case 'guardian':
      b(5,3,7,4,C.iron);b(6,2,5,2,C.steel);b(8,1,2,2,C.gold);
      b(2,8,4,6,C.ink);b(3,9,3,4,C.gold);b(4,10,1,3,C.iron);
      b(12,6,1,8,C.steel);b(11,6,3,2,C.iron);break;
    case 'ranger':
      b(5,2,7,4,'#2b5140');b(4,4,2,4,'#2b5140');b(7,3,4,2,'#6c9460');
      b(12,4,1,11,C.gold);b(13,5,1,2,C.steel);b(11,7,2,1,'#c4b190');
      b(9,11,1,3,'#61885b');break;
    case 'mage':
      b(5,2,7,5,'#6e609c');b(7,0,4,4,C.amethyst);b(4,4,2,4,'#3d426e');
      b(13,5,1,10,'#aa8a69');b(12,3,3,3,C.teal);b(13,2,1,2,'#c8e6dc');
      b(7,11,4,2,C.amethyst);break;
    case 'druid':
      b(5,3,7,4,C.green);b(4,5,3,4,C.leaf);b(7,2,3,2,C.moss);
      b(1,4,2,11,'#705e46');b(0,3,4,3,C.leaf);b(1,1,2,3,C.moss);
      b(7,11,4,2,C.leaf);break;
    case 'cleric':
      b(5,2,7,5,'#e0d2a9');b(6,2,5,2,C.gold);b(4,5,2,4,'#ab956a');
      b(8,9,2,4,'#e0c180');b(7,10,4,2,C.gold);b(13,3,1,12,C.steel);
      b(11,5,5,2,C.gold);break;
    case 'runesmith':
      b(5,2,7,5,'#a37466');b(5,3,8,2,C.iron);b(6,4,6,2,C.steel);
      b(4,9,4,4,'#b45d54');b(7,10,3,1,'#e1b77d');
      b(13,6,1,9,C.gold);b(11,5,4,3,C.steel);break;
    case 'spear':
      b(6,3,6,4,'#63535c');b(5,2,8,2,C.iron);b(13,1,1,14,C.gold);
      b(12,0,3,3,C.steel);b(1,8,4,6,'#593a43');b(2,9,2,3,C.iron);break;
    case 'archer':
      b(5,2,7,4,'#4b354b');b(4,4,3,4,'#644459');
      b(13,4,1,10,C.gold);b(12,3,2,2,C.steel);b(10,10,4,1,'#a37f77');break;
    case 'witch':
      b(5,2,7,5,'#6e4b77');b(7,0,4,3,C.amethyst);b(5,4,1,4,'#4b3c58');
      b(1,3,2,12,'#9d86a2');b(0,2,4,3,C.purple);b(7,10,3,2,C.crimson);break;
    case 'boss':
      b(4,3,8,3,'#29222e');b(3,1,2,5,'#a76e8c');b(11,1,2,5,'#a76e8c');
      b(6,0,2,5,'#d19ba4');b(9,0,1,4,'#d19ba4');b(7,6,3,2,'#e0bdc0');
      b(1,7,3,8,'#7c465d');b(12,7,2,8,C.crimson);break;
  }
}
function register(scene:Phaser.Scene,key:string,draw:(p:Brush)=>void):void {
  if(scene.textures.exists(key))return;
  const c=document.createElement('canvas');c.width=S;c.height=S;
  const ctx=c.getContext('2d',{alpha:true});if(!ctx)throw new Error('Canvas2D unavailable');
  ctx.imageSmoothingEnabled=false;draw(brush(ctx));
  scene.textures.addCanvas(key,c);
}
export function installPixelAtlas(scene:Phaser.Scene):number {
  let count=0;
  for(const kind of TERRAIN_KINDS)for(let variant=0;variant<4;variant++){
    register(scene,'ironwood-ground-'+kind+'-'+variant,p=>ground(p,kind,variant));count++;
  }
  for(const kind of [...ALLY_KINDS,...ENEMY_KINDS]){
    register(scene,'ironwood-unit-'+kind,p=>person(p,kind));count++;
  }
  return count;
}
