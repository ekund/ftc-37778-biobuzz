const vm=require('vm'),fs=require('fs'),assert=require('assert'),path=require('path');
// Minimal DOM fixtures exercise the application logic without browser automation.
const defaults={ratio:'54.832891',wheel:'75',cpr:'28',rpm:'6000',external:'1',size:'16',efficiency:'.8',strafe:'.85',startX:'8',startY:'36',startH:'90',duration:'1',durationNumber:'1',unit:'24',targetDistance:'1'};
const elements={};function el(id){if(!elements[id])elements[id]={value:defaults[id]||'',style:{},classList:{toggle(){}},append(){},replaceChildren(){},setAttribute(){},checkValidity(){return true},querySelector(){return{onclick:null}},getScreenCTM(){return{inverse(){}}}};return elements[id]}
const context={document:{getElementById:el,createElement:()=>el('dynamic'),createElementNS:()=>el('svg'),querySelectorAll:()=>[]},localStorage:{getItem:()=>null,setItem(){}},requestAnimationFrame:()=>1,cancelAnimationFrame(){},performance:{now:()=>0},console,setTimeout,URL,Blob:require('buffer').Blob};
vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(__dirname,'../app.js'),'utf8'),context);
const evaluate=s=>vm.runInContext(s,context);
assert.equal(evaluate('pose.x'),8);assert.equal(evaluate('pose.y'),36);assert.equal(evaluate('pose.h'),Math.PI/2);assert.equal(evaluate('outOfBounds(pose)'),false);
assert(Math.abs(evaluate('hardware().tpi')-165.5090546)<.0001);
assert.equal(evaluate('parseJava("leftFrontDrive.setPower(.123); sleep(1000); sleep(500);").length'),2);
assert.equal(evaluate('parseJava("leftFrontDrive.setPower(.123); sleep(1000); sleep(500);")[1].p[0]'),.123);
for(const code of ['leftFrontDrive.setPower(2); sleep(10);','sleep(0);','foo();','sleep(1000)','leftFrontDrive.setPower(.5);']){assert.throws(()=>evaluate(`parseJava(${JSON.stringify(code)})`));}
evaluate('pose={x:72,y:72,h:0}; ticks=[0,0,0,0]; travel=0; integrate([.5,.5,.5,.5],1)');
assert.equal(evaluate('pose.x'),72);assert(evaluate('pose.y')<72);assert(Math.abs(evaluate('ticks[0]')-1120)<1e-9);
evaluate('pose={x:72,y:72,h:0}; integrate([.5,-.5,-.5,.5],1)');assert(evaluate('pose.x')>72);assert.equal(evaluate('pose.y'),72);
evaluate('pose={x:72,y:72,h:0}; integrate([.5,-.5,.5,-.5],1)');assert.equal(evaluate('pose.x'),72);assert.equal(evaluate('pose.y'),72);assert(evaluate('pose.h')>0);
assert.equal(evaluate('outOfBounds({x:4,y:72,h:0})'),true);
evaluate('steps=[{p:[.123,.5,.5,.5],seconds:1}]');assert(evaluate('fullJava()').includes('leftFrontDrive.setPower(0.123)'));
assert.equal(evaluate('parseJava(snippet())[0].p[0]'),.123);
evaluate('steps=[{p:[.5,.5,.5,.5],seconds:1}]');

console.log('Passed: encoder math, Java parsing and rejection, power persistence, forward/strafe/rotation kinematics, wall bounds, Java roundtrip/export.');

// Decimal time, wall start, and Java conversion regression checks.
el('durationNumber').value='0.125';el('durationNumber').oninput();assert.equal(el('duration').value,'0.125');
evaluate('setPowers([.5,.5,.5,.5])');el('add').onclick();assert.equal(evaluate('steps[steps.length-1].seconds'),.125);assert(evaluate('fullJava()').includes('runFor(125)'));
el('duration').value='1.625';el('duration').oninput();assert.equal(el('durationNumber').value,1.625);
el('size').value='17.5';el('wallStart').onclick();assert.equal(evaluate('pose.x'),8.75);assert.equal(evaluate('pose.y'),36);assert.equal(evaluate('outOfBounds(pose)'),false);
const count=evaluate('steps.length');el('durationNumber').value='';el('durationNumber').reportValidity=()=>{};el('add').onclick();assert.equal(evaluate('steps.length'),count);
console.log('Passed: default wall pose, decimal duration, Java millisecond conversion, resized wall pose, empty duration rejection.');
