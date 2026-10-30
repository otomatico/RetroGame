import { World } from "../engine/ecs/World.js";
import { Transform, Velocity, Collider, Score } from "../engine/ecs/components.js";
import { Player, Star } from "./components.js";
export function createWorld(){
 const world=new World();
 const p=world.createEntity();world.addComponent(p,new Transform(480,510,32,38));world.addComponent(p,new Velocity());world.addComponent(p,new Player());world.addComponent(p,new Collider("player"));world.addComponent(p,new Score(0));
 // A deterministic field of stars, represented as ordinary ECS entities.
 let seed=713;
 const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 for(let i=0;i<95;i++){const id=world.createEntity();world.addComponent(id,new Transform(rand()*960,rand()*600,1,1));world.addComponent(id,new Star(22+rand()*75,rand()>.82?2:1));}
 return world;
}
