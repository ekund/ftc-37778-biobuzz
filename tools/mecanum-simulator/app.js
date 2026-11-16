'use strict';
const $=id=>document.getElementById(id);
const names=['leftFrontDrive','rightFrontDrive','leftBackDrive','rightBackDrive'];
const short=['FL','FR','BL','BR'];
const ratioUltra=(84/29)*(76/21)*(68/13);
$('ratio').value=ratioUltra.toFixed(6);
let steps=[{p:[.5,.5,.5,.5],seconds:1}],selected=-1,pose={x:8,y:36,h:Math.PI/2},ticks=[0,0,0,0],trail=[],travel=0,elapsed=0,stepIndex=0,stepElapsed=0,running=false,paused=false,lastFrame=0,frameId=0,codeDirty=false;
const field=$('field');
function num(id){return Number($(id).value)}
function hardware(){const ratio=num('ratio'),wheel=num('wheel')/25.4,cpr=num('cpr'),rpm=num('rpm'),external=num('external');return{ratio,wheel,cpr,rpm,external,tpi:cpr*ratio*external/(Math.PI*wheel),speed:rpm/(ratio*external)/60*Math.PI*wheel};}
function validSettings(){const ids=['ratio','wheel','cpr','rpm','external','size','efficiency','strafe','startX','startY','startH'];return ids.every(id=>$(id).value!==''&&$(id).checkValidity()&&Number.isFinite(num(id)));}
function setStatus(s){$('status').textContent=s;}
function powers(){return names.map((_,i)=>Number($('p'+i).value));}
function setPowers(p){p.forEach((v,i)=>{$('p'+i).value=v;$('n'+i).value=v.toFixed(2);});}
function buildControls(){names.forEach((name,i)=>{const d=document.createElement('div');d.className='motor';d.innerHTML=`<div class="motor-top"><label for="p${i}"><small>${short[i]} / ${i<2?'FRONT':'BACK'} ${i%2?'RIGHT':'LEFT'}</small>${name}.setPower()</label><input class="power-input" id="n${i}" aria-label="${name} numeric power" type="number" min="-1" max="1" step=".01" value="0.50"></div><input id="p${i}" aria-label="${name} power slider" type="range" min="-1" max="1" step=".01" value=".5"><div class="range-labels"><span>−1.00</span><span>0</span><span>+1.00</span></div>`;$('motors').append(d);$('p'+i).oninput=()=>{$('n'+i).value=Number($('p'+i).value).toFixed(2)};$('n'+i).oninput=()=>{const el=$('n'+i);if(el.value!==''&&el.checkValidity())$('p'+i).value=el.value;};});}
function moveName(p){const f=(p[0]+p[1]+p[2]+p[3])/4,r=(p[0]-p[1]-p[2]+p[3])/4,t=(p[0]-p[1]+p[2]-p[3])/4;if(p.every(v=>v===0))return'Wait';if(Math.abs(t)>.01&&Math.abs(f)+Math.abs(r)<.01)return t>0?'Turn clockwise':'Turn counterclockwise';if(Math.abs(r)>.01&&Math.abs(f)+Math.abs(t)<.01)return r>0?'Strafe right':'Strafe left';if(Math.abs(f)>.01&&Math.abs(r)+Math.abs(t)<.01)return f>0?'Forward':'Backward';return'Custom movement';}
function updateSteps(){const el=$('steps');el.replaceChildren();steps.forEach((s,i)=>{const row=document.createElement('div');row.className='step'+(i===selected?' selected':'')+(running&&i===stepIndex?' playing':'');row.setAttribute('role','button');row.tabIndex=0;row.setAttribute('aria-label',`Edit step ${i+1}: ${moveName(s.p)}, ${s.seconds} seconds`);row.innerHTML=`<span class="index">${String(i+1).padStart(2,'0')}</span><span class="step-copy"><b>${moveName(s.p)}</b><small>${s.p.map(v=>v.toFixed(2)).join(' / ')}</small></span><em>${String(s.seconds)} s</em><button class="remove" aria-label="Delete step ${i+1}">×</button>`;const select=()=>{selected=i;setPowers(s.p);setDuration(s.seconds);$('update').disabled=false;updateSteps();};row.onclick=e=>{if(!e.target.closest('button'))select()};row.onkeydown=e=>{if(e.target===row&&(e.key==='Enter'||e.key===' ')){e.preventDefault();select();}};row.querySelector('button').onclick=()=>{stopForEdit();steps.splice(i,1);selected=-1;routeChanged();};el.append(row);});$('stepCount').textContent=steps.length+' step'+(steps.length===1?'':'s');$('update').disabled=selected<0;$('run').disabled=!steps.length;}
function snippet(){return steps.map((s,i)=>`// Step ${i+1}: ${moveName(s.p)}\n${names.map((n,j)=>`${n}.setPower(${s.p[j].toLocaleString('en-US',{useGrouping:false,minimumFractionDigits:2,maximumFractionDigits:20})});`).join('\n')}\nsleep(${Math.round(s.seconds*1000)});`).join('\n\n')+'\n\n// Stop all four motors\n'+names.map(n=>`${n}.setPower(0);`).join('\n');}
function syncCode(force=false){if(!codeDirty||force){$('code').value=snippet();codeDirty=false;}}
function routeChanged(){updateSteps();syncCode();reset();save();}
function save(){try{localStorage.setItem('revup-v1',JSON.stringify({poseVersion:2,steps,settings:Object.fromEntries(['ratio','wheel','cpr','rpm','external','size','efficiency','strafe','startX','startY','startH','gearPreset'].map(id=>[id,$(id).value]))}));}catch{}}
function restore(){try{const data=JSON.parse(localStorage.getItem('revup-v1'));if(data&&Array.isArray(data.steps)&&data.steps.length<=200&&data.steps.every(s=>s&&Array.isArray(s.p)&&s.p.length===4&&s.p.every(p=>Number.isFinite(p)&&p>=-1&&p<=1)&&Number.isFinite(s.seconds)&&s.seconds>0&&s.seconds<=60)){steps=data.steps;for(const [id,value] of Object.entries(data.settings||{})){if($(id)&&typeof value==='string')$(id).value=value;}if(data.poseVersion!==2){$('startX').value=num('size')/2;$('startY').value=36;$('startH').value=90;}if(!validSettings()){for(const [id,value] of Object.entries({ratio:ratioUltra,wheel:75,cpr:28,rpm:6000,external:1,size:16,efficiency:.8,strafe:.85,startX:8,startY:36,startH:90}))$(id).value=value;}}}catch{}}
function svgEl(tag,attrs={},text=''){const e=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [k,v]of Object.entries(attrs))e.setAttribute(k,v);if(text)e.textContent=text;return e;}
function initField(){field.replaceChildren();field.append(svgEl('rect',{x:0,y:0,width:144,height:144,rx:1,fill:'#fff',stroke:'#000','stroke-width':.5}));for(let y=0;y<6;y++)for(let x=0;x<6;x++)field.append(svgEl('rect',{x:x*24,y:y*24,width:24,height:24,fill:'#fff',stroke:'#000','stroke-width':.35}));field.append(svgEl('rect',{x:0,y:24.5,width:11,height:23,fill:'#ddd',stroke:'#000','stroke-width':.5}));field.append(svgEl('text',{x:5.5,y:36,fill:'#000','font-size':2.4,'font-family':'Arial','text-anchor':'middle',transform:'rotate(-90 5.5 36)'},'LOADING · 23″ × 11″'));
for(let i=0;i<6;i++){field.append(svgEl('text',{x:i*24+12,y:-4,'text-anchor':'middle',fill:'#000','font-size':3,'font-family':'monospace'},String(i)));field.append(svgEl('text',{x:-5,y:i*24+13,'text-anchor':'middle',fill:'#000','font-size':3,'font-family':'monospace'},String(i)));}field.append(svgEl('text',{x:144,y:-4,'text-anchor':'end',fill:'#000','font-size':2.2},'X →'));field.append(svgEl('text',{x:-5,y:150,'text-anchor':'middle',fill:'#000','font-size':2.2},'Y ↓'));field.append(svgEl('text',{x:72,y:151,'text-anchor':'middle',fill:'#000','font-size':2.4},'ONE TILE = 24 INCHES / 2 FEET'));
field.append(svgEl('polyline',{id:'trail',fill:'none',stroke:'#777','stroke-width':.9,'stroke-linecap':'round','stroke-linejoin':'round'}));field.append(svgEl('circle',{id:'start-dot',r:1.3,fill:'#777'}));const g=svgEl('g',{id:'robot'});g.append(svgEl('rect',{id:'robot-body',fill:'#fff',stroke:'#000','stroke-width':.6,rx:0}));for(let i=0;i<4;i++)g.append(svgEl('rect',{id:'wheel-'+i,fill:'#000',rx:.6}));g.append(svgEl('path',{id:'robot-arrow',fill:'#000'}));g.append(svgEl('circle',{r:1,fill:'#000'}));field.append(g);}
function render(){const side=num('size'),half=side/2;$('robot').setAttribute('transform',`translate(${pose.x} ${pose.y}) rotate(${pose.h*180/Math.PI})`);const b=$('robot-body');b.setAttribute('x',-half);b.setAttribute('y',-half);b.setAttribute('width',side);b.setAttribute('height',side);for(let i=0;i<4;i++){const w=$('wheel-'+i);w.setAttribute('x',i%2?half-1.8:-half);w.setAttribute('y',i<2?-half+1:half-5);w.setAttribute('width',1.8);w.setAttribute('height',4);}const a=$('robot-arrow');a.setAttribute('d',`M0 ${-half+2.5} L2.2 ${-half+6} L.7 ${-half+5.5} L.7 -1.8 L-.7 -1.8 L-.7 ${-half+5.5} L-2.2 ${-half+6}Z`);$('trail').setAttribute('points',trail.map(p=>p.join(',')).join(' '));$('start-dot').setAttribute('cx',num('startX'));$('start-dot').setAttribute('cy',num('startY'));$('timer').textContent=elapsed.toFixed(2)+' s';$('progress').style.width=(steps.length?Math.min(100,elapsed/steps.reduce((t,s)=>t+s.seconds,0)*100):0)+'%';}
function cancel(){running=false;paused=false;cancelAnimationFrame(frameId);$('pause').disabled=true;$('pause').textContent='Pause';$('run').textContent='▶ Run route';}
function reset(){cancel();if(!validSettings()){setStatus('Enter valid values in the simulation and encoder settings.');return;}pose={x:num('startX'),y:num('startY'),h:num('startH')*Math.PI/180};ticks=[0,0,0,0];travel=elapsed=stepElapsed=stepIndex=0;trail=[[pose.x,pose.y]];render();updateSteps();setStatus('Ready. Click the field to choose a starting position.');}
function stopForEdit(){if(running||paused)reset();}
function outOfBounds(p){const half=num('size')/2,e=half*(Math.abs(Math.cos(p.h))+Math.abs(Math.sin(p.h)));return p.x-e<-.00001||p.x+e>144.00001||p.y-e<-.00001||p.y+e>144.00001;}
function integrate(p,dt){const hw=hardware(),v=p.map(v=>v*hw.speed*num('efficiency')),f=(v[0]+v[1]+v[2]+v[3])/4,r=(v[0]-v[1]-v[2]+v[3])/4*num('strafe'),omega=(v[0]-v[1]+v[2]-v[3])/4/num('size'),mid=pose.h+omega*dt/2;const dx=(r*Math.cos(mid)+f*Math.sin(mid))*dt,dy=(r*Math.sin(mid)-f*Math.cos(mid))*dt,next={x:pose.x+dx,y:pose.y+dy,h:pose.h+omega*dt};if(outOfBounds(next))return false;pose=next;travel+=Math.hypot(dx,dy);p.forEach((power,i)=>ticks[i]+=power*hw.rpm/60*hw.cpr*num('efficiency')*dt);return true;}
function tick(timestamp){if(!running||paused)return;let dt=Math.min((timestamp-lastFrame)/1000,.1);lastFrame=timestamp;let hit=false;while(dt>1e-8&&stepIndex<steps.length){const step=steps[stepIndex],d=Math.min(dt,step.seconds-stepElapsed,.01);if(!integrate(step.p,d)){hit=true;break;}elapsed+=d;stepElapsed+=d;dt-=d;if(stepElapsed>=step.seconds-1e-8){stepIndex++;stepElapsed=0;updateSteps();}}if(trail.length===0||Math.hypot(pose.x-trail[trail.length-1][0],pose.y-trail[trail.length-1][1])>.15)trail.push([pose.x,pose.y]);render();if(hit){cancel();updateSteps();setStatus('Stopped at field wall. Move the start or adjust this route.');return;}if(stepIndex>=steps.length){cancel();updateSteps();setStatus('Route complete.');return;}setStatus(`Running step ${stepIndex+1} of ${steps.length} · ${moveName(steps[stepIndex].p)}`);frameId=requestAnimationFrame(tick);}
function run(){if(!validSettings()){setStatus('Enter valid values in the simulation and encoder settings.');return;}if(!steps.length)return;if(running||paused){reset();}else reset();if(outOfBounds(pose)){setStatus('The starting robot footprint crosses a wall. Choose a start farther inside the field.');return;}running=true;lastFrame=performance.now();$('pause').disabled=false;$('run').textContent='↻ Restart';updateSteps();frameId=requestAnimationFrame(tick);}
function updateMath(){if(!validSettings())return;const h=hardware();$('tpi').textContent=h.tpi.toFixed(2);$('tpf').textContent=(h.tpi*12).toFixed(2);$('tpt').textContent=(h.tpi*24).toFixed(2);$('tpw').textContent=(h.cpr*h.ratio*h.external).toFixed(2);const d=num('targetDistance');$('targetTicks').textContent=Number.isFinite(d)?Math.round(d*num('unit')*h.tpi).toLocaleString():'—';}
function parseJava(text){const src=text.replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\/[^\n]*/g,'');let p=[0,0,0,0],result=[],nonzeroPending=false;const statements=src.split(';');for(let i=0;i<statements.length;i++){const statement=statements[i].trim();if(!statement)continue;if(i===statements.length-1)throw Error('Finish each command with a semicolon.');let m=statement.match(/^(leftFrontDrive|rightFrontDrive|leftBackDrive|rightBackDrive)\s*\.\s*setPower\s*\(\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*\)$/);if(m){const value=Number(m[2]);if(value<-1||value>1)throw Error('Motor power must be between −1 and +1.');p[names.indexOf(m[1])]=value;nonzeroPending=p.some(v=>v!==0);continue;}m=statement.match(/^sleep\s*\(\s*(\d+)\s*\)$/);if(m){const ms=Number(m[1]);if(ms<1||ms>60000)throw Error('Each sleep must be between 1 and 60000 milliseconds.');result.push({p:[...p],seconds:ms/1000});if(result.length>200)throw Error('Use 200 steps or fewer.');nonzeroPending=false;continue;}throw Error('Unsupported command: '+statement.slice(0,80)+'. Use the four setPower(number) calls and sleep(milliseconds).');}if(nonzeroPending)throw Error('Add sleep(milliseconds) after the final nonzero motor commands.');if(!result.length)throw Error('Add at least one sleep(milliseconds) to create a timed step.');return result;}
function fullJava(){const h=hardware();return`package org.firstinspires.ftc.teamcode;

import com.qualcomm.robotcore.eventloop.opmode.Autonomous;
import com.qualcomm.robotcore.eventloop.opmode.LinearOpMode;
import com.qualcomm.robotcore.hardware.DcMotor;

@Autonomous(name = "RevUp Route", group = "RevUp")
public class RevUpRoute extends LinearOpMode {
    private DcMotor ${names.join(', ')};
    // HD Hex / wheel assumptions; encoder math is a reference, not a distance controller.
    // Diameter: ${num('wheel')} mm; actual reduction: ${num('ratio')}:1; external: ${num('external')}:1.
    private static final double TICKS_PER_INCH = ${h.tpi.toFixed(8)};

    @Override
    public void runOpMode() {
${names.map(n=>`        ${n} = hardwareMap.get(DcMotor.class, "${n}");`).join('\n')}
        // Confirm these directions and X-pattern rollers on your actual drivetrain.
        leftFrontDrive.setDirection(DcMotor.Direction.REVERSE);
        leftBackDrive.setDirection(DcMotor.Direction.REVERSE);
        rightFrontDrive.setDirection(DcMotor.Direction.FORWARD);
        rightBackDrive.setDirection(DcMotor.Direction.FORWARD);
        DcMotor[] motors = { ${names.join(', ')} };
        for (DcMotor motor : motors) {
            motor.setZeroPowerBehavior(DcMotor.ZeroPowerBehavior.BRAKE);
            motor.setMode(DcMotor.RunMode.STOP_AND_RESET_ENCODER);
            motor.setMode(DcMotor.RunMode.RUN_WITHOUT_ENCODER);
        }
        telemetry.addLine("Ready: confirm clear field and motor directions.");
        telemetry.update();
        waitForStart();
        if (isStopRequested()) return;
        try {
${steps.map((s,i)=>`            // Step ${i+1}: ${moveName(s.p)}\n            if (!opModeIsActive()) return;\n${names.map((n,j)=>`            ${n}.setPower(${s.p[j].toLocaleString('en-US',{useGrouping:false,minimumFractionDigits:2,maximumFractionDigits:20})});`).join('\n')}\n            runFor(${Math.round(s.seconds*1000)});`).join('\n\n')}
        } finally {
            for (DcMotor motor : motors) motor.setPower(0);
        }
    }

    private void runFor(long milliseconds) {
        long end = System.nanoTime() + milliseconds * 1000000L;
        while (opModeIsActive() && System.nanoTime() < end) {
${names.map(n=>`            telemetry.addData("${n} ticks", ${n}.getCurrentPosition());`).join('\n')}
            telemetry.update();
            sleep(10);
        }
    }
}
`;}
buildControls();restore();initField();syncCode(true);updateMath();reset();
document.querySelectorAll('[data-tab]').forEach(button=>button.onclick=()=>{document.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('active',b===button));document.querySelectorAll('.tab-panel').forEach(p=>p.hidden=p.id!==button.dataset.tab);if(button.dataset.tab==='java')syncCode();});
document.querySelectorAll('[data-preset]').forEach(button=>button.onclick=()=>{setPowers({forward:[.5,.5,.5,.5],right:[.5,-.5,-.5,.5],turn:[.5,-.5,.5,-.5],stop:[0,0,0,0]}[button.dataset.preset]);});
function setDuration(seconds){$('duration').value=seconds;$('durationNumber').value=seconds;}
$('duration').oninput=()=>setDuration(num('duration'));
$('durationNumber').oninput=()=>{const input=$('durationNumber');if(input.value!==''&&input.checkValidity())$('duration').value=input.value;};
function slidersValid(){if($('durationNumber').value===''||!$('durationNumber').checkValidity()){setStatus('Enter a duration from 0.001 to 60 seconds.');$('durationNumber').reportValidity();return false;}if(names.some((_,i)=>!$('n'+i).checkValidity()||$('n'+i).value==='')){setStatus('Enter motor powers between −1 and 1.');return false;}return true;}
$('add').onclick=()=>{if(!slidersValid())return;if(steps.length>=200){setStatus('Maximum 200 steps.');return;}stopForEdit();steps.push({p:powers(),seconds:num('durationNumber')});selected=steps.length-1;routeChanged();};
$('update').onclick=()=>{if(selected<0||!slidersValid())return;stopForEdit();steps[selected]={p:powers(),seconds:num('durationNumber')};routeChanged();};
$('clear').onclick=()=>{stopForEdit();steps=[];selected=-1;routeChanged();};
$('run').onclick=run;$('reset').onclick=reset;
$('wallStart').onclick=()=>{$('startX').value=num('size')/2;$('startY').value=36;$('startH').value=90;reset();save();};
$('pause').onclick=()=>{if(!running)return;paused=!paused;$('pause').textContent=paused?'Resume':'Pause';if(paused){cancelAnimationFrame(frameId);setStatus('Paused. Resume to continue this route.');}else{lastFrame=performance.now();frameId=requestAnimationFrame(tick);}};
$('code').oninput=()=>{codeDirty=true;$('javaMessage').textContent='Unapplied changes. Click Apply Java to update the route.';};
$('apply').onclick=()=>{try{const parsed=parseJava($('code').value);steps=parsed;selected=-1;codeDirty=false;updateSteps();reset();save();$('javaMessage').textContent=`Applied ${steps.length} timed step${steps.length===1?'':'s'}. Run route to simulate.`;$('javaMessage').style.color='#000';}catch(e){$('javaMessage').textContent=e.message;$('javaMessage').style.color='#000';}};
$('generate').onclick=()=>{syncCode(true);$('javaMessage').textContent='Editor replaced with the current route.';};
$('download').onclick=()=>{if(codeDirty){document.querySelector('[data-tab="java"]').click();$('javaMessage').textContent='Apply your Java edits before exporting, or load the current route to discard them.';return;}if(!validSettings()){setStatus('Fix hardware settings before export.');return;}if(!steps.length){setStatus('Add a route step before exporting.');return;}const blob=new Blob([fullJava()],{type:'text/x-java-source'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='RevUpRoute.java';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
$('gearPreset').onchange=()=>{if($('gearPreset').value==='ultra')$('ratio').value=ratioUltra.toFixed(6);if($('gearPreset').value==='literal')$('ratio').value='60';stopForEdit();updateMath();reset();save();};
['ratio','wheel','cpr','rpm','external','size','efficiency','strafe','startX','startY','startH'].forEach(id=>$(id).onchange=()=>{if(['ratio','wheel','cpr','rpm','external'].includes(id))$('gearPreset').value='custom';updateMath();reset();if(validSettings())save();});
['targetDistance','unit'].forEach(id=>$(id).oninput=updateMath);
field.onclick=event=>{if(!validSettings())return;const pt=field.createSVGPoint();pt.x=event.clientX;pt.y=event.clientY;const p=pt.matrixTransform(field.getScreenCTM().inverse());if(p.x<0||p.x>144||p.y<0||p.y>144)return;const half=num('size')/2,h=num('startH')*Math.PI/180,e=half*(Math.abs(Math.cos(h))+Math.abs(Math.sin(h)));$('startX').value=Math.max(e,Math.min(144-e,p.x)).toFixed(1);$('startY').value=Math.max(e,Math.min(144-e,p.y)).toFixed(1);reset();save();};
