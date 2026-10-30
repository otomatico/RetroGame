import { createWorld } from "./createWorld.js";
import { RacingSystems } from "./gameSystems.js";
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from "./constants.js";

class BaseState { enter(game){game.statusLabel();} update(){} handleAction(){} render(){} }
export class MenuState extends BaseState {
  render(game,renderer){const c=renderer.renderer.ctx;renderer.beginFrame();drawMenuBackdrop(c);centered(renderer,"NEON / RUSH",172,58,COLORS.cyan);centered(renderer,"VERTICAL SCROLL / HIGHWAY SURVIVAL",222,15,COLORS.pink);centered(renderer,"TRAFFIC  ·  POWER-UPS  ·  GAS STATIONS",302,14,COLORS.white);centered(renderer,"A / D OR ← / →   STEER",350,13,COLORS.muted);centered(renderer,"W / ↑ ACCELERATE    S / ↓ BRAKE",376,13,COLORS.muted);centered(renderer,"SPACE NITRO  ·  PULL OVER + BRAKE TO REFUEL",402,12,COLORS.muted);centered(renderer,"PRESS ENTER TO START",488,18,COLORS.pink);renderer.endFrame();}
  handleAction(game,action){if(action==="confirm"){game.audio.play("start");game.world=createWorld();game.systems=new RacingSystems();game.stateMachine.change("playing",game);}if(action==="toggleLanguage")game.localization.toggle();if(action==="toggleSound")game.toggleSound();}
}
export class PlayState extends BaseState {
  enter(game){if(!game.world||!game.systems){game.world=createWorld();game.systems=new RacingSystems();}this.onCollision=()=>game.audio.play("wall-hit");this.onLap=()=>game.audio.play("score");this.onFinish=()=>game.audio.play("game-over");game.events.on("collision",this.onCollision);game.events.on("lap",this.onLap);game.events.on("finish",this.onFinish);}
  exit(game){game.events.off("collision",this.onCollision);game.events.off("lap",this.onLap);game.events.off("finish",this.onFinish);}
  update(game,dt){game.systems.update(game.world,game.input,game.events,dt);if(game.systems.finished)game.stateMachine.change("victory",game);}
  handleAction(game,action){if(action==="pause")game.stateMachine.change("paused",game);if(action==="restart")game.stateMachine.change("menu",game);if(action==="toggleLanguage")game.localization.toggle();if(action==="toggleSound")game.toggleSound();}
  render(game,renderer){game.systems.draw(game.world,renderer,game.localization);}
}
export class PauseState extends BaseState {
  render(game,renderer){game.systems.draw(game.world,renderer,game.localization);const c=renderer.renderer.ctx;c.fillStyle="#050812c9";c.fillRect(0,0,GAME_WIDTH,GAME_HEIGHT);centered(renderer,"PAUSED",270,46,COLORS.cyan);centered(renderer,"P / ESC TO RESUME",326,15,COLORS.white);centered(renderer,"R TO RETURN TO MENU",359,13,COLORS.muted);}
  handleAction(game,action){if(action==="pause"||action==="confirm")game.stateMachine.change("playing",game);if(action==="restart")game.stateMachine.change("menu",game);if(action==="toggleLanguage")game.localization.toggle();if(action==="toggleSound")game.toggleSound();}
}
export class VictoryState extends BaseState {
  render(game,renderer){game.systems.draw(game.world,renderer,game.localization);const c=renderer.renderer.ctx;c.fillStyle="#050812d9";c.fillRect(0,0,GAME_WIDTH,GAME_HEIGHT);centered(renderer,"HIGHWAY COMPLETE",245,43,COLORS.cyan);centered(renderer,`SCORE  ${game.systems.score}`,306,21,COLORS.white);centered(renderer,`DISTANCE  ${(game.systems.distance/1000).toFixed(1)} KM  ·  TIME ${formatTime(game.systems.elapsed)}`,345,15,COLORS.pink);centered(renderer,"ENTER TO DRIVE AGAIN  ·  R TO MENU",420,14,COLORS.muted);}
  handleAction(game,action){if(action==="confirm"){game.world=createWorld();game.systems=new RacingSystems();game.stateMachine.change("playing",game);}if(action==="restart")game.stateMachine.change("menu",game);if(action==="toggleLanguage")game.localization.toggle();if(action==="toggleSound")game.toggleSound();}
}
function centered(r,text,y,size,color){r.text(text,GAME_WIDTH/2,y,{color,size});}
function drawMenuBackdrop(c){c.fillStyle="#070b13";c.fillRect(0,0,GAME_WIDTH,GAME_HEIGHT);const g=c.createLinearGradient(0,0,GAME_WIDTH,GAME_HEIGHT);g.addColorStop(0,"#0e1a2a");g.addColorStop(.5,"#21172f");g.addColorStop(1,"#080d17");c.fillStyle=g;c.fillRect(0,0,GAME_WIDTH,GAME_HEIGHT);c.strokeStyle="#20384a";c.lineWidth=1;for(let x=-400;x<1400;x+=55){c.beginPath();c.moveTo(GAME_WIDTH/2,200);c.lineTo(x,GAME_HEIGHT);c.stroke();}for(let y=230;y<600;y+=35){c.beginPath();c.moveTo(0,y);c.lineTo(GAME_WIDTH,y);c.stroke();}c.fillStyle="#ff648c";c.fillRect(0,199,GAME_WIDTH,2);}
function formatTime(t){const m=Math.floor(t/60),s=(t%60).toFixed(2).padStart(5,"0");return `${String(m).padStart(2,"0")}:${s}`;}
