function draw(delta) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Рисуем сегменты змейки с поворотом
  snake.forEach((segment, index) => {
    let img, angle = 0;
    if (index != 0 && index != snake.length - 1){
      if (checkIfTurn(snake[index - 1], snake[index + 1])){
        if (!snake[index]['namesegment']){
          snake[index]['namesegment'] =  getTurnTexture(snake[index - 1], segment, snake[index + 1])
        }
        drawSegment(segment, index, calculateWaist(index), snake[index]['namesegment'])
      }else{
        // Тело
        if (!snake[index]['namesegment']){
          angle = getRotationAngle(snake[index - 1], segment);
          snake[index]['namesegment'] =  angle == 0 || angle == Math.PI?'horizontal':'vertical'
        }
        drawSegment(segment, index, calculateWaist(index), snake[index]['namesegment'])
      }
    }
    // Рисуем еду
    ctx.drawImage(foodImage, food.x * gridSize, food.y * gridSize, gridSize, gridSize);
    if (candy)
      ctx.drawImage(candyImage, candy.x * gridSize, candy.y * gridSize, gridSize, gridSize);
    rocks.forEach(rock => {
      // Рисуем камни
      ctx.drawImage(rockImage, rock.x * gridSize, rock.y * gridSize, gridSize, gridSize);
    })
  });
  
  let angle = 0;
  // Голова
  angle = getRotationAngle(snake[0], snake[1]);
  drawHead(snake[0], delta, angle)

  // Хвост
  angle = getRotationAngle(snake[snake.length - 2], snake[snake.length - 1]);
  drawTail(snake[snake.length - 1], snake.length - 1, calculateWaist(snake.length - 1), delta, angle)
}
function drawTail(segment, index, waist, delta = 0, angle = 0) {
  ctx.beginPath();

  const prevSegment = snake[index - 1];
  const secondPrevSegment = snake[index - 2];
  const isTurn = secondPrevSegment && checkIfTurn(secondPrevSegment, segment);

  if (not_pop_snake === 0) {
    if (isTurn) {
      let isClockwise =
        (segment.x > prevSegment.x && prevSegment.y > secondPrevSegment.y) ||
        (segment.y > prevSegment.y && prevSegment.x < secondPrevSegment.x) ||
        (segment.x < prevSegment.x && prevSegment.y < secondPrevSegment.y) ||
        (segment.y < prevSegment.y && prevSegment.x > secondPrevSegment.x);
      const deltaAngle = Math.PI / 2 * delta;
      let x = segment.x * gridSize + (prevSegment.x > segment.x || secondPrevSegment.x > prevSegment.x ? gridSize : 0);
      let y = segment.y * gridSize + (prevSegment.y > segment.y || secondPrevSegment.y > prevSegment.y ? gridSize : 0);
      
      // Если прошли через стену то меняем точку вращения и сдвигаем
      if (Math.abs(segment.x - prevSegment.x) > 1 || 
          Math.abs(segment.y - prevSegment.y) > 1 || 
          Math.abs(prevSegment.x-secondPrevSegment.x) > 1 || 
          Math.abs(prevSegment.y-secondPrevSegment.y) > 1){
        isClockwise = !isClockwise
        if (Math.abs(prevSegment.x-secondPrevSegment.x) > 1){
          x = x + Math.sign(prevSegment.x-secondPrevSegment.x) * gridSize
        }
        if (Math.abs(prevSegment.y-secondPrevSegment.y) > 1){
          y = y + Math.sign(prevSegment.y-secondPrevSegment.y) * gridSize
        }
        if (Math.abs(segment.x - prevSegment.x) > 1){
          x = x + Math.sign(segment.x - prevSegment.x) * gridSize
        }
        if (Math.abs(segment.y - prevSegment.y) > 1){
          y = y + Math.sign(segment.y - prevSegment.y) * gridSize
        }
      }
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle + (isClockwise ? deltaAngle : -deltaAngle));
      ctx.clearRect(0, isClockwise ? 0 : -gridSize, gridSize, gridSize);
      ctx.moveTo(0, isClockwise ? waist : -waist);
      ctx.bezierCurveTo(gridSize, isClockwise ? waist : -waist, gridSize, isClockwise ? gridSize - waist : waist - gridSize, 0, isClockwise ? gridSize - waist : waist - gridSize);
      ctx.restore();

      // Если прошли через стену то рисуем второй хвост
      if (Math.abs(segment.x - prevSegment.x) > 1 || 
          Math.abs(segment.y - prevSegment.y) > 1){
        let isClockwise =
          (segment.x > prevSegment.x && prevSegment.y > secondPrevSegment.y) ||
          (segment.y > prevSegment.y && prevSegment.x < secondPrevSegment.x) ||
          (segment.x < prevSegment.x && prevSegment.y < secondPrevSegment.y) ||
          (segment.y < prevSegment.y && prevSegment.x > secondPrevSegment.x);
        isClockwise = !isClockwise
        let x = prevSegment.x * gridSize;
        let y = prevSegment.y * gridSize;
        if (Math.abs(segment.x - prevSegment.x) > 1){
          //влево
          if (Math.sign(segment.x - prevSegment.x) == -1){
            x += gridSize
          }
          if (Math.sign(prevSegment.y - secondPrevSegment.y)==-1){
            y += gridSize
          }
        }else if (Math.abs(segment.y - prevSegment.y) > 1){
          //вверх
          x = prevSegment.x * gridSize;
          y = prevSegment.y * gridSize;
          
          if (Math.sign(segment.y - prevSegment.y) == -1){
            y += gridSize
          }
          if (Math.sign(prevSegment.x - secondPrevSegment.x)==-1){
            x += gridSize
          }
        }
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle + (isClockwise ? deltaAngle : -deltaAngle));
        ctx.clearRect(0, isClockwise ? 0 : -gridSize, gridSize, gridSize);
        ctx.moveTo(0, isClockwise ? waist : -waist);
        ctx.bezierCurveTo(gridSize, isClockwise ? waist : -waist, gridSize, isClockwise ? gridSize - waist : waist - gridSize, 0, isClockwise ? gridSize - waist : waist - gridSize);
        ctx.restore();
      }
    } else {
      applyStraightTransformation(segment, angle, delta, waist);
      drawTailWithWall(segment, prevSegment, angle, delta, waist);
    }
  } else {
    applyStraightTransformation(segment, angle, 0, waist);
    drawTailWithWall(segment, prevSegment, angle, delta, waist);
  }
  ctx.fillStyle = fillStyle;
  ctx.fill();
  ctx.closePath();
}

function applyStraightTransformation(segment, angle, delta, waist) {
  ctx.save();
  let translateX = segment.x * gridSize;
  let translateY = segment.y * gridSize;

  if (angle < 0) translateY += gridSize + gridSize * delta;
  else if (angle > 1 && angle < 2) {
    translateX += gridSize;
    translateY -= gridSize * delta;
  } else if (angle === 0) translateX -= gridSize * delta;
  else if (angle > 3 && angle < 4) {
    translateX += gridSize + gridSize * delta;
    translateY += gridSize;
  }
  ctx.translate(translateX, translateY);
  ctx.rotate(angle);
  ctx.clearRect(0, 0, gridSize - 1, gridSize - 1);
  ctx.moveTo(0, waist);
  ctx.bezierCurveTo(gridSize, waist, gridSize, gridSize - waist, 0, gridSize - waist);
  ctx.restore();
}

function drawTailWithWall(segment, prevSegment, angle, delta, waist){
  if (Math.abs(segment.x - prevSegment.x) > 1 || 
      Math.abs(segment.y - prevSegment.y) > 1){
    ctx.save();
    let translateX = prevSegment.x * gridSize;
    let translateY = prevSegment.y * gridSize;

    if (angle < 0){
      translateY += gridSize * delta;
    }
    else if (angle > 1 && angle < 2) {
      translateX += gridSize;
      translateY -= gridSize * delta - gridSize;
    } else if (angle === 0) {
      translateX -= gridSize * delta - gridSize;
    }else if (angle > 3 && angle < 4) {
      translateX += gridSize * delta;
      translateY += gridSize;
    }
    ctx.translate(translateX, translateY);
    ctx.rotate(angle);
    ctx.clearRect(0, 0, gridSize - 1, gridSize - 1);
    ctx.moveTo(0, waist);
    ctx.bezierCurveTo(gridSize, waist, gridSize, gridSize - waist, 0, gridSize - waist);
    ctx.restore();
  }
}

function drawSegment(segment, index, waist, namesegment, delta = 0, angle = 0) {
  let to;
  let fromWaist;
  let toWaist;
  if (namesegment != 'tail') {
    if (snake[index + 1].x < segment.x) {
      to = 'left'
    } else if (snake[index + 1].x > segment.x) {
      to = 'right'
    } else if (snake[index + 1].y < segment.y) {
      to = 'top'
    } else if (snake[index + 1].y > segment.y) {
      to = 'bottom'
    }
    fromWaist = waist
    toWaist = calculateWaist(index + 1)
  }

  ctx.beginPath();
  if (namesegment == "horizontal") {
    if (to == 'left') {
      fromWaist = calculateWaist(index + 1)
      toWaist = waist
    }
    ctx.moveTo(segment.x * gridSize, segment.y * gridSize + fromWaist);
    ctx.lineTo(segment.x * gridSize + gridSize, segment.y * gridSize + toWaist);
    ctx.lineTo(segment.x * gridSize + gridSize, segment.y * gridSize + gridSize - toWaist);
    ctx.lineTo(segment.x * gridSize, segment.y * gridSize + gridSize - fromWaist);
  } else if (namesegment == "vertical") {
    if (to == 'top') {
      fromWaist = calculateWaist(index + 1)
      toWaist = waist
    }
    ctx.moveTo(segment.x * gridSize + fromWaist, segment.y * gridSize);
    ctx.lineTo(segment.x * gridSize + toWaist, segment.y * gridSize + gridSize);
    ctx.lineTo(segment.x * gridSize + gridSize - toWaist, segment.y * gridSize + gridSize);
    ctx.lineTo(segment.x * gridSize + gridSize - fromWaist, segment.y * gridSize);
  } else if (namesegment == "bottomright") {
    if (to == 'right') {
      fromWaist = calculateWaist(index + 1)
      toWaist = waist
    }
    ctx.moveTo(segment.x * gridSize + gridSize, segment.y * gridSize + fromWaist);
    ctx.arcTo(segment.x * gridSize + toWaist, segment.y * gridSize + toWaist, segment.x * gridSize + toWaist, segment.y * gridSize + gridSize, gridSize - toWaist);
    ctx.lineTo(segment.x * gridSize + gridSize - toWaist, segment.y * gridSize + gridSize);
    ctx.arcTo(segment.x * gridSize + gridSize - fromWaist, segment.y * gridSize + gridSize - fromWaist, segment.x * gridSize + gridSize, segment.y * gridSize + gridSize - fromWaist, fromWaist);
  } else if (namesegment == "bottomleft") {
    if (to == 'left') {
      fromWaist = calculateWaist(index + 1)
      toWaist = waist
    }
    ctx.moveTo(segment.x * gridSize, segment.y * gridSize + fromWaist);
    ctx.arcTo(segment.x * gridSize + gridSize - toWaist, segment.y * gridSize + toWaist, segment.x * gridSize + gridSize - toWaist, segment.y * gridSize + gridSize, gridSize - toWaist);
    ctx.lineTo(segment.x * gridSize + toWaist, segment.y * gridSize + gridSize);
    ctx.arcTo(segment.x * gridSize + fromWaist, segment.y * gridSize + gridSize - fromWaist, segment.x * gridSize, segment.y * gridSize + gridSize - fromWaist, fromWaist);
  } else if (namesegment == "topleft") {
    if (to == 'top') {
      fromWaist = calculateWaist(index + 1)
      toWaist = waist
    }
    ctx.moveTo(segment.x * gridSize + gridSize - fromWaist, segment.y * gridSize);
    ctx.arcTo(segment.x * gridSize + gridSize - toWaist, segment.y * gridSize + gridSize - toWaist, segment.x * gridSize, segment.y * gridSize + gridSize - toWaist, gridSize - toWaist);
    ctx.lineTo(segment.x * gridSize, segment.y * gridSize + toWaist);
    ctx.arcTo(segment.x * gridSize + fromWaist, segment.y * gridSize + fromWaist, segment.x * gridSize + fromWaist, segment.y * gridSize, fromWaist);
  } else if (namesegment == "topright") {
    if (to == 'top') {
      fromWaist = calculateWaist(index + 1)
      toWaist = waist
    }
    ctx.moveTo(segment.x * gridSize + fromWaist, segment.y * gridSize);
    ctx.arcTo(segment.x * gridSize + toWaist, segment.y * gridSize + gridSize - toWaist, segment.x * gridSize + gridSize, segment.y * gridSize + gridSize - toWaist, gridSize - toWaist);
    ctx.lineTo(segment.x * gridSize + gridSize, segment.y * gridSize + toWaist);
    ctx.arcTo(segment.x * gridSize + gridSize - fromWaist, segment.y * gridSize + fromWaist, segment.x * gridSize + gridSize - fromWaist, segment.y * gridSize, fromWaist);
  } else if (namesegment == "tail") {
    if (not_pop_snake == 0) {
      if (!((snake[index - 2] && checkIfTurn(snake[index - 2], segment)) || !snake[index - 2])) {
        ctx.save();
        if (angle < 0) {
          // вверх
          ctx.translate(segment.x * gridSize, segment.y * gridSize + gridSize + gridSize * delta);
        } else if (angle > 1 && angle < 2) {
          // вниз
          ctx.translate(segment.x * gridSize + gridSize, segment.y * gridSize - gridSize * delta);
        } else if (angle == 0) {
          // влево
          ctx.translate(segment.x * gridSize - gridSize * delta, segment.y * gridSize);
        } else if (angle > 3 && angle < 4) {
          // вправо
          ctx.translate(segment.x * gridSize + gridSize + gridSize * delta, segment.y * gridSize + gridSize);
        }
        ctx.rotate(angle);
        ctx.clearRect(0, 0, gridSize - 1, gridSize - 1)
        ctx.moveTo(0, waist)
        ctx.bezierCurveTo(gridSize, waist, gridSize, gridSize - waist, 0, gridSize - waist);

        ctx.restore(); // Восстанавливаем исходное состояние контекста
      } else {
        let deltaAngle = Math.PI / 2 * delta;
        ctx.save();
        if (snake[index - 1].y > segment.y) {
          // вниз
          if (snake[index - 2].x < snake[index - 1].x) {
            // влево
            ctx.translate(segment.x * gridSize, segment.y * gridSize + gridSize);
            ctx.rotate(angle + deltaAngle);

            ctx.clearRect(0, 0, gridSize - 1, gridSize - 1)
            ctx.moveTo(0, waist)
            ctx.bezierCurveTo(gridSize, waist, gridSize, gridSize - waist, 0, gridSize - waist);
          } else {
            // вправо
            ctx.translate(segment.x * gridSize + gridSize, segment.y * gridSize + gridSize);
            ctx.rotate((Math.PI / 2) - deltaAngle);

            ctx.clearRect(-gridSize, 0, gridSize - 1, gridSize - 1)
            ctx.moveTo(0, waist)
            ctx.bezierCurveTo(-gridSize, waist, -gridSize, gridSize - waist, 0, gridSize - waist);
          }
        } else if (snake[index - 1].y < segment.y) {
          // вверх
          if (snake[index - 2].x < snake[index - 1].x) {
            // влево
            ctx.translate(segment.x * gridSize, segment.y * gridSize);
            ctx.rotate(Math.PI / 2 - deltaAngle);

            ctx.clearRect(0, -gridSize, gridSize - 1, gridSize - 1)
            ctx.moveTo(0, -waist)
            ctx.bezierCurveTo(gridSize, -waist, gridSize, -gridSize + waist, 0, -gridSize + waist);
          } else {
            // вправо
            ctx.translate(segment.x * gridSize + gridSize, segment.y * gridSize);
            ctx.rotate(deltaAngle);

            ctx.clearRect(-gridSize, 0, gridSize - 1, gridSize - 1)
            ctx.moveTo(-waist, 0)
            ctx.bezierCurveTo(-waist, gridSize, -gridSize + waist, gridSize, -gridSize + waist, 0);
          }
        } else if (snake[index - 1].x > segment.x) {
          // вправо

          if (snake[index - 2].y < snake[index - 1].y) {
            // вверх
            ctx.translate(segment.x * gridSize + gridSize, segment.y * gridSize);
            ctx.rotate(-deltaAngle);

            ctx.clearRect(-gridSize, 0, gridSize - 1, gridSize - 1)
            ctx.moveTo(0, waist)
            ctx.bezierCurveTo(-gridSize, waist, -gridSize, gridSize - waist, 0, gridSize - waist);
          } else {
            // вниз
            ctx.translate(segment.x * gridSize + gridSize, segment.y * gridSize + gridSize);
            ctx.rotate(deltaAngle);

            ctx.clearRect(-gridSize, -gridSize, gridSize - 1, gridSize - 1)
            ctx.moveTo(0, -waist)
            ctx.bezierCurveTo(-gridSize, -waist, -gridSize, -gridSize + waist, 0, -gridSize + waist);
          }
        } else if (snake[index - 1].x < segment.x) {
          // влево
          if (snake[index - 2].y < snake[index - 1].y) {
            // вверх
            ctx.translate(segment.x * gridSize, segment.y * gridSize);
            ctx.rotate(deltaAngle);

            ctx.clearRect(0, 0, gridSize - 1, gridSize - 1)
            ctx.moveTo(0, waist)
            ctx.bezierCurveTo(gridSize, waist, gridSize, gridSize - waist, 0, gridSize - waist);
          } else {
            // вниз
            ctx.translate(segment.x * gridSize, segment.y * gridSize + gridSize);
            ctx.rotate(-deltaAngle);

            ctx.clearRect(0, -gridSize, gridSize - 1, gridSize - 1)
            ctx.moveTo(0, -waist)
            ctx.bezierCurveTo(gridSize, -waist, gridSize, -gridSize + waist, 0, -gridSize + waist);
          }
        }
        ctx.restore(); // Восстанавливаем исходное состояние контекста
      }
    } else {
      ctx.save();
      if (angle < 0) {
        // вверх
        ctx.translate(segment.x * gridSize, segment.y * gridSize + gridSize);
      } else if (angle > 1 && angle < 2) {
        // вниз
        ctx.translate(segment.x * gridSize + gridSize, segment.y * gridSize);
      } else if (angle == 0) {
        // влево
        ctx.translate(segment.x * gridSize, segment.y * gridSize);
      } else if (angle > 3 && angle < 4) {
        // вправо
        ctx.translate(segment.x * gridSize + gridSize, segment.y * gridSize + gridSize);
      }
      ctx.rotate(angle);
      ctx.clearRect(0, 0, gridSize - 1, gridSize - 1)
      ctx.moveTo(0, waist)
      ctx.bezierCurveTo(gridSize, waist, gridSize, gridSize - waist, 0, gridSize - waist);

      ctx.restore(); // Восстанавливаем исходное состояние контекста
    }
  }
  ctx.fillStyle = fillStyle;
  ctx.fill();
  ctx.closePath();
}


function drawHead(segment, delta = 0, angle = 0){  
  let img = headTexture;
  if (!(snake[2] && checkIfTurn(segment, snake[2]))) {
    ctx.save();
    let deltaPath = gridSize * delta
    if (angle < 0) {
      // вниз
      ctx.translate(segment.x * gridSize, segment.y * gridSize + deltaPath);
    } else if (angle > 1 && angle < 2) {
      // вверх
      ctx.translate(segment.x * gridSize + gridSize, segment.y * gridSize - deltaPath + gridSize);
    } else if (angle == 0) {
      // влево
      ctx.translate(segment.x * gridSize + gridSize - deltaPath, segment.y * gridSize);
    } else if (angle > 3 && angle < 4) {
      // вправо
      ctx.translate(segment.x * gridSize + deltaPath, segment.y * gridSize + gridSize);
    }
    ctx.rotate(angle);
    ctx.clearRect(0, 0, gridSize, gridSize)
    ctx.drawImage(img, 0, 0, gridSize, gridSize);
    ctx.restore();
    // Если пересекаем стену, то рисуем вторую голову
    if (isMoveThroughWall(segment, snake[1])) {
      ctx.save();
      let deltaPath = gridSize * delta
      if (segment.x == 0 && snake[1].x == canvasWidth - 1) {
        ctx.translate(snake[1].x * gridSize + gridSize + deltaPath, snake[1].y * gridSize + gridSize);
      }
      if (segment.x == canvasWidth - 1 && snake[1].x == 0) {
        ctx.translate(snake[1].x * gridSize - deltaPath, snake[1].y * gridSize);
      }
      if (segment.y == 0 && snake[1].y == canvasHeight - 1) {
        ctx.translate(snake[1].x * gridSize, snake[1].y * gridSize + gridSize + deltaPath);
      }
      if (segment.y == canvasHeight - 1 && snake[1].y == 0) {
        ctx.translate(snake[1].x * gridSize + gridSize, snake[1].y * gridSize - deltaPath);
      }
      ctx.rotate(angle);
      ctx.clearRect(0, 0, gridSize, gridSize)
      ctx.drawImage(img, 0, 0, gridSize, gridSize);
      ctx.restore();
    }
  } else {
    ctx.save();
    let deltaAngle = Math.PI / 2 * delta;
    let move1;
    let move2;

    if (angle < 0) {
      move2 = 'bottom'
    } else if (angle > 1 && angle < 2) {
      move2 = 'top'
    } else if (angle == 0) {
      move2 = 'left'
    } else if (angle > 3 && angle < 4) {
      move2 = 'right'
    }
    if (move2 == 'left' || move2 == 'right') {
      if (snake[2].y < segment.y) {
        move1 = segment.y - snake[2].y == 1?'top':'bottom'
      }
      if (snake[2].y > segment.y) {
        move1 = snake[2].y - segment.y == 1?'bottom':'top'
      }
    } else {
      if (snake[2].x < segment.x) {
        move1 = segment.x - snake[2].x == 1?'right':'left'
      }
      if (snake[2].x > segment.x) {
        move1 = snake[2].x - segment.x == 1?'left':'right'
      }
    }
    let is_clockwise = (move1 == 'bottom' && move2 == 'right') || 
                        (move1 == 'top' && move2 == 'left') || 
                        (move1 == 'left' && move2 == 'top') || 
                        (move1 == 'right' && move2 == 'bottom')

    if (is_clockwise) {
      if (move1 == 'bottom') {
        ctx.translate(segment.x * gridSize, segment.y * gridSize + gridSize);
      }
      if (move1 == 'top') {
        ctx.translate(segment.x * gridSize + gridSize, segment.y * gridSize);
      }
      if (move1 == 'left') {
        ctx.translate(segment.x * gridSize + gridSize, segment.y * gridSize + gridSize);
      }
      if (move1 == 'right') {
        ctx.translate(segment.x * gridSize, segment.y * gridSize);
      }
      ctx.rotate(angle - Math.PI / 2 + deltaAngle);
      ctx.clearRect(-gridSize, 0, gridSize, gridSize)
      ctx.drawImage(img, -gridSize, 0, gridSize, gridSize);
    } else {
      if (move1 == 'bottom') {
        ctx.translate(segment.x * gridSize + gridSize, segment.y * gridSize + gridSize);
      }
      if (move1 == 'top') {
        ctx.translate(segment.x * gridSize, segment.y * gridSize);
      }
      if (move1 == 'left') {
        ctx.translate(segment.x * gridSize + gridSize, segment.y * gridSize);
      }
      if (move1 == 'right') {
        ctx.translate(segment.x * gridSize, segment.y * gridSize + gridSize);
      }
      ctx.rotate(angle + Math.PI / 2 - deltaAngle);
      ctx.clearRect(-gridSize, -gridSize, gridSize, gridSize)
      ctx.drawImage(img, -gridSize, -gridSize, gridSize, gridSize);
    }
    ctx.restore();

    if (isMoveThroughWall(segment, snake[1])) {

      ctx.save();
      let move1;

      if (move2 == 'left' || move2 == 'right') {
        if (snake[2].y < snake[1].y) {
          move1 = 'top'
        }
        if (snake[2].y > snake[1].y) {
          move1 = 'bottom'
        }
      } else {
        if (snake[2].x < snake[1].x) {
          move1 = 'right'
        }
        if (snake[2].x > snake[1].x) {
          move1 = 'left'
        }
      }
      let is_clockwise = (move1 == 'bottom' && move2 == 'right') || (move1 == 'top' && move2 == 'left') || (move1 == 'left' && move2 == 'top') || (move1 == 'right' && move2 == 'bottom')

      if (is_clockwise) {
        if (move1 == 'bottom') {
          ctx.translate(snake[1].x * gridSize + gridSize, snake[1].y * gridSize + gridSize);
        }
        if (move1 == 'top') {
          ctx.translate(snake[1].x * gridSize, snake[1].y * gridSize);
        }
        if (move1 == 'left') {
          ctx.translate(snake[1].x * gridSize + gridSize, snake[1].y * gridSize);
        }
        if (move1 == 'right') {
          ctx.translate(snake[1].x * gridSize, snake[1].y * gridSize + gridSize);
        }
        ctx.rotate(angle - Math.PI / 2 + deltaAngle);
        ctx.clearRect(-gridSize, 0, gridSize, gridSize)
        ctx.drawImage(img, -gridSize, 0, gridSize, gridSize);
      } else {
        if (move1 == 'bottom') {
          ctx.translate(snake[1].x * gridSize, snake[1].y * gridSize + gridSize);
        }
        if (move1 == 'top') {
          ctx.translate(snake[1].x * gridSize + gridSize, snake[1].y * gridSize);
        }
        if (move1 == 'left') {
          ctx.translate(snake[1].x * gridSize + gridSize, snake[1].y * gridSize + gridSize);
        }
        if (move1 == 'right') {
          ctx.translate(snake[1].x * gridSize, snake[1].y * gridSize);
        }
        ctx.rotate(angle + Math.PI / 2 - deltaAngle);
        ctx.clearRect(-gridSize, -gridSize, gridSize, gridSize)
        ctx.drawImage(img, -gridSize, -gridSize, gridSize, gridSize);
      }
      ctx.restore();
    }
  }
}

function isMoveThroughWall(segment1, segment2){
  return (segment1.x == 0 && segment2.x == canvasWidth - 1) || (segment1.x == canvasWidth - 1 && segment2.x == 0) || (segment1.y == 0 && segment2.y == canvasHeight - 1) || (segment1.y == canvasHeight - 1 && segment2.y == 0)
}

function calculateWaist(idx) {
  let snakeLength = snake.length - 1;
  let heightStart = gridSize * 0.75;
  let heightEnd = gridSize * 0.5;
  let calcHeight = heightStart
  for (let i = 0; i < snakeLength; i++) {
    calcHeight = calcHeight - 0.25
  }
  if (calcHeight > heightEnd) {
    heightEnd = calcHeight
  }
  return (gridSize * 0.125) + ((heightStart - heightEnd) / 2) / snakeLength * idx
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
  if (dyPrev === 1 && dxNext === -1 || dxPrev==1 && dyNext==-1) return 'topleft';// Поворот вверх-право
  if (dyPrev === -1 && dxNext === -1 || dxPrev==1 && dyNext==1) return 'bottomleft';// Низ-право
  if (dyPrev === 1 && dxNext === 1 || dxPrev==-1 && dyNext==-1) return 'topright';       // Верх-лево
  if (dyPrev === -1 && dxNext === 1 || dxPrev==-1 && dyNext==1) return 'bottomright';   // Низ-лево
}

function random(min, max) {
	return Math.floor(Math.random() * max) + min;
}

function generateHexColor() {
	return `#${random(0, 255).toString(16).padStart(2,'0')}${random(0, 255).toString(16).padStart(2,'0')}${random(0, 255).toString(16).padStart(2,'0')}`;
}