const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const ground = new Image();
ground.src = "img/ground.png";

const foodImg = new Image();
foodImg.src = "img/apple.png";

let box = 32;

let score = 0;

let food = {
  x: Math.floor((Math.random() * 17 + 1)) * box,
  y: Math.floor((Math.random() * 15 + 3)) * box,
};

let snake = [];
snake[0] = {
  x: 9 * box,
  y: 10 * box
};
snake[1] = {
  x: 10 * box,
  y: 10 * box
};
snake[2] = {
  x: 11 * box,
  y: 10 * box
};
snake[3] = {
  x: 12 * box,
  y: 10 * box
};
snake[4] = {
  x: 13 * box,
  y: 10 * box
};

document.addEventListener("keydown", direction);

let dir = 'left';
let olddir = 'left';
let lock_direction = false;

function direction(event) {
  if (!lock_direction){
    if(event.keyCode == 37 && dir != "right"){
      olddir = dir;
      lock_direction=true;
      dir = "left";
    }
    else if(event.keyCode == 38 && dir != "down"){
      olddir = dir;
      lock_direction=true;
      dir = "up";
    }
    else if(event.keyCode == 39 && dir != "left"){
      olddir = dir;
      lock_direction=true;
      dir = "right";
    }
    else if(event.keyCode == 40 && dir != "up"){
      olddir = dir;
      lock_direction=true;
      dir = "down";
    }
  }
}

function eatTail(head, arr) {
  for(let i = 0; i < arr.length; i++) {
    if(head.x == arr[i].x && head.y == arr[i].y)
      clearInterval(game);
  }
}

function drawGame() {
  lock_direction=false;
  ctx.drawImage(ground, 0, 0);

  ctx.drawImage(foodImg, food.x, food.y);

  for(let i = 0; i < snake.length; i++) {

    if (i==0){
      let img = new Image()
      img.src = `img/head_${olddir}.png`
      ctx.drawImage(img, snake[i].x, snake[i].y);
      olddir = dir;
    } else if (i == snake.length - 1) {
      let d;
      if (snake[i].x == box || snake[i].x == 17 * box || snake[i].y == 3 * box || snake[i].y == 17 * box){
        if (snake[i].x == 17 * box && snake[i-1].x == box){
          d = 'left'
        }else if (snake[i].x == box && snake[i-1].x == 17 * box){
          d = 'right'
        }else if (snake[i].y == 3 * box && snake[i-1].y == 17 * box){
          d = 'down'
        }else if (snake[i].y == 17 * box && snake[i-1].y == 3 * box){
          d = 'up'
        }
      }
      if (!d){
        if (snake[i-1].x > snake[i].x){
          d = 'left'
        }else if (snake[i-1].x < snake[i].x){
          d = 'right'
        }else if (snake[i-1].y < snake[i].y){
          d = 'down'
        }else if (snake[i-1].y > snake[i].y){
          d = 'up'
        }
      }
      let img = new Image()
      img.src = `img/tail_${d}.png`
      ctx.drawImage(img, snake[i].x, snake[i].y);
    }else{
      let image_name;
      // Углы
      if (snake[i].x == box && snake[i].y == 3 * box || snake[i].x == 17 * box && snake[i].y == 3 * box  || snake[i].x == box && snake[i].y == 17 * box || snake[i].x == 17 * box && snake[i].y == 17 * box){
        if (
          ((17 * box == snake[i-1].x && 3 * box == snake[i-1].y && snake[i+1].y == 17 * box && snake[i+1].x == box) || (17 * box == snake[i+1].x && 3 * box == snake[i+1].y && snake[i+1].y == 17 * box && snake[i-1].x == box))
        ){
          image_name = 'img/body_topleft.png'
        }else if (
          ((box == snake[i-1].x && 3 * box == snake[i-1].y && snake[i+1].y == 17 * box && snake[i+1].x == 17 * box) || (box == snake[i+1].x && 3 * box == snake[i+1].y && snake[i-1].y == 17 * box && snake[i-1].x == 17 * box) && snake[i].x == 17 * box && snake[i].y == 3 * box)
        ){
          image_name = 'img/body_topright.png'
        }else if (
          ((17 * box == snake[i-1].x && 17 * box == snake[i-1].y && snake[i+1].y == 3 * box && snake[i+1].x == box) || (17 * box == snake[i+1].x && 17 * box == snake[i+1].y && snake[i-1].y == 3 * box && snake[i-1].x == box) && snake[i].x == box && snake[i].y == 17 * box)
        ){
          image_name = 'img/body_bottomleft.png'
        }else if (
          ((box == snake[i-1].x && 17 * box == snake[i-1].y && snake[i+1].y == 3 * box && snake[i+1].x == 17 * box) || (box == snake[i+1].x && 17 * box == snake[i+1].y && snake[i-1].y == 3 * box && snake[i-1].x == 17 * box) && snake[i].x == 17 * box && snake[i].y == 17 * box)
        ){
          image_name = 'img/body_bottomright.png'
        }
      }
      // Пересечение стены
      if (snake[i].x == box || snake[i].x == 17 * box || snake[i].y == 3 * box || snake[i].y == 17 * box){
        if (
          (((box == snake[i-1].x && snake[i+1].x == 16 * box) || (box == snake[i+1].x  && snake[i-1].x == 16 * box)) && snake[i].x == 17 * box) || 
          (((17 * box == snake[i-1].x && snake[i+1].x == 2 * box) || (17 * box == snake[i+1].x && snake[i-1].x == 2 * box)) && snake[i].x == box)
        ){
          image_name = 'img/body_horizontal.png'
        }else if (
          (((3 * box == snake[i-1].y && snake[i+1].y == 16 * box) || (3 * box == snake[i+1].y  && snake[i-1].y == 16 * box)) && snake[i].y == 17 * box) || 
          (((17 * box == snake[i-1].y && snake[i+1].y == 4 * box) || (17 * box == snake[i+1].y && snake[i-1].y == 4 * box)) && snake[i].y == 3 * box)
        ){
          image_name = 'img/body_vertical.png'
        }else if (
          (((17 * box == snake[i-1].x && snake[i+1].y == snake[i].y - box) || (17 * box == snake[i+1].x && snake[i-1].y == snake[i].y - box) && snake[i].x == box)) ||
          (((17 * box == snake[i-1].y && snake[i+1].x == snake[i].x - box) || (17 * box == snake[i+1].y && snake[i-1].x == snake[i].x - box) && snake[i].y == 3 * box))
        ){
          image_name = 'img/body_topleft.png'
        }else if (
          (((box == snake[i-1].x && snake[i+1].y == snake[i].y - box) || (box == snake[i+1].x && snake[i-1].y == snake[i].y - box) && snake[i].x == 17 * box)) ||
          (((17 * box == snake[i-1].y && snake[i+1].x == snake[i].x + box) || (17 * box == snake[i+1].y && snake[i-1].x == snake[i].x + box) && snake[i].y == 3 * box))
        ){
          image_name = 'img/body_topright.png'
        }else if (
          (((17 * box == snake[i-1].x && snake[i+1].y == snake[i].y + box) || (17 * box == snake[i+1].x && snake[i-1].y == snake[i].y + box) && snake[i].x == box)) ||
          (((3 * box == snake[i-1].y && snake[i+1].x == snake[i].x - box) || (3 * box == snake[i+1].y && snake[i-1].x == snake[i].x - box) && snake[i].y == 17 * box))
        ){
          image_name = 'img/body_bottomleft.png'
        }else if (
          (((box == snake[i-1].x && snake[i+1].y == snake[i].y + box) || (box == snake[i+1].x && snake[i-1].y == snake[i].y + box) && snake[i].x == 17 * box)) ||
          (((3 * box == snake[i-1].y && snake[i+1].x == snake[i].x + box) || (3 * box == snake[i+1].y && snake[i-1].x == snake[i].x + box) && snake[i].y == 17 * box))
        ){
          image_name = 'img/body_bottomright.png'
        }
      }
      // передвижение по полю
      if (
        (snake[i].x - box == snake[i-1].x && snake[i].x + box == snake[i+1].x) || 
        (snake[i].x + box == snake[i-1].x && snake[i].x - box == snake[i+1].x)
      ){
        image_name = 'img/body_horizontal.png'
      }else if (
        (snake[i].y - box == snake[i-1].y && snake[i].y + box == snake[i+1].y) || 
        (snake[i].y + box == snake[i-1].y && snake[i].y - box == snake[i+1].y)
      ){
        image_name = 'img/body_vertical.png'
      }else if (
        (snake[i].x - box == snake[i-1].x && snake[i].y - box == snake[i+1].y) || 
        (snake[i].x - box == snake[i+1].x && snake[i].y - box == snake[i-1].y)
      ){
        image_name = 'img/body_topleft.png'
      }else if (
        (snake[i].x + box == snake[i-1].x && snake[i].y - box == snake[i+1].y) || 
        (snake[i].x + box == snake[i+1].x && snake[i].y - box == snake[i-1].y)
      ){
        image_name = 'img/body_topright.png'
      }else if (
        (snake[i].x - box == snake[i-1].x && snake[i].y + box == snake[i+1].y) || 
        (snake[i].x - box == snake[i+1].x && snake[i].y + box == snake[i-1].y)
      ){
        image_name = 'img/body_bottomleft.png'
      }else if (
        (snake[i].x + box == snake[i-1].x && snake[i].y + box == snake[i+1].y) || 
        (snake[i].x + box == snake[i+1].x && snake[i].y + box == snake[i-1].y)
      ){
        image_name = 'img/body_bottomright.png'
      }
      if (!image_name){
        console.log([snake[i-1], snake[i], snake[i+1]])
      }
      let img = new Image()
      img.src = image_name
      ctx.drawImage(img, snake[i].x, snake[i].y);
    }
  }

  ctx.fillStyle = "white";
  ctx.font = "50px Arial";
  ctx.fillText(score, box * 2.5, box * 1.7);

  let snakeX = snake[0].x;
  let snakeY = snake[0].y;

  if(snakeX == food.x && snakeY == food.y) {
    score++;
    food = {
      x: Math.floor((Math.random() * 17 + 1)) * box,
      y: Math.floor((Math.random() * 15 + 3)) * box,
    };
  } else {
    snake.pop();
  }

  // if(snakeX < box || snakeX > box * 17
  //   || snakeY < 3 * box || snakeY > box * 17)
  //   clearInterval(game);

  if(dir == "left") {
    if (snakeX > box){
      snakeX -= box
    }else{
      snakeX = 17 * box
    }
  };
  if(dir == "right"){
    if (snakeX < 17 * box){
      snakeX += box;
    }else{
      snakeX = box
    }
  } 
  if(dir == "up") {
    if (snakeY > 3 * box){
      snakeY -= box;
    }else{
      snakeY = 17 * box
    }
  }
  if(dir == "down") {
    if (snakeY < 17 * box){
      snakeY += box;
    }else{
      snakeY = 3 * box
    }
  }

  let newHead = {
    x: snakeX,
    y: snakeY
  };

  eatTail(newHead, snake);

  snake.unshift(newHead);
}

let game = setInterval(drawGame, 100);
