const canvasSnake = document.getElementById("snake");
const ctxSnake = canvasSnake.getContext("2d");

const ground = new Image();
ground.src = get_image('ground')

const foodImg = new Image();
foodImg.src = get_image('apple');

let fps = 60;
let animation_steps = 16;
let animation_step = 16
let box = 32;

let score = 0;

let food = {
  x: Math.floor((Math.random() * 17 + 1)) * box,
  y: Math.floor((Math.random() * 15 + 3)) * box,
};

let snake = [];

snake[0] = {
  x: 9 * box,
  y: 10 * box,
  dir: 'left',
  image_body: get_image('body_horizontal')
};
snake[1] = {
  x: 10 * box,
  y: 10 * box,
  dir: 'left',
  image_body: get_image('body_horizontal')
};
snake[2] = {
  x: 11 * box,
  y: 10 * box,
  dir: 'left',
  image_body: get_image('body_horizontal')
};
snake[3] = {
  x: 12 * box,
  y: 10 * box,
  dir: 'left',
  image_body: get_image('body_horizontal')
};
snake[4] = {
  x: 13 * box,
  y: 10 * box,
  dir: 'left',
  image_body: get_image('body_horizontal')
};


let snake_pos = 'horizontal';
let old_snake_pos = 'vertical';
let speed = 100;


document.addEventListener("keydown", direction);

let dir = 'left';
let olddir = 'left';
let lock_direction = false;


function direction(event) {
  if (!lock_direction) {
    if (event.keyCode == 37 && dir != "right") {
      olddir = dir;
      lock_direction = true;
      dir = "left";
      snake_pos = 'horizontal';
    }
    else if (event.keyCode == 38 && dir != "down") {
      olddir = dir;
      lock_direction = true;
      dir = "up";
      snake_pos = 'vertical';
    }
    else if (event.keyCode == 39 && dir != "left") {
      olddir = dir;
      lock_direction = true;
      dir = "right";
      snake_pos = 'horizontal';
    }
    else if (event.keyCode == 40 && dir != "up") {
      olddir = dir;
      lock_direction = true;
      dir = "down";
      snake_pos = 'vertical';
    }
  }
}

function eatTail(head, arr) {
  for (let i = 0; i < arr.length; i++) {
    if (head.x == arr[i].x && head.y == arr[i].y)
      clearInterval(game);
  }
}

function drawSnakeBody() {
  for(let i = 1; i < snake.length - 2; i++) {
    let image_name;
    image_name = snake[i].image_body
    let img = new Image()
    img.src = image_name
    ctxSnake.drawImage(img, snake[i].x, snake[i].y);
  }
}

function drawSnakeHead(){
  let delta = (box / animation_steps) * (animation_step - 1)
  let dd = 1
  if (dir == 'right' || dir == 'down'){
    delta = delta * -1
    dd = -1
  }
  if (dir == 'up' || dir == 'down'){
    let img = new Image()
    img.src = snake[1].image_body
    ctxSnake.drawImage(img, snake[1].x, snake[1].y);
    
    img.src = image_body
    if (dd == 1){
      ctxSnake.drawImage(img, 0, box - Math.abs(delta), box, Math.abs(delta), snake[0].x, snake[0].y - delta + box, box, Math.abs(delta));
    }else{
      ctxSnake.drawImage(img, 0, 0, box, Math.abs(delta), snake[0].x, snake[0].y, box, Math.abs(delta));
    }
    img.src = get_image(`head_${dir}`)
    ctxSnake.drawImage(img, snake[0].x, snake[0].y - delta);
  }else{
    let img = new Image()
    img.src = snake[1].image_body
    ctxSnake.drawImage(img, snake[1].x, snake[1].y);

    img.src = image_body
    if (dd == 1){
      ctxSnake.drawImage(img, box - Math.abs(delta),0, Math.abs(delta), box, snake[0].x + box - delta, snake[0].y, Math.abs(delta), box);
    }else{
      ctxSnake.drawImage(img, 0, 0, Math.abs(delta), box, snake[0].x, snake[0].y, Math.abs(delta), box);
    }
    
    img.src = get_image(`head_${dir}`)
    ctxSnake.drawImage(img, snake[0].x - delta, snake[0].y);
  }
}

let tailPos = [13*box,10*box]
function drawSnakeTail(){
  let endIdx = snake.length - 1
  let d = snake[endIdx -1].dir;

  let delta = (box / animation_steps) * (animation_step - 1)
  let dd = 1
  if (d == 'right' || d == 'down'){
    delta = delta * -1
    dd = -1
  }
  if (d == 'up' || d == 'down'){
    ctxSnake.clearRect(tailPos[0], tailPos[1], box, 2 * box);
    // let img = new Image()
    // img.src = snake[i].image_body
    // ctxSnake.drawImage(img, snake[i].x, snake[i].y);
    
    // img.src = image_body

  }else{
    ctxSnake.clearRect(tailPos[0], tailPos[1], 2 * box, box);
    

    let img = new Image()
    
    if (dd == 1){
      img.src = get_image(`tail_${d}`)
      ctxSnake.drawImage(img, snake[endIdx].x - delta, snake[endIdx].y);
      tailPos = [snake[endIdx].x, snake[endIdx].y]
      img.src = snake[endIdx - 1].image_body
      ctxSnake.drawImage(img, 0,0, 32 - Math.abs(delta), 32, snake[endIdx - 1].x, snake[endIdx - 1].y, 32 - Math.abs(delta), 32);
    }else{
      img.src = get_image(`tail_${d}`)
      ctxSnake.drawImage(img, snake[endIdx].x - delta, snake[endIdx].y);
      tailPos = [snake[endIdx].x - delta + box, snake[endIdx].y]
      img.src = snake[endIdx - 1].image_body
      ctxSnake.drawImage(img, 32 - Math.abs(delta),0, 32 - Math.abs(delta), 32, snake[endIdx - 1].x + box - Math.abs(delta), snake[endIdx - 1].y, 32 - Math.abs(delta), 32);
    }

  }


}
function get_image(image){
  return `img/${image}.png`
}

let image_body = get_image('body_horizontal')

function drawGame() {
  if (dir == "left") {
    if (olddir == 'up'){
      image_body = get_image('body_bottomleft')
    }else if (olddir == 'down'){
      image_body = get_image('body_topleft')
    }else{
      image_body = get_image('body_horizontal')
    }
  };
  if (dir == "right") {
    if (olddir == 'up'){
      image_body = get_image('body_bottomright')
    }else if (olddir == 'down'){
      image_body = get_image('body_topright')
    }else{
      image_body = get_image('body_horizontal')
    }
  }
  if (dir == "up") {
    if (olddir == 'left'){
      image_body = get_image('body_topright')
    }else if (olddir == 'right'){
      image_body = get_image('body_topleft')
    }else{
      image_body = get_image('body_vertical')
    }
  }
  if (dir == "down") {
    if (olddir == 'left'){
      image_body = get_image('body_bottomright')
    }else if (olddir == 'right'){
      image_body = get_image('body_bottomleft')
    }else{
      image_body = get_image('body_vertical')
    }
  }
  if (animation_step < animation_steps){
    animation_step++;
    ctxSnake.clearRect(0, 0, canvasSnake.width, canvasSnake.height);
    drawSnakeTail()
    drawSnakeBody()
    drawSnakeHead()
  }else{
    animation_step = 1
    lock_direction=false;

    let snakeX = snake[0].x;
    let snakeY = snake[0].y;

    if (snakeX == food.x && snakeY == food.y) {
      score++;
      ctxSnake.clearRect(food.x, food.y, box, box);
      food = {
        x: Math.floor((Math.random() * 17 + 1)) * box,
        y: Math.floor((Math.random() * 15 + 3)) * box,
      };
      ctxSnake.drawImage(foodImg, food.x, food.y);
      
      ctxSnake.clearRect(0, 0, 600, 96);
      ctxSnake.fillStyle = "white";
      ctxSnake.font = "50px Arial";
      ctxSnake.fillText(score, box * 2.5, box * 1.7);
    } else {
      snake.pop();
    }

    if (dir == "left") {
      if (snakeX > box) {
        snakeX -= box;
      } else {
        snakeX = 17 * box
      }
    };
    if (dir == "right") {
      if (snakeX < 17 * box) {
        snakeX += box;
      } else {
        snakeX = box
      }
    }
    if (dir == "up") {
      if (snakeY > 3 * box) {
        snakeY -= box;
      } else {
        snakeY = 17 * box
      }
    }
    if (dir == "down") {
      if (snakeY < 17 * box) {
        snakeY += box;
      } else {
        snakeY = 3 * box
      }
    }

    let newHead = {
      x: snakeX,
      y: snakeY,
      dir: dir
    };
    olddir = dir;

    eatTail(newHead, snake);
    snake.unshift(newHead);
    snake[1].image_body = image_body
    

    ctxSnake.clearRect(0, 0, canvasSnake.width, canvasSnake.height);
    
 
    drawSnakeTail()
    drawSnakeBody()
    drawSnakeHead()
    // ctxSnake.strokeStyle = "blue";
    // ctxSnake.rect(snake[0].x,snake[0].y, box,box);
    // ctxSnake.stroke();
  }
}
ctxSnake.drawImage(foodImg, food.x, food.y);

ctxSnake.fillStyle = "white";
ctxSnake.font = "50px Arial";
ctxOther.fillText(score, box * 2.5, box * 1.7);
drawGame()
let game = setInterval(drawGame, 10000 / fps);
document.querySelector('#start').addEventListener('click', ()=>{
  game = setInterval(drawGame, 10000 / fps);
})
document.querySelector('#stop').addEventListener('click', ()=>{
  clearInterval(game);
})
