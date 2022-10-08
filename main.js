import { world } from "mojang-minecraft";

let targets = {};
let oldDate = Date.now();
let over = world.getDimension(`overworld`);

// --------------------------
// Добавить объект:
newTarget("Тест",0.5,4.5,0.5,0,() => {
    over.runCommand(`say yes`);
},1,(pl) => {
    over.runCommand(`say ${pl.name}`);
});


// --------------------------

world.events.tick.subscribe(({ currentTick }) => {
    let newDate = Date.now();
    let delta = (newDate - oldDate) / 1000;
    oldDate = newDate;
    if (delta < 0)
    delta = 0;
    
    let bestObj, bestDist = 99;
    for (let pl of [...world.getPlayers()]) {
        if (pl?.getComponent("inventory")?.container.getItem(pl?.selectedSlot)?.id == "quest:act") {
        for (let name of Object.keys(targets)) {
            let x = pl.location.x + pl.viewVector.x * 1;
            let y = pl.location.y + pl.viewVector.y * 1 + 1.62;
            let z = pl.location.z + pl.viewVector.z * 1;
            let res = Math.sqrt((x - targets[name].x) ** 2 + (y - targets[name].y) ** 2 + (z - targets[name].z) ** 2);
            if (res < bestDist) {
            bestDist = res;
            bestObj = name;
            }
        }
        if (bestDist > 1) {
            if (pl.hasTag("clicked")) {
    pl.removeTag("clicked");
            }
            text("Осмотреть:",pl);
        }
        else {
            text(`Осмотреть: ${bestObj}`,pl);
            if (pl.hasTag("clicked")) {
                pl.removeTag("clicked");
                if (!pl?.action?.length)
                pl.action = [...targets[bestObj].other];
            }
        }
    }
    if (Array.isArray(pl.action)) {
        if (pl.action.length > 1) {
            if (pl.action[0] <= 0) {
                pl.action.shift();
                try {
                pl.action.shift()(pl);
                } catch {over.runCommand(`say error`)}
            }
            else {
                pl.action[0] -= delta;
            }
        }
    }
    }
})

function newTarget(name,x,y,z,...other) {
    if (other.length % 2 != 0 || other.length == 0)
    return;
    targets[name] = {};
    targets[name].x = x;
    targets[name].y = y;
    targets[name].z = z;
    targets[name].other = other;
}
function text(text,player) {
    player.runCommand(`title @s actionbar ${text}`);
}
