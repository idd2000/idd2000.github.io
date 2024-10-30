
const canvas = document.getElementById("snake");
const ctx = canvas.getContext("2d");

let score = 0;

let foodImage = new Image();
foodImage.src = 'img_old/apple.png';

const gridSize = 32;
const canvasWidth = canvas.width / gridSize;
const canvasHeight = canvas.height / gridSize;

let snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
let direction = { x: 1, y: 0 };
let food = getRandomPosition();
let startSnakeSpeed = 10;
let snakeSpeed = startSnakeSpeed;
let lastRenderTime = 0;

const headTexture = new Image();
const bodyTexture = new Image();
const tailTexture = new Image();
const turnTexture = new Image();

headTexture.src = "img_old/head_left.png";
bodyTexture.src = "img_old/body_horizontal.png";
tailTexture.src = "img_old/tail_left.png";
turnTexture.src = "img_old/body_bottomleft.png";

function getRandomPosition() {
    return {
        x: Math.floor(Math.random() * canvasWidth),
        y: Math.floor(Math.random() * canvasHeight)
    };
}

function main(currentTime) {
    window.requestAnimationFrame(main);
    const secondsSinceLastRender = (currentTime - lastRenderTime) / 1000;
    if (secondsSinceLastRender < 1 / snakeSpeed) return;
    lastRenderTime = currentTime;

    update();
    draw();
}
let not_pop_snake = false;
function update() {
    const head = { ...snake[0] };
    head.x += direction.x;
    head.y += direction.y;

    // Переносим голову на противоположный край, если она выходит за границы
    if (head.x < 0) head.x = canvasWidth - 1;
    if (head.x >= canvasWidth) head.x = 0;
    if (head.y < 0) head.y = canvasHeight - 1;
    if (head.y >= canvasHeight) head.y = 0;

    if (head.x === food.x && head.y === food.y) {
        not_pop_snake = true
        food = getRandomPosition();
        snakeSpeed += 0.5;
    } else {
        if (!not_pop_snake){
            snake.pop();
        }else{
            not_pop_snake = false
        }
    }

    if (head.x < 0 || head.x >= canvasWidth || head.y < 0 || head.y >= canvasHeight || 
        snake.some((segment, index) => index > 0 && segment.x === head.x && segment.y === head.y)) {
        resetGame();
    }

    snake.unshift(head);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Рисуем еду
    ctx.drawImage(foodImage, food.x * gridSize, food.y * gridSize, gridSize, gridSize);

    // Рисуем сегменты змейки с поворотом
    snake.forEach((segment, index) => {
        let img, angle = 0;

        if (index === 0) { // Голова
            img = headTexture;
            angle = getRotationAngle(segment, snake[1]);
        } else if (index === snake.length - 1) { // Хвост
            img = tailTexture;
            angle = getRotationAngle(snake[index - 1], segment);
        } else { // Тело или поворот
            const isTurn = checkIfTurn(snake[index - 1], snake[index + 1]);
            img = isTurn ? turnTexture : bodyTexture;
            angle = isTurn ? getTurnAngle(snake[index - 1], segment, snake[index + 1]) : getRotationAngle(snake[index - 1], segment);
        }

        ctx.save();
        ctx.translate(segment.x * gridSize + gridSize / 2, segment.y * gridSize + gridSize / 2);
        ctx.rotate(angle);
        ctx.drawImage(img, -gridSize / 2, -gridSize / 2, gridSize, gridSize);
        ctx.restore();
    });
}

function resetGame() {
    snake = [{ x: 10, y: 10 }];
    direction = { x: 1, y: 0 };
    food = getRandomPosition();
    snakeSpeed = startSnakeSpeed;
}

function changeDirection(event) {
    const key = event.key;
    const { x, y } = direction;

    if (key === "ArrowUp" && y === 0) direction = { x: 0, y: -1 };
    if (key === "ArrowDown" && y === 0) direction = { x: 0, y: 1 };
    if (key === "ArrowLeft" && x === 0) direction = { x: -1, y: 0 };
    if (key === "ArrowRight" && x === 0) direction = { x: 1, y: 0 };
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
function getTurnAngle(prev, current, next) {
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
    if (dyPrev === 1 && dxNext === -1 || dxPrev==1 && dyNext==-1) return Math.PI / 2;   // Поворот вверх-право
    if (dyPrev === -1 && dxNext === -1 || dxPrev==1 && dyNext==1) return 0;               // Низ-право
    if (dyPrev === 1 && dxNext === 1 || dxPrev==-1 && dyNext==-1) return Math.PI;       // Верх-лево
    if (dyPrev === -1 && dxNext === 1 || dxPrev==-1 && dyNext==1) return -Math.PI / 2;   // Низ-лево

    return 0;
}

window.addEventListener("keydown", changeDirection);
window.requestAnimationFrame(main);