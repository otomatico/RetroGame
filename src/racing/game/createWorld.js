import { World } from "../engine/ecs/World.js";
import { Transform, Velocity, Collider, Car, Score } from "../engine/ecs/components.js";

const AI = [
  {name:"NOVA", color:"#ff648c", lane:-0.55, speed:174},
  {name:"BYTE", color:"#ffc857", lane:0.5, speed:187},
  {name:"GHOST", color:"#9a8cff", lane:0.05, speed:198},
  {name:"VOLT", color:"#63f4dc", lane:-0.15, speed:181}
];
export function createWorld(){
  const world=new World();
  const player=world.createEntity();
  world.addComponent(player,new Transform(0,0,42,68));
  world.addComponent(player,new Velocity());
  world.addComponent(player,new Car({player:true,lane:0,color:"#63f4dc",speed:0,name:"YOU"}));
  world.addComponent(player,new Collider("car"));
  world.addComponent(player,new Score(0));
  AI.forEach((data,i)=>{
    const id=world.createEntity();
    world.addComponent(id,new Transform(0,220+i*310,38,62));
    world.addComponent(id,new Velocity());
    world.addComponent(id,new Car(data));
    world.addComponent(id,new Collider("car"));
  });
  return world;
}
