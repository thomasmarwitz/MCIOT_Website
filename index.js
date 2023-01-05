const start = document.getElementById("start-game")
start.addEventListener("click", startGame);

const reset = document.getElementById("stop-game")
reset.addEventListener("click", destroyGame);



const DIRECTION = Object.freeze({
    up: 0,
    down: 1,
    left: 2,
    right: 3,  
});
const GAME_SIZE = 1000;
const TILE_SIZE = 50;
const GRID_SIZE = GAME_SIZE / TILE_SIZE; // 20

function gridToPixel(gridPos) {
    return [gridPos[0] * TILE_SIZE, gridPos[1] * TILE_SIZE];
}

function pixelToGrid(pixelPos) {
    return [Math.floor(pixelPos[0] / TILE_SIZE), Math.floor(pixelPos[1] / TILE_SIZE)];
}

const CANVAS_BACKGROUND = "#F0EAD6";
const FOOD_COLOR = "#f1d247";
const BLACK = "#000000";
const SNAKE_COLOR = "#cccccc";

// state
var currentDirection = DIRECTION.right;
var directionCommand = DIRECTION.right;
var currentSnake = [[0, 0]];
var currentSnakeLength = 1; 

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

console.log("canvas", canvas.width, canvas.height);
console.log("ctx", ctx);



function drawTile(xPos, yPos, fillColor, strokeColor) {
    ctx.fillStyle = strokeColor;
    ctx.fillRect(xPos, yPos, TILE_SIZE, TILE_SIZE);

    ctx.fillStyle = fillColor;
    ctx.fillRect(xPos+1, yPos+1, TILE_SIZE-2, TILE_SIZE-2);
}

function drawSnake(xPos, yPos) {
    for (var i = 0; i < currentSnake.length; i++) {
        const [xPos, yPos] = gridToPixel(currentSnake[i]);
        drawTile(xPos, yPos, SNAKE_COLOR, BLACK);
    }
    
    drawTile(xPos, yPos, SNAKE_COLOR, BLACK);
}

function drawFood(pos) {
    const [px, py] = gridToPixel(pos);
    drawTile(px, py, FOOD_COLOR, BLACK);
}

function addKeyControls(event) {
    if (event.keyCode === 38) {
        console.log("up");
        directionCommand = DIRECTION.up;
    } else if (event.keyCode === 40) {
        console.log("down");
        directionCommand = DIRECTION.down;
    } else if (event.keyCode === 37) {
        console.log("left");
        directionCommand = DIRECTION.left;
    } else if (event.keyCode === 39) {
        console.log("right");
        directionCommand = DIRECTION.right;
    }
}

var food = getFood();

function getFood() {
    let food = [Math.floor(Math.random() * GRID_SIZE), Math.floor(Math.random() * GRID_SIZE)];
    while (includes(currentSnake, food)) {
        food = [Math.floor(Math.random() * GRID_SIZE), Math.floor(Math.random() * GRID_SIZE)];
    }
    return food;
}

window.addEventListener("deviceorientation", handleOrientation, true);

function handleOrientation(event) { 
	// var ax = event.acceleration.x;
	// var ay = event.accelerationIncludingGravity.y
	// var az = event.accelerationIncludingGravity.z
    // let pitch = Math.atan(ax / Math.sqrt((Math.pow(ay,2) + Math.pow(az,2))) );
    // let roll = Math.atan(ay / Math.sqrt((Math.pow(ax,2) + Math.pow(az,2))) );
    // let theta = Math.atan(Math.sqrt((Math.pow(ax,2) + Math.pow(ay,2))) /az);
    const absolute = event.absolute;
    const alpha = event.alpha.toFixed(2);
    const beta = event.beta.toFixed(2);
    const gamma = event.gamma.toFixed(2);

    const output_angle = document.getElementById("angle-data");
    output_angle.innerHTML = "alpha: " + alpha + "<br>" + "beta: " + beta + "<br>" + "gamma: " + gamma;
    
}

// window.addEventListener("deviceorientation", function(event) {
// 	document.querySelector("#mag").innerHTML = "alpha = " + event.alpha + "<br>" + "beta = " + event.beta + "<br>" + "gamma = " + event.gamma;
// }, true);

function gameLoopFunc() {
    {
        console.log("gameLoop");

        ctx.fillStyle = CANVAS_BACKGROUND;
        ctx.fillRect(0, 0, GAME_SIZE, GAME_SIZE);

        drawFood(food);
        drawSnake(currentSnake);
        
        const snakeHead = currentSnake[0];
        const [xPos, yPos] = snakeHead;
        const newPos = [xPos, yPos];
        
        if (directionCommand === DIRECTION.up && currentDirection !== DIRECTION.down) {
            currentDirection = DIRECTION.up;
        } else if (directionCommand === DIRECTION.down && currentDirection !== DIRECTION.up) {
            currentDirection = DIRECTION.down;
        } else if (directionCommand === DIRECTION.left && currentDirection !== DIRECTION.right) {
            currentDirection = DIRECTION.left;
        } else if (directionCommand === DIRECTION.right && currentDirection !== DIRECTION.left) {
            currentDirection = DIRECTION.right;
        }

        switch (currentDirection) {
            case DIRECTION.up:
                newPos[1] -= 1;
                break;
            case DIRECTION.down:
                newPos[1] += 1;
                break;
            case DIRECTION.left:
                newPos[0] -= 1;
                break;  
            case DIRECTION.right:
                newPos[0] += 1;
                break;
        }

        newPos[0] = (newPos[0] + GRID_SIZE) % GRID_SIZE;
        newPos[1] = (newPos[1] + GRID_SIZE) % GRID_SIZE;

        if (includes(currentSnake, newPos)) {
            destroyGame();
            return;
        }
        
        currentSnake.splice(0, 0, newPos);


        if (newPos[0] === food[0] && newPos[1] === food[1]) {
            currentSnakeLength += 1;
            food = getFood();
        } else {
            currentSnake.pop();
        }
    }
}

function includes(arr, item) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i][0] === item[0] && arr[i][1] === item[1]) {
            return true;
        }
    }
    return false;
}

let gameLoop = null;
function startGame() {
    if (gameLoop !== null) return;

    currentSnake = [[0, 0]];
    currentSnakeLength = 1; 
    food = getFood();

    document.addEventListener("keydown", addKeyControls);

    gameLoop = setInterval(gameLoopFunc, 100);
}

function destroyGame() {
    if (gameLoop === null) return;
    clearInterval(gameLoop);
    document.removeEventListener("keydown", addKeyControls);

    document.getElementById("highscore").textContent = `Your Highscore: ${currentSnakeLength}`;
    gameLoop = null;
}