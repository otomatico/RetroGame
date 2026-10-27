# 🌍 Pattern - Abstraction
La idea es basandose en los juego ya hecho extrair un patron que sirva para contruir un motor de desarrollo.

## Game - La base del juego
Definamos como deberia ser la clase juego que contiene de forma el array de entidades que es el mundo del juego `world`.
El cambio de estado y los estados que adopta el juego.


### Bucle principal
El codigo SIEMPRE se ejecuta en un loop que hace actualiza (Update) y dibuja (draw/render)

```javascript
loop (currentTime){
    const dt = Math.min(currentTime - lastTime, 16);//60 FPS cada 16ms una imagem
    lastTime = currentTime;
    currentState.update(dt);
    currentState.render();
    requestAnimationFrame(loop);
}
```

Hemos definido que TODO juego tiene los siguientes estados [BOOT|MENU|PLAYING|PAUSE|OVER]. 
La clase juego se queda asi:

```javascript
const STATE = { 
    BOOT: 'boot',
    MENU: 'menu', 
    PLAYING: 'playing', 
    PAUSE:'pause', 
    OVER: 'over' 
};
class Game
{
    construct()
    {
        this.world = [];
        this.currentState = new StateGame()
        //textos y recursos para el juego. Podria venir en varios idiomas.
        this.text = JSON.Parse(jsonRecurse)
        // Crea los objetos para cada estado
        this.States[STATE.BOOT] = new StateBoot(this);
        this.States[STATE.MENU] = new StateMenu(this);
        this.States[STATE.PLAYING] = new StatePlay(this);
        this.States[STATE.PAUSE] = new StatePause(this);
        this.States[STATE.OVER] = new StateOver(this);

    }

    state(stateGAME)
    {
        this.currentState = null; //forza liberar memoria
        this.currentState = this.States[stateGame];
        this.currentState.init();//invoca la inicializacion de la clase.
    }

    loop(currentTime){
        const _loop = this.loop
        const dt = Math.min(currentTime - lastTime, 16);//60 FPS cada 16ms una imagem
        lastTime = currentTime;
        this.currentState.update(dt);
        this.currentState.draw();
        requestAnimationFrame(_loop);
    }
}

```

## StateGame - Las funciones basicas para los estados
Todos los estados deberian implementar funciones de update, render y init.
Asi que definamos una **"clase abstracta"**

```javascript
class StateGame{
    construct(gameObject){
        this.data = gameObject
    }
    init(){
        throw new Error("Metodo no implementado");
    };
    update(dt){
        throw new Error("Metodo no implementado");
    };
    render(){
        throw new Error("Metodo no implementado");
    };

}
```
Asi obligo a que todos implemente las funciones si no quieren un mensaje de error.

### BOOT - La pantalla de carga
La implementacion del objecto `BOOT` seria

```javascript
class StateBoot extends StateGame
{
    construct(data)
    {
        this.data =  data;
        this.acumulatorTime=0;
    }
    init()
    {
        this.acumulatorTime=0;
    }
    render()
    {
        drawText('OTOMATICO ©®', VW / 2, VH / 2, 40);
    }
    update(dt)
    {
        this.acumulatorTime+=dt;
        if (this.acumulatorTime > 2000){
            this.data.state(STATE.MENU)
        }
    }
}

```

### Menu - La puerta de Entrada a un nuevo juego
Para menu inicializemos el mundo y esperamos pulsar un boton para seguir mientras hacemos animaciones.

```javascript
class StateMenu extends StateGame
{
    construct(data)
    {
        this.data =  data;
        this.acumulatorTime=0;
    }
    init()
    {
        this.acumulatorTime=0;
        initializateECS(this.data.world)
    }
    initializateECS(world)
    {
        //...
    }
    render()
    {
        drawText(`${this.data.text['GameName']}`, VW / 2, VH / 2, 40);
        if(this.acumulatorTime>500){
            drawText(`${this.data.text['presskey']}`, VW / 2, VH / 2+50, 20);
        }

    }
    update(dt)
    {
        this.acumulatorTime+=dt;
        if(this.acumulatorTime>1000){
            this.acumulatorTime=0
        }
        if (this.data.anyKey){
            this.data.state(STATE.PLAYING)
        }
    }
}

```

### Playing - Ahora es personal
Aqui es donde esta los sistemas, componentes del juego

```javascript
class StatePlay extends StateGame
{
    construct(data)
    {
        this.data =  data;

    }
    init()
    {
        //...
    }
    render()
    {
        //...

    }
    update(dt)
    {
        //...
    }
}

```

### Pause - Para todo que se me cayo algo
En algunos juegos habrá menus interno que requiera parar el juego o simplesmente se el usuario quiere parar el juego.

```javascript
class StatePause extends StateGame
{
    construct(data)
    {
        this.data =  data;

    }
    init()
    {
        continue;
    }
    render()
    {
        drawText('PAUSE', VW / 2, VH / 2, 40);

    }
    update(dt)
    {
        if (this.data.anyKey){
            this.data.state(STATE.PLAYING)
        }
    }
}

```
### Over - Todo acabo ahora toca recoger
Esta bien liberar toda la memoria y recursos. Quizas incluso una pantalla de score o simplesmente un Game Over.

```javascript
class StateOver extends StateGame
{
    construct(data)
    {
        this.data =  data;

    }
    init()
    {
        this.data.world=[];
        this.acumulatorTime=0;
    }
    render()
    {
        drawText('Game Over', VW / 2, VH / 2, 40);
        if(this.acumulatorTime>500){
            drawText(`${this.data.text['presskey']}`, VW / 2, VH / 2+50, 20);
        }

    }
    update(dt)
    {
        this.acumulatorTime+=dt;
        if(this.acumulatorTime>1000){
            this.acumulatorTime=0;
        }
    }
}

```