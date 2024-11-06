const canvas = document.getElementById("snake");
const ctx = canvas.getContext("2d");

const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
for (let i=0; i<=1; i+= 0.05){
  gradient.addColorStop(i, generateHexColor());
}

// gradient.addColorStop(0, "#0000ff");       // от синего цвета
// gradient.addColorStop(0.5, "#00ff00");      // к зеленому цвету
// gradient.addColorStop(1, "#ff0000");      // к красному цвету
const fillStyle = '#0D8AFD';
// const fillStyle = gradient;
const difficulty_select = document.getElementById("difficulty");
let difficulty = Number(difficulty_select.value);
let score = 0;
let scoreObj = document.querySelector('#score');

let foodImage = new Image();
foodImage.src = 'img/apple.png';

let rocks = []
let rockImage = new Image();
rockImage.src = 'img/rock.png';
let candy = null;
let candyImage = new Image();
candyImage.src = 'img/candy.png';

const gridSize = 32;

const canvasWidth = canvas.width / gridSize;
const canvasHeight = canvas.height / gridSize;

let snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
let direction = { x: 1, y: 0 };
let food = null;
food = getRandomPosition();
let snakeSpeed = () => { return (1 + difficulty * 2) + Math.trunc(score / (6 - difficulty)) * 0.5 };
// let snakeSpeed = () => { return 2 };
let lastUpdateTime = 0;

const headTexture = new Image();
headTexture.src = "img/head_left.png";

let not_pop_snake = 3;
let lock_changeDir = false;

const leftButton = document.getElementById("button_left")
const upButton = document.getElementById("button_up")
const downButton = document.getElementById("button_down")
const rightButton = document.getElementById("button_right")
const autopilot_button = document.getElementById("autopilot_button");
let autopilot = false;

const snakeAI = new SnakeAI({ width: canvasWidth, height: canvasHeight }, snake, rocks);
let removerCandy;

function main(currentTime) {
  window.requestAnimationFrame(main);
  const secondsSinceLastUpdate = (currentTime - lastUpdateTime) / 1000;
  if (secondsSinceLastUpdate >= 1 / snakeSpeed()){
    lastUpdateTime = currentTime;
    if (direction.x != 0 || direction.y != 0)
      update();
  }
  let delta = secondsSinceLastUpdate / (1 / snakeSpeed())
  draw(delta>=1?0:delta);
}

function spawnRocks() {
  let countrocks = Math.trunc(score / 5) * difficulty
  if (rocks.length < countrocks) {
    let countIterations = countrocks - rocks.length;
    for (let i = 0; i < countIterations; i++) {
      rocks.push(getRandomPosition())
    }
  }
  snakeAI.rocks = rocks
}

function getRandomPosition() {
  let positions = [];
  for (let x = 0; x < canvasWidth; x++) {
    for (let y = 0; y < canvasHeight; y++) {
      let is_add = snake.filter(el => x == el.x && y == el.y).length == 0 && rocks.filter(el => x == el.x && y == el.y).length == 0
      if (candy && candy.x == x && candy.y == y) {
        is_add = false
      }
      if (food && food.x == x && food.y == y) {
        is_add = false
      }
      if (is_add) {
        positions.push({ x: x, y: y })
      }
    }
  }
  let pos = positions[Math.floor(Math.random() * (positions.length - 1))]
  return pos;
}

function update() {
  let is_eat = false;
  if (autopilot) {
    const nextMove = snakeAI.findSafePath(food, candy);
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
  if (candy == null && chance < 0.005) {
    candy = candy = getRandomPosition();
    removerCandy = setTimeout(() => { candy = null; }, 5000)
  }
  if (candy && head.x === candy.x && head.y === candy.y) {
    if (removerCandy)
      clearTimeout(removerCandy)
    candy = null
    not_pop_snake = 4
    score += 2;
    scoreObj.innerHTML = score
    spawnRocks();
  }
  if (head.x === food.x && head.y === food.y) {
    is_eat = true;
    score += 1;
    scoreObj.innerHTML = score
    not_pop_snake = 2
    food = getRandomPosition();
    spawnRocks();
  }
  if (!is_eat && not_pop_snake == 0){
    snake.pop();
  }else{
    not_pop_snake = not_pop_snake - 1
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

function resetGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  candy = null;
  rocks = []
  snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
  direction = { x: 1, y: 0 };
  not_pop_snake = 3
  food = getRandomPosition();
  score = 0;
  scoreObj.innerHTML = score
}

function changeDirection(event) {
  if (lock_changeDir == false && !autopilot) {
    const key = event.key;
    const { x, y } = direction;

    if (key === "ArrowUp" && y === 0) direction = { x: 0, y: -1 };
    if (key === "ArrowDown" && y === 0) direction = { x: 0, y: 1 };
    if (key === "ArrowLeft" && x === 0) direction = { x: -1, y: 0 };
    if (key === "ArrowRight" && x === 0) direction = { x: 1, y: 0 };
    lock_changeDir = true;
  }
}
window.addEventListener("keydown", changeDirection);

leftButton.addEventListener("click", () => { if (!autopilot) { const { x, y } = direction; if (lock_changeDir == false && x === 0) { direction = { x: -1, y: 0 }; lock_changeDir = true; } } });
upButton.addEventListener("click", () => { if (!autopilot) { const { x, y } = direction; if (lock_changeDir == false && y === 0) { direction = { x: 0, y: -1 }; lock_changeDir = true; } } });
downButton.addEventListener("click", () => { if (!autopilot) { const { x, y } = direction; if (lock_changeDir == false && y === 0) { direction = { x: 0, y: 1 }; lock_changeDir = true; } } });
rightButton.addEventListener("click", () => { if (!autopilot) { const { x, y } = direction; if (lock_changeDir == false && x === 0) { direction = { x: 1, y: 0 }; lock_changeDir = true; } } });

autopilot_button.addEventListener('click', () => { autopilot = !autopilot; if (autopilot) { autopilot_button.innerHTML = 'Выключить автопилот' } else { autopilot_button.innerHTML = 'Включить автопилот' } })
difficulty_select.addEventListener('change', (e) => { difficulty = Number(e.target.value); })
window.requestAnimationFrame(main);