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
vm.runInContext(source.slice(0,source.indexOf('  function road(svg,s){'))+'return {factories,prepare,travel};})();',ctx);
const {factories,prepare,travel}=ctx.window.RoadScenes;
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
// A north-to-east right turn must follow the paved junction instead of cutting the southeast corner.
for(let t=0;t<=1;t+=.02){const p=travel({x:330,y:285,a:-90},{x:510,y:210,a:0},t,'intersection');assert.ok(p.x<=360||p.y<=240,'Turn cuts across curb');}
assert.ok(html.includes('RoadScenes.mount(parent, q)'));
assert.ok(html.includes('RoadScenes.stopAll()'));
assert.ok(html.includes('signCopy(q).shortRu || window.ROAD_SCENARIOS?.some(s=>s.question===q.q)'), 'Road explanations must also appear in result review');
assert.equal((html.match(/<script src="road-/g)||[]).length,2);
console.log(`PASS: all ${configs.length} mappings, finite animation paths, all-way-stop order, roundabout lanes, divided-road bus exception, and curb-safe turns.`);
