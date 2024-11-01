const canvas = document.getElementById("snake");
const ctx = canvas.getContext("2d");

let score = 0;
let scoreObj = document.querySelector('#score');

let foodImage = new Image();
foodImage.src = 'img/apple.png';

let rocks = []
let rockImage = new Image();
rockImage.src = 'img/rock.png';
let candy=null;
let candyImage = new Image();
candyImage.src = 'img/candy.png';

const gridSize = 32;
const canvasWidth = canvas.width / gridSize;
const canvasHeight = canvas.height / gridSize;

let snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
let direction = { x: 1, y: 0 };
let food = null;
food = getRandomPosition();
let startSnakeSpeed = 10;
let snakeSpeed = startSnakeSpeed;
let lastRenderTime = 0;

const headTexture = new Image();
headTexture.src = "img/head_left.png";
const bodyTexture = new Image();
bodyTexture.src = "img/body_horizontal.png";
const tailTexture = new Image();
tailTexture.src = "img/tail_left.png";
const turnBottomLeftTexture = new Image();
turnBottomLeftTexture.src = "img/body_bottomleft.png";
const turnBottomRightTexture = new Image();
turnBottomRightTexture.src = "img/body_bottomright.png";
const turnTopLeftTexture = new Image();
turnTopLeftTexture.src = "img/body_topleft.png";
const turnTopRightTexture = new Image();
turnTopRightTexture.src = "img/body_topright.png";

let lastTexture;
let not_pop_snake = 0;
let lock_changeDir = false;

const leftButton = document.getElementById("button_left")
const upButton = document.getElementById("button_up")
const downButton = document.getElementById("button_down")
const rightButton = document.getElementById("button_right")
const autopilot_button = document.getElementById("autopilot_button");
let autopilot = false;

const snakeAI = new SnakeAI({ width: canvasWidth, height: canvasHeight }, snake, rocks);

function getRandomPosition() {
    let positions = [];
    for (let x = 0; x < canvasWidth; x++) {
        for (let y = 0; y < canvasHeight; y++) {
            if (snake.filter(el=>x == el.x && y == el.y).length == 0 && 
                rocks.filter(el=>x == el.x && y == el.y).length == 0
            )
                positions.push({x: x, y: y})
        }
    }
    let pos = positions[Math.floor(Math.random() * (positions.length - 1))]
    return pos;
}

function main(currentTime) {
    window.requestAnimationFrame(main);
    const secondsSinceLastRender = (currentTime - lastRenderTime) / 1000;
    if (secondsSinceLastRender < 1 / snakeSpeed) return;
    lastRenderTime = currentTime;

    update();
    draw();
}

function spawnRocks(){
    let countrocks = Math.trunc(score / 5) * 3
    if (rocks.length < countrocks){
        let countIterations = countrocks - rocks.length;
        for (let i = 0; i < countIterations; i++) {
            rocks.push(getRandomPosition())
        }
    }
    snakeAI.rocks = rocks
}

let removerCandy;
function update() {
    if (autopilot){
        const nextMove = snakeAI.findPathToFood(food, candy);
        if (nextMove) {
            direction = nextMove;
        }
    }

    const head = { ...snake[0] };
    head.x += direction.x;
    head.y += direction.y;

    // Переносим голову на противоположный край, если она выходит за границы
    if (head.x < 0) head.x = canvasWidth - 1;
    if (head.x >= canvasWidth) head.x = 0;
    if (head.y < 0) head.y = canvasHeight - 1;
    if (head.y >= canvasHeight) head.y = 0;
    let chance = Math.random();
    if (candy==null && chance < 0.005){
        candy = candy=getRandomPosition();
        removerCandy = setTimeout(()=>{candy=null;}, 5000)
    }
    if (candy && head.x === candy.x && head.y === candy.y) {
        if (removerCandy)
            clearTimeout(removerCandy)
        candy = null
        not_pop_snake = 3
        score += 2;
        scoreObj.innerHTML = score
        snakeSpeed = startSnakeSpeed + Math.trunc(score / 3) * 0.5;
        spawnRocks();
    }
    if (head.x === food.x && head.y === food.y) {
        score += 1;
        scoreObj.innerHTML = score
        not_pop_snake = 1
        food = getRandomPosition();
        snakeSpeed = startSnakeSpeed + Math.trunc(score / 3) * 0.5;
        spawnRocks();
    } else {
        if (not_pop_snake == 0){
            snake.pop();
        }else{
            not_pop_snake = not_pop_snake - 1
        }
    }

    if (head.x < 0 || head.x >= canvasWidth || head.y < 0 || head.y >= canvasHeight || 
        rocks.some((segment, index) => segment.x === head.x && segment.y === head.y) || 
        snake.some((segment, index) => index > 0 && segment.x === head.x && segment.y === head.y)) {
        resetGame();
    }

    snake.unshift(head);
    lock_changeDir = false;
    snakeAI.snake = snake
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Рисуем еду
    ctx.drawImage(foodImage, food.x * gridSize, food.y * gridSize, gridSize, gridSize);
    if (candy)
        ctx.drawImage(candyImage, candy.x * gridSize, candy.y * gridSize, gridSize, gridSize);

    rocks.forEach(rock=>{
        // Рисуем камни
        ctx.drawImage(rockImage, rock.x * gridSize, rock.y * gridSize, gridSize, gridSize);
    })

    // Рисуем сегменты змейки с поворотом
    snake.forEach((segment, index) => {
        let img, angle = 0;
        let flip = 1
        if (index === 0) { 
            // Голова
            img = headTexture;
            angle = getRotationAngle(segment, snake[1]);
            if (angle == Math.PI){
                angle = 0;
                flip = -1;
            }
        } else if (index === snake.length - 1) { 
            // Хвост
            img = tailTexture;
            angle = getRotationAngle(snake[index - 1], segment);
        } else if (checkIfTurn(snake[index - 1], snake[index + 1])){ 
            // поворот
            img = getTurnTexture(snake[index - 1], segment, snake[index + 1]);
            angle = 0;
        }else{
            // Тело
            img = bodyTexture;
            angle = getRotationAngle(snake[index - 1], segment);
        }


        ctx.save();
        ctx.translate(segment.x * gridSize + gridSize / 2, segment.y * gridSize + gridSize / 2);
        ctx.rotate(angle);
        if (flip < 0) {
            ctx.scale(-1, 1);
        }
        ctx.drawImage(img, -gridSize / 2, -gridSize / 2, gridSize, gridSize);
        ctx.restore();
    });
}

function resetGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    candy = null;
    rocks = []
    snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
    direction = { x: 1, y: 0 };
    food = getRandomPosition();
    snakeSpeed = startSnakeSpeed;
    score = 0;
    scoreObj.innerHTML = score
}

function changeDirection(event) {
    if (lock_changeDir == false && !autopilot){
        const key = event.key;
        const { x, y } = direction;
    
        if (key === "ArrowUp" && y === 0) direction = { x: 0, y: -1 };
        if (key === "ArrowDown" && y === 0) direction = { x: 0, y: 1 };
        if (key === "ArrowLeft" && x === 0) direction = { x: -1, y: 0 };
        if (key === "ArrowRight" && x === 0) direction = { x: 1, y: 0 };
        lock_changeDir = true;
    }
}

function getRotationAngle(segment1, segment2) {
    if (!segment2) return 0;

    // Расчет разницы с учетом "прохода сквозь стену"
    let dx = segment2.x - segment1.x;
    let dy = segment2.y - segment1.y;

    // Проверка и корректировка на переход через границы
    if (dx < -1) dx = 1;        // Переход справа налево
    if (dx > 1) dx = -1;        // Переход слева направо
    if (dy < -1) dy = 1;        // Переход снизу вверх
    if (dy > 1) dy = -1;        // Переход сверху вниз

    // Возвращаем корректный угол на основе направления
    if (dx === 1) return 0;              // Направление вправо
    if (dx === -1) return Math.PI;       // Направление влево
    if (dy === 1) return Math.PI / 2;    // Направление вниз
    if (dy === -1) return -Math.PI / 2;  // Направление вверх

    return 0;
}

function checkIfTurn(prev, next) {
    return (prev.x !== next.x && prev.y !== next.y);
}

function getTurnTexture(prev, current, next){
    // Рассчитываем разницы координат
    let dxPrev = current.x - prev.x;
    let dyPrev = current.y - prev.y;
    let dxNext = next.x - current.x;
    let dyNext = next.y - current.y;

    // Обработка перехода через границы для предыдущего сегмента
    if (Math.abs(dxPrev) > 1) dxPrev = -dxPrev / Math.abs(dxPrev); // Корректируем направление
    if (Math.abs(dyPrev) > 1) dyPrev = -dyPrev / Math.abs(dyPrev); // Корректируем направление

    // Обработка перехода через границы для следующего сегмента
    if (Math.abs(dxNext) > 1) dxNext = -dxNext / Math.abs(dxNext); // Корректируем направление
    if (Math.abs(dyNext) > 1) dyNext = -dyNext / Math.abs(dyNext); // Корректируем направление   
    
    // Углы для поворотов
    if (dyPrev === 1 && dxNext === -1 || dxPrev==1 && dyNext==-1) return turnTopLeftTexture;   // Поворот вверх-право
    if (dyPrev === -1 && dxNext === -1 || dxPrev==1 && dyNext==1) return turnBottomLeftTexture;               // Низ-право
    if (dyPrev === 1 && dxNext === 1 || dxPrev==-1 && dyNext==-1) return turnTopRightTexture;       // Верх-лево
    if (dyPrev === -1 && dxNext === 1 || dxPrev==-1 && dyNext==1) return turnBottomRightTexture;   // Низ-лево
}

window.addEventListener("keydown", changeDirection);

leftButton.addEventListener("click", ()=>{if (!autopilot){const { x, y } = direction;if (lock_changeDir == false && x === 0){direction = { x: -1, y: 0 };lock_changeDir = true;}}});
upButton.addEventListener("click", ()=>{if (!autopilot){const { x, y } = direction;if (lock_changeDir == false && y === 0){direction = { x: 0, y: -1 };lock_changeDir = true;}}});
downButton.addEventListener("click", ()=>{if (!autopilot){const { x, y } = direction;if (lock_changeDir == false && y === 0){direction = { x: 0, y: 1 };lock_changeDir = true;}}});
rightButton.addEventListener("click", ()=>{if (!autopilot){const { x, y } = direction;if (lock_changeDir == false && x === 0){direction = { x: 1, y: 0 };lock_changeDir = true;}}});

autopilot_button.addEventListener('click', ()=>{autopilot = !autopilot; if (autopilot){autopilot_button.innerHTML = 'Выключить автопилот'}else{autopilot_button.innerHTML = 'Включить автопилот'}})
window.requestAnimationFrame(main);