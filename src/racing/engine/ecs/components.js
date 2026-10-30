// ECS components are data-only; systems own behavior.
export class Transform { constructor(x=0,y=0,width=10,height=10){Object.assign(this,{x,y,width,height});} }
export class Velocity { constructor(x=0,y=0){Object.assign(this,{x,y});} }
export class Collider { constructor(kind="solid"){this.kind=kind;} }
export class Score { constructor(value=0){this.value=value;} }
export class Car { constructor({player=false,lane=0,color="#63f4dc",speed=0,name="RACER"}={}){Object.assign(this,{player,lane,color,speed,name});} }
export class TrackMarker { constructor(kind="cone"){this.kind=kind;} }
