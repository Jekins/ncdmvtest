const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const questions = vm.runInNewContext(html.match(/const QUESTIONS = \[([\s\S]*?)\n\];/)[0]+';QUESTIONS');
const ctx = {window:{matchMedia:()=>({matches:false})}};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root,'road-scenarios.js'),'utf8'),ctx);
const source=fs.readFileSync(path.join(root,'road-scenes.js'),'utf8');
// Load the pure storyboard builders without invoking the DOM player.
vm.runInContext(source.slice(0,source.indexOf('  function road('))+'return {factories,prepare,travel,poseAt,dimensions};})();',ctx);
const {factories,prepare,travel,poseAt,dimensions}=ctx.window.RoadScenes;
const configs=ctx.window.ROAD_SCENARIOS;
assert.equal(questions.filter(q=>!q.img).length,305);
assert.equal(configs.length,154);
assert.equal(new Set(configs.map(c=>c.question)).size,154,'Mappings must be unique');
const scenes=new Map();
for(const c of configs){
  assert.equal(questions.filter(q=>!q.img&&q.q===c.question).length,1,c.title);
  assert.equal(typeof factories[c.scene],'function',c.scene);
  const s=prepare(factories[c.scene](c),c);scenes.set(c.question,s);
  assert.ok(s.steps.length>=4,c.title);
  assert.ok(s.actors.some(a=>a.positions.some(p=>p.x!==a.positions[0].x||p.y!==a.positions[0].y)),c.title+' must contain motion');
  for(const a of s.actors){
    assert.ok(a.positions.length>=4,c.title);
    for(const p of a.positions)for(const k of ['x','y','a','o'])assert.ok(Number.isFinite(p[k]),`${c.title}: ${k}`);
    for(let i=0;i<a.positions.length-1;i++)for(let t=0;t<=1;t+=.05){const pose=travel(a.positions[i],a.positions[i+1],t,s.kind);assert.ok([pose.x,pose.y,pose.a].every(Number.isFinite),c.title+' invalid interpolation');}
  }
}
const stop=prepare(factories.allStop(),{scene:'allStop'});
for(let step=1;step<5;step++){
  assert.notEqual(stop.actors[step-1].positions[step].x+stop.actors[step-1].positions[step].y,stop.actors[step-1].positions[step+1].x+stop.actors[step-1].positions[step+1].y,'Next car must move');
  for(let later=step;later<4;later++)assert.deepEqual(stop.actors[later].positions[step],stop.actors[later].positions[step+1],'Later arrivals must wait');
}
const r=prepare(factories.round({lanes:true}),{scene:'round',lanes:true});
for(const a of r.actors)for(let i=2;i<6;i++)for(let t=0;t<=1;t+=.05){const p=travel(a.positions[i],a.positions[i+1],t,r.kind);assert.ok(Math.hypot(p.x-300,p.y-180)>60,'Cars must not cut across the central island');}
const bus=prepare(factories.schoolBus({divided:true}),{scene:'schoolBus',divided:true});
assert.deepEqual(bus.actors[1].positions[1],bus.actors[1].positions[3],'Following car must stay stopped');
assert.notEqual(bus.actors[2].positions[1].x,bus.actors[2].positions[3].x,'Opposite carriageway remains open');
const median=factories.median();
assert.deepEqual(median.actors[0].positions[1],median.actors[0].positions[2],'Wait for the first carriageway to clear');
assert.deepEqual(median.actors[0].positions[3],median.actors[0].positions[4],'Wait separately in the median');
for(let f=0;f<median.steps.length-1;f+=.01){
  const poses=median.actors.map(a=>{const i=Math.floor(f),v=f-i;return travel(a.positions[i],a.positions[i+1],v*v*(3-2*v),median.kind);});
  for(const other of poses.slice(1))assert.ok(Math.hypot(poses[0].x-other.x,poses[0].y-other.y)>=30,'Median crossing must not overlap either traffic stream');
}
// A north-to-east right turn must follow the paved junction instead of cutting the southeast corner.
for(let t=0;t<=1;t+=.02){const p=travel({x:330,y:285,a:-90},{x:510,y:210,a:0},t,'intersection');assert.ok(p.x<=360||p.y<=240,'Turn cuts across curb');}
assert.ok(html.includes('RoadScenes.mount(parent, q)'));
assert.ok(html.includes('RoadScenes.stopAll()'));
assert.ok(html.includes('signCopy(q).shortRu || window.ROAD_SCENARIOS?.some(s=>s.question===q.q)'), 'Road explanations must also appear in result review');
assert.equal((html.match(/<script src="road-/g)||[]).length,2);
// Test the same timed poses used by draw(), including the full rotated body.
function corners(p,d){const c=Math.cos(p.a*Math.PI/180),s=Math.sin(p.a*Math.PI/180);return [-1,1].flatMap(x=>[-1,1].map(y=>({x:p.x+x*d.length/2*c-y*d.width/2*s,y:p.y+x*d.length/2*s+y*d.width/2*c})));}
function overlaps(p,q,d,e){const a=corners(p,d),b=corners(q,e);for(const v of [p.a,p.a+90,q.a,q.a+90]){const c=Math.cos(v*Math.PI/180),s=Math.sin(v*Math.PI/180),A=a.map(v=>v.x*c+v.y*s),B=b.map(v=>v.x*c+v.y*s);if(Math.max(...A)<Math.min(...B)||Math.max(...B)<Math.min(...A))return false;}return true;}
let frames=0;
for(const c of configs){
  const s=scenes.get(c.question);
  for(let n=0;n<=(s.steps.length-1)*100;n++){
    const f=n/100,poses=s.actors.map((a,i)=>poseAt(a,f,s,i));frames++;
    for(const [i,p] of poses.entries()){
      assert.ok(['x','y','a','o'].every(k=>Number.isFinite(p[k])),`${c.scene}: invalid timed pose`);
      const a=s.actors[i],d=dimensions(a.type);
      if(f>.001&&!['person','animal'].includes(a.type)&&!s.skid&&c.scene!=='trailer'){
        const previous=poseAt(a,f-.001,s,i),dx=p.x-previous.x,dy=p.y-previous.y;
        if(Math.hypot(dx,dy)>.001){const tangent=Math.atan2(dy,dx)*180/Math.PI,delta=Math.abs(((p.a-tangent+540)%360)-180);assert.ok(Math.min(delta,180-delta)<2,`${c.scene}: ${a.name} slides sideways at ${f}`);}
      }
      if(s.kind==='intersection'&&!['person','animal'].includes(a.type))for(const v of corners(p,d))assert.ok(v.x>=240&&v.x<=360||v.y>=120&&v.y<=240,`${c.scene}: ${a.name} crosses a curb at ${f}`);
      if(s.kind==='roundabout'&&a.type!=='person'){
        const cos=Math.cos(p.a*Math.PI/180),sin=Math.sin(p.a*Math.PI/180),dx=300-p.x,dy=180-p.y;
        const nearX=Math.max(0,Math.abs(dx*cos+dy*sin)-d.length/2),nearY=Math.max(0,Math.abs(-dx*sin+dy*cos)-d.width/2);
        assert.ok(Math.hypot(nearX,nearY)>=58,`${c.scene}: body crosses island at ${f}`);
        for(const v of corners(p,d))assert.ok(Math.hypot(v.x-300,v.y-180)<=118||v.x>=240&&v.x<=360||v.y>=120&&v.y<=240,`${c.scene}: body leaves pavement at ${f}`);
      }
      for(let j=i+1;j<poses.length;j++){
        // Coupled vehicles intentionally overlap at their hitch in the jackknife warning.
        if(c.scene==='trailer')continue;
        if(p.o>.7&&poses[j].o>.7)assert.ok(!overlaps(p,poses[j],d,dimensions(s.actors[j].type)),`${c.scene}: ${a.name}/${s.actors[j].name} overlap at ${f}`);
      }
    }
  }
  for(const [i,a] of s.actors.entries())if(!['person','animal'].includes(a.type))for(let f=1;f<s.steps.length-1;f++){
    const A=poseAt(a,f-.0001,s,i),B=poseAt(a,f+.0001,s,i);
    assert.ok(Math.hypot(A.x-B.x,A.y-B.y)<.2,`${c.scene}: position jumps between steps`);
    assert.ok(Math.abs(((B.a-A.a+540)%360)-180)<1,`${c.scene}: heading jumps between steps`);
  }
}
for(const a of stop.actors){const v=a.positions[1],d=dimensions(a.type);if(v.a===-90)assert.ok(v.y-d.length/2>=270);if(v.a===0)assert.ok(v.x+d.length/2<=220);if(v.a===90)assert.ok(v.y+d.length/2<=100);if(v.a===180)assert.ok(v.x-d.length/2>=380);}
// Compare curved-road footprints with independently sampled pavement centre lines.
const linear=(a,b,t)=>({x:a[0]+(b[0]-a[0])*t,y:a[1]+(b[1]-a[1])*t});
const quadratic=(a,b,c,t)=>({x:(1-t)**2*a[0]+2*(1-t)*t*b[0]+t*t*c[0],y:(1-t)**2*a[1]+2*(1-t)*t*b[1]+t*t*c[1]});
for(const c of configs){const s=scenes.get(c.question);if(!['curve','hill','interchange','center-turn'].includes(s.kind))continue;
  const centre=Array.from({length:201},(_,i)=>{const t=i/200;return s.kind==='curve'?[linear([-30,230],[210,230],t),quadratic([210,230],[300,230],[315,165],t),quadratic([315,165],[335,80],[450,80],t),linear([450,80],[640,80],t)]:s.kind==='hill'?[linear([-30,100],[180,100],t),linear([180,100],[520,260],t),linear([520,260],[640,260],t)]:[quadratic([160,225],[320,225],[410,40],t),quadratic([440,135],[280,135],[190,320],t)];}).flat();
  for(let f=0;f<s.steps.length-1;f+=.02)for(const [i,a] of s.actors.entries())for(const v of corners(poseAt(a,f,s,i),dimensions(a.type))){
    if(s.kind==='center-turn'){assert.ok(v.y>=90&&v.y<=270||v.x>=290&&v.x<=365,`${c.scene}: body leaves the turn lane or driveway`);continue;}
    if(s.kind==='interchange'&&(v.y>=115&&v.y<=245||v.x>=230&&v.x<=370))continue;
    assert.ok(Math.min(...centre.map(p=>Math.hypot(v.x-p.x,v.y-p.y)))<(s.kind==='interchange'?45:55),`${c.scene}: body leaves curved pavement`);
  }
}
const flow=prepare(factories.keepRight(),{scene:'keepRight'}),a=flow.actors[0],epsilon=.001;
for(let f=1;f<3;f++){const A=poseAt(a,f-epsilon,flow),B=poseAt(a,f,flow),C=poseAt(a,f+epsilon,flow);assert.ok(B.x-A.x>.01&&C.x-B.x>.01,'Flow must not stop at an intermediate caption');assert.ok(Math.abs((B.x-A.x)-(C.x-B.x))<.002,'Flow speed must stay continuous');}
console.log(`PASS: ${configs.length} mappings; ${frames} timed frames; rotated-body collision checks; intersection/roundabout pavement; stop clearances; continuous headings and traffic flow.`);
