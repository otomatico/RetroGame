import { createWorld } from "./createWorld.js";
import { ShootEmUpSystems } from "./gameSystems.js";
import { GAME_WIDTH as W, GAME_HEIGHT as H, COLORS as C } from "./constants.js";

class BaseState { enter(game){game.statusLabel();} update(){} handleAction(){} render(){} }
export class MenuState extends BaseState {
 render(game,renderer){const c=renderer.renderer.ctx;renderer.beginFrame();drawBackdrop(c);center(renderer,"SKY / STRIKE",156,58,C.cyan);center(renderer,"VERTICAL SCROLL SHOOT 'EM UP",207,16,C.pink);drawMiniPlane(c,W/2,274,1,C.cyan);center(renderer,"FIGHTERS  ·  POWER-UPS  ·  HEAVY BOSS",344,14,C.white);center(renderer,"WASD / ARROWS TO MOVE",390,13,C.muted);center(renderer,"HOLD SPACE TO FIRE  ·  X SMART BOMB",418,13,C.muted);center(renderer,"PRESS ENTER TO DEPLOY",490,18,C.pink);renderer.endFrame();}
 handleAction(game,a){if(a==="confirm"){game.audio.play("start");game.world=createWorld();game.systems=new ShootEmUpSystems();game.stateMachine.change("playing",game);}if(a==="toggleLanguage")game.localization.toggle();if(a==="toggleSound")game.toggleSound();}
}
export class PlayState extends BaseState {
 enter(game){if(!game.world||!game.systems){game.world=createWorld();game.systems=new ShootEmUpSystems();}this.onHit=()=>game.audio.play("wall-hit");this.onEnemy=()=>game.audio.play("score");this.onOver=()=>game.audio.play("game-over");game.events.on("playerHit",this.onHit);game.events.on("enemyDown",this.onEnemy);game.events.on("gameOver",this.onOver);}
 exit(game){game.events.off("playerHit",this.onHit);game.events.off("enemyDown",this.onEnemy);game.events.off("gameOver",this.onOver);}
 update(game,dt){game.systems.update(game.world,game.input,game.events,dt);if(game.systems.gameOver)game.stateMachine.change("gameover",game);else if(game.systems.victory)game.stateMachine.change("victory",game);}
 handleAction(game,a){if(a==="pause")game.stateMachine.change("paused",game);if(a==="restart")game.stateMachine.change("menu",game);if(a==="bomb")game.systems.activateBomb(game.world,game.events);if(a==="toggleLanguage")game.localization.toggle();if(a==="toggleSound")game.toggleSound();}
 render(game,r){game.systems.draw(game.world,r);}
}
export class PauseState extends BaseState {
 render(game,r){game.systems.draw(game.world,r);const c=r.renderer.ctx;c.fillStyle="#050812d9";c.fillRect(0,0,W,H);center(r,"PAUSED",265,48,C.cyan);center(r,"P / ESC TO RESUME",320,15,C.white);center(r,"R TO RETURN TO MENU",353,13,C.muted);}
 handleAction(game,a){if(a==="pause"||a==="confirm")game.stateMachine.change("playing",game);if(a==="restart")game.stateMachine.change("menu",game);if(a==="toggleLanguage")game.localization.toggle();if(a==="toggleSound")game.toggleSound();}
}
export class GameOverState extends BaseState {
 render(game,r){game.systems.draw(game.world,r);const c=r.renderer.ctx;c.fillStyle="#050812e0";c.fillRect(0,0,W,H);center(r,"MISSION FAILED",250,42,C.pink);center(r,`FINAL SCORE  ${game.systems.score}`,310,20,C.white);center(r,"ENTER TO TRY AGAIN  ·  R TO MENU",390,14,C.muted);}
 handleAction(game,a){if(a==="confirm"){game.world=createWorld();game.systems=new ShootEmUpSystems();game.stateMachine.change("playing",game);}if(a==="restart")game.stateMachine.change("menu",game);if(a==="toggleLanguage")game.localization.toggle();if(a==="toggleSound")game.toggleSound();}
}
export class VictoryState extends BaseState {
 render(game,r){game.systems.draw(game.world,r);const c=r.renderer.ctx;c.fillStyle="#050812d9";c.fillRect(0,0,W,H);center(r,"SECTOR CLEARED",250,42,C.cyan);center(r,`FINAL SCORE  ${game.systems.score}`,310,20,C.white);center(r,"ENTER TO FLY AGAIN  ·  R TO MENU",390,14,C.muted);}
 handleAction(game,a){if(a==="confirm"){game.world=createWorld();game.systems=new ShootEmUpSystems();game.stateMachine.change("playing",game);}if(a==="restart")game.stateMachine.change("menu",game);if(a==="toggleLanguage")game.localization.toggle();if(a==="toggleSound")game.toggleSound();}
}
function center(r,s,y,size,color){r.text(s,W/2,y,{color,size});}
function drawBackdrop(c){c.fillStyle="#070b13";c.fillRect(0,0,W,H);const g=c.createLinearGradient(0,0,W,H);g.addColorStop(0,"#0e1a2a");g.addColorStop(.55,"#15152a");g.addColorStop(1,"#080d17");c.fillStyle=g;c.fillRect(0,0,W,H);c.strokeStyle="#20384a";for(let x=20;x<W;x+=48){c.beginPath();c.moveTo(x,0);c.lineTo(x,H);c.stroke();}for(let y=0;y<H;y+=48){c.beginPath();c.moveTo(0,y);c.lineTo(W,y);c.stroke();}c.fillStyle=C.pink;c.fillRect(0,222,W,2);}
function drawMiniPlane(c,x,y,s,color){c.save();c.translate(x,y);c.scale(s,s);c.shadowBlur=22;c.shadowColor=color;c.fillStyle=color;c.beginPath();c.moveTo(0,-58);c.lineTo(14,-12);c.lineTo(56,25);c.lineTo(52,37);c.lineTo(12,22);c.lineTo(8,53);c.lineTo(0,61);c.lineTo(-8,53);c.lineTo(-12,22);c.lineTo(-52,37);c.lineTo(-56,25);c.lineTo(-14,-12);c.closePath();c.fill();c.restore();}
