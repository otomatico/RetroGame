// Componentes: solo datos; las reglas viven en sistemas.
export class Transform{constructor(x=0,y=0,width=0,height=0){Object.assign(this,{x,y,width,height});}}
export class Velocity{constructor(x=0,y=0){Object.assign(this,{x,y});}}
export class Paddle{constructor({speed=520,baseWidth=112}={}){Object.assign(this,{speed,baseWidth,width:baseWidth,wideTime:0});}}
export class Ball{constructor({radius=8,stuck=true}={}){Object.assign(this,{radius,stuck});}}
export class Brick{constructor({hits=1,color='#63f4dc',points=50,powerChance=.16}={}){Object.assign(this,{hits,color,points,powerChance});}}
export class PowerUp{constructor({kind='wide',speed=145}={}){Object.assign(this,{kind,speed});}}
