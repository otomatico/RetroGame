import { Transform, Velocity, Car, Score } from "../engine/ecs/components.js";
import { GAME_WIDTH, GAME_HEIGHT, MAX_SPEED, COLORS } from "./constants.js";

// Game-specific simulation: vertical scrolling, pickups, fuel economy and roadside service.
export class RacingSystems {
  constructor(){ this.reset(); }
  reset(){
    this.speed=0; this.distance=0; this.elapsed=0; this.playerX=0; this.roadOffset=0;
    this.collisionFlash=0; this.collisionCooldown=0; this.finished=false; this.position=5;
    this.nitro=70; this.nitroActive=false; this.fuel=100; this.score=0; this.shield=0;
    this.pickups=[]; this.nextPickup=340; this.stationAt=1150; this.stationSide=-1;
    this.stationMessage=0; this.lastStation=0; this.roadCurve=0; this.seed=1;
  }
  rand(){ this.seed=(this.seed*1664525+1013904223)>>>0; return this.seed/4294967296; }
  update(world,input,events,dt){
    if(this.finished)return;
    this.elapsed+=dt; this.collisionFlash=Math.max(0,this.collisionFlash-dt); this.collisionCooldown=Math.max(0,this.collisionCooldown-dt); this.stationMessage=Math.max(0,this.stationMessage-dt); this.shield=Math.max(0,this.shield-dt);
    const throttle=input.isDown("accelerate"), brake=input.isDown("brake"), left=input.isDown("steerLeft"), right=input.isDown("steerRight"), nitro=input.isDown("nitro");
    this.nitroActive=nitro&&this.nitro>0&&this.speed>50;
    if(throttle)this.speed=Math.min(this.nitroActive?MAX_SPEED*1.32:MAX_SPEED,this.speed+(this.nitroActive?175:105)*dt);
    else this.speed=Math.max(0,this.speed-25*dt);
    if(brake)this.speed=Math.max(0,this.speed-220*dt);
    if(this.nitroActive)this.nitro=Math.max(0,this.nitro-32*dt);else this.nitro=Math.min(100,this.nitro+5*dt);
    this.playerX+=(Number(right)-Number(left))*(1.5+this.speed/120)*dt;
    this.playerX=Math.max(-1.18,Math.min(1.18,this.playerX));
    if(Math.abs(this.playerX)>.88){this.speed=Math.max(45,this.speed-78*dt);}
    const moved=this.speed*dt; this.distance+=moved; this.roadOffset+=moved; this.fuel=Math.max(0,this.fuel-moved*.0062); this.score+=Math.floor(moved*.18);
    if(this.fuel<=0){this.speed=Math.max(0,this.speed-130*dt);this.stationMessage=0.05;}
    // Spawn small pickups in the road ahead. They are intentionally data-driven objects.
    if(this.distance>this.nextPickup){
      const types=["nitro","fuel","shield","points"],type=types[Math.floor(this.rand()*types.length)];
      this.pickups.push({distance:this.distance+620+this.rand()*280,lane:(this.rand()-.5)*1.3,type,alive:true});
      this.nextPickup=this.distance+260+this.rand()*330;
    }
    // A gas station appears at regular intervals. Brake and pull toward its service bay.
    if(this.distance>this.stationAt+500){this.stationAt+=1700;this.stationSide=this.stationSide===-1?1:-1;}
    const stationDepth=this.stationAt-this.distance;
    if(stationDepth>-15&&stationDepth<115&&Math.abs(this.playerX-this.stationSide*.83)<.25&&this.speed<100&&this.fuel<99){
      this.fuel=Math.min(100,this.fuel+46*dt);this.speed=Math.min(this.speed,65);this.stationMessage=1.2;
      if(this.fuel>98&&this.lastStation!==this.stationAt){this.lastStation=this.stationAt;events.emit("refuel",{fuel:this.fuel});this.score+=250;}
    }
    for(const p of this.pickups){if(!p.alive)continue;const depth=p.distance-this.distance;if(depth<22&&depth>-24&&Math.abs(p.lane-this.playerX)<.22){p.alive=false;this.collect(p.type,events);}}
    this.pickups=this.pickups.filter(p=>p.alive&&p.distance>this.distance-80);
    for(const id of world.query(Transform,Velocity,Car)){
      const car=world.getComponent(id,Car),t=world.getComponent(id,Transform),v=world.getComponent(id,Velocity);
      if(car.player){t.x=this.playerX;t.y=this.distance;v.x=this.speed;continue;}
      t.y+=car.speed*dt; const depth=t.y-this.distance;
      if(depth < -130)t.y=this.distance+720+this.rand()*750;
      if(depth>1250)t.y=this.distance+300+this.rand()*600;
      car.lane+=Math.sin(t.y*.002+id)*dt*.09;car.lane=Math.max(-.72,Math.min(.72,car.lane));t.x=car.lane;
      const d=t.y-this.distance;
      if(d>-24&&d<36&&Math.abs(car.lane-this.playerX)<.23&&this.collisionCooldown<=0){
        if(this.shield<=0){this.speed=Math.max(0,this.speed*.48);this.fuel=Math.max(0,this.fuel-5);this.collisionFlash=.45;events.emit("collision",{racer:car.name});}
        else this.score+=100;
        this.collisionCooldown=.85;
      }
    }
    const racers=world.query(Transform,Car).map(id=>({car:world.getComponent(id,Car),t:world.getComponent(id,Transform)})).sort((a,b)=>b.t.y-a.t.y);
    this.position=Math.max(1,racers.findIndex(r=>r.car.player)+1);
    const scoreEntity=world.query(Score).map(id=>world.getComponent(id,Score))[0];if(scoreEntity)scoreEntity.value=this.score;
    if(this.distance>=12000){this.finished=true;events.emit("finish",{position:this.position,time:this.elapsed});}
  }
  collect(type,events){
    if(type==="nitro"){this.nitro=Math.min(100,this.nitro+42);this.score+=100;}
    if(type==="fuel"){this.fuel=Math.min(100,this.fuel+28);this.score+=75;}
    if(type==="shield"){this.shield=8;this.score+=100;}
    if(type==="points")this.score+=300;
    events.emit("pickup",{type});
  }
  draw(world,renderer){
    const c=renderer.renderer.ctx,w=GAME_WIDTH,h=GAME_HEIGHT;renderer.beginFrame();
    // Pure top-down 2D: constant-width road, parallel edges, no horizon or perspective scaling.
    c.fillStyle="#09131c";c.fillRect(0,0,w,h);
    // Side terrain panels and repeating roadside markings.
    c.fillStyle="#0d1c27";c.fillRect(0,0,235,h);c.fillRect(w-235,0,235,h);
    for(let y=-40+((this.roadOffset*0.8)%80);y<h;y+=80){
      c.fillStyle="#142a35";c.fillRect(28,y,3,34);c.fillRect(w-31,y,3,34);
      c.fillStyle="#18303a";c.fillRect(70,y+18,12,3);c.fillRect(w-82,y+18,12,3);
    }
    const roadX=235,roadW=490;
    c.fillStyle="#202735";c.fillRect(roadX,0,roadW,h);
    // Neon shoulder lines stay parallel from top to bottom.
    c.fillStyle=COLORS.pink;c.fillRect(roadX,0,5,h);c.fillRect(roadX+roadW-5,0,5,h);
    c.fillStyle="#667487";c.fillRect(roadX+11,0,2,h);c.fillRect(roadX+roadW-13,0,2,h);
    // Dashed lane dividers scroll at a constant speed and remain the same width.
    for(let lane=1;lane<=2;lane++){
      for(let y=-46+((this.roadOffset*1.25)%92);y<h;y+=92){
        c.fillStyle="#8995a8";c.fillRect(roadX+roadW*lane/3-2,y,4,42);
      }
    }
    // Small neon roadside lights: fixed-size marks reinforce the flat arcade style.
    for(let i=0;i<14;i++){
      const y=(i*53+this.roadOffset*1.5)%h;
      c.fillStyle=i%2?COLORS.cyan:COLORS.pink;c.shadowBlur=10;c.shadowColor=c.fillStyle;
      c.fillRect(roadX-18,y,4,12);c.fillRect(roadX+roadW+14,y,4,12);
    }c.shadowBlur=0;
    // The station and every pickup use the same scale wherever they are on screen.
    const sd=this.stationAt-this.distance;
    if(sd>-240&&sd<1350){const y=playerScreenY(sd,h);drawStation(c,this.stationSide<0?roadX-82:roadX+roadW+82,y);}
    for(const p of this.pickups){const d=p.distance-this.distance;if(d<0||d>1350)continue;const y=playerScreenY(d,h),x=roadX+roadW/2+p.lane*(roadW*.39);drawPickup(c,x,y,p.type,1);}
    // Rivals and player are top-down sprites with identical, fixed dimensions.
    for(const id of world.query(Transform,Car)){
      const car=world.getComponent(id,Car),t=world.getComponent(id,Transform);if(car.player)continue;
      const depth=t.y-this.distance;if(depth< -30||depth>1350)continue;
      const y=playerScreenY(depth,h),x=roadX+roadW/2+t.x*(roadW*.39);drawCar(c,x,y,1,car.color,false);
    }
    const px=roadX+roadW/2+this.playerX*(roadW*.39),py=h-92;drawCar(c,px,py,1.02,COLORS.cyan,true);
    if(this.shield>0){c.strokeStyle=COLORS.cyan;c.lineWidth=3;c.shadowBlur=18;c.shadowColor=COLORS.cyan;c.beginPath();c.ellipse(px,py,32,43,0,0,Math.PI*2);c.stroke();c.shadowBlur=0;}
    if(this.collisionFlash>0){c.fillStyle=`rgba(255,100,140,${this.collisionFlash*.25})`;c.fillRect(0,0,w,h);}
    drawHud(c,this);renderer.endFrame();
  }
}
function playerScreenY(depth,h){return h-92-depth*.42;}
function drawCar(c,x,y,s,color,player){
  const ww=38*s,hh=62*s;c.save();c.translate(Math.round(x),Math.round(y));
  // Top-down silhouette: hood at the top, rear lights at the bottom.
  c.shadowBlur=player?14:6;c.shadowColor=color;c.fillStyle="#05080e";c.fillRect(-ww*.62,-hh*.46,ww*1.24,hh*.92);
  c.fillStyle="#0b111d";c.fillRect(-ww*.56,-hh*.4,ww*1.12,hh*.8);
  c.fillStyle=color;c.beginPath();c.moveTo(-ww*.38,-hh*.47);c.lineTo(ww*.38,-hh*.47);c.lineTo(ww*.49,-hh*.2);c.lineTo(ww*.43,hh*.32);c.lineTo(ww*.28,hh*.46);c.lineTo(-ww*.28,hh*.46);c.lineTo(-ww*.43,hh*.32);c.lineTo(-ww*.49,-hh*.2);c.closePath();c.fill();
  c.shadowBlur=0;c.fillStyle="#17283b";c.fillRect(-ww*.29,-hh*.12,ww*.58,hh*.29);c.fillStyle="#31485c";c.fillRect(-ww*.24,-hh*.08,ww*.48,hh*.1);
  c.fillStyle="#eef5ff";c.fillRect(-ww*.36,-hh*.4,ww*.2,hh*.07);c.fillRect(ww*.16,-hh*.4,ww*.2,hh*.07);
  c.fillStyle=COLORS.pink;c.fillRect(-ww*.36,hh*.34,ww*.22,hh*.07);c.fillRect(ww*.14,hh*.34,ww*.22,hh*.07);
  c.fillStyle="#05080e";c.fillRect(-ww*.57,-hh*.22,ww*.12,hh*.22);c.fillRect(ww*.45,-hh*.22,ww*.12,hh*.22);c.fillRect(-ww*.57,hh*.12,ww*.12,hh*.22);c.fillRect(ww*.45,hh*.12,ww*.12,hh*.22);
  if(player){c.fillStyle="#ffffff";c.fillRect(-ww*.06,hh*.12,ww*.12,hh*.06);}c.restore();
}
function drawPickup(c,x,y,type,s){const colors={nitro:"#ff648c",fuel:"#ffc857",shield:"#63f4dc",points:"#b69cff"};const labels={nitro:"N",fuel:"F",shield:"S",points:"★"};c.save();c.translate(x,y);c.scale(s,s);c.shadowBlur=18;c.shadowColor=colors[type];c.fillStyle="#07101d";c.strokeStyle=colors[type];c.lineWidth=3;c.beginPath();c.roundRect(-16,-16,32,32,7);c.fill();c.stroke();c.shadowBlur=0;c.fillStyle=colors[type];c.font="bold 17px monospace";c.textAlign="center";c.textBaseline="middle";c.fillText(labels[type],0,1);c.restore();}
function drawStation(c,x,y){c.save();c.translate(Math.round(x),Math.round(y));c.shadowBlur=12;c.shadowColor="#ffc857";c.fillStyle="#0b1521";c.strokeStyle="#ffc857";c.lineWidth=2;c.fillRect(-29,-24,58,48);c.strokeRect(-29,-24,58,48);c.shadowBlur=0;c.fillStyle="#ffc857";c.font="bold 12px monospace";c.textAlign="center";c.fillText("GAS",0,-7);c.fillStyle="#63f4dc";c.fillRect(-16,1,32,7);c.fillStyle="#ff648c";c.fillRect(-20,14,40,4);c.restore();}
function drawHud(c,g){
  c.fillStyle="#07101de8";c.fillRect(16,14,244,111);c.strokeStyle="#31505d";c.strokeRect(16,14,244,111);
  c.fillStyle="#7f91aa";c.font="11px monospace";c.fillText("SPEED",30,34);c.fillStyle=COLORS.cyan;c.font="bold 32px monospace";c.fillText(String(Math.round(g.speed)).padStart(3,"0"),28,69);c.fillStyle="#eef5ff";c.font="10px monospace";c.fillText("KM/H",120,67);c.fillStyle="#7f91aa";c.fillText("DISTANCE",30,94);c.fillStyle="#eef5ff";c.font="bold 14px monospace";c.fillText(`${(g.distance/1000).toFixed(1)} KM`,112,94);
  c.fillStyle="#07101de8";c.fillRect(16,137,244,45);c.strokeStyle="#31505d";c.strokeRect(16,137,244,45);c.fillStyle="#7f91aa";c.font="10px monospace";c.fillText("FUEL",28,154);c.fillStyle="#263248";c.fillRect(75,145,170,12);c.fillStyle=g.fuel<25?"#ff648c":"#ffc857";c.fillRect(75,145,170*g.fuel/100,12);c.strokeStyle="#ffc857";c.strokeRect(75,145,170,12);c.fillStyle="#eef5ff";c.fillText(`${Math.ceil(g.fuel)}%`,207,174);
  c.fillStyle="#07101de8";c.fillRect(766,14,178,111);c.strokeStyle="#31505d";c.strokeRect(766,14,178,111);c.fillStyle="#7f91aa";c.font="11px monospace";c.fillText("SCORE",782,34);c.fillStyle=COLORS.pink;c.font="bold 27px monospace";c.fillText(String(g.score).padStart(6,"0"),780,67);c.fillStyle="#7f91aa";c.font="11px monospace";c.fillText(`TIME ${formatTime(g.elapsed)}`,782,93);c.fillText(`NITRO ${Math.round(g.nitro)}%`,782,111);c.fillStyle="#263248";c.fillRect(782,116,145,5);c.fillStyle=COLORS.pink;c.fillRect(782,116,145*g.nitro/100,5);
  if(g.stationMessage>0){c.fillStyle="#07101df0";c.fillRect(300,500,360,45);c.strokeStyle="#ffc857";c.strokeRect(300,500,360,45);c.fillStyle="#ffc857";c.font="bold 16px monospace";c.textAlign="center";c.fillText("REFUELING + FUEL",480,528);c.textAlign="left";}
  if(g.fuel<18){c.fillStyle="#ff648c";c.font="bold 14px monospace";c.textAlign="center";c.fillText("LOW FUEL! FIND A GAS STATION",480,210);c.textAlign="left";}
}
function formatTime(t){const m=Math.floor(t/60),s=(t%60).toFixed(1).padStart(4,"0");return `${String(m).padStart(2,"0")}:${s}`;}
