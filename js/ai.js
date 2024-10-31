class SnakeAI {
    constructor(grid, snake) {
        this.grid = grid;
        this.snake = snake;
    }

    // Проверка, доступна ли ячейка и нет ли в ней сегмента змейки
    isCellAvailable(x, y) {
        // Корректируем координаты на случай перехода через границы
        const wrappedX = (x + this.grid.width) % this.grid.width;
        const wrappedY = (y + this.grid.height) % this.grid.height;
    
        // Проверяем, нет ли сегмента змейки в скорректированной позиции
        return !this.snake.some(segment => segment.x === wrappedX && segment.y === wrappedY);
    }

    // Нахождение кратчайшего пути к еде с использованием BFS
    findPathToFood(food) {
        const head = this.snake[0];
        const queue = [{ x: head.x, y: head.y, path: [] }];
        const visited = new Set();
        visited.add(`${head.x},${head.y}`);

        while (queue.length > 0) {
            const { x, y, path } = queue.shift();

            // Если достигли еды, возвращаем первый шаг на пути
            if (x === food.x && y === food.y) {
                return path.length > 0 ? path[0] : null;
            }

            // Проверяем доступные направления
            const directions = [
                { x: 1, y: 0 }, { x: -1, y: 0 },
                { x: 0, y: 1 }, { x: 0, y: -1 }
            ];

            for (const dir of directions) {
                const newX = x + dir.x;
                const newY = y + dir.y;
                const newPos = `${newX},${newY}`;

                if (this.isCellAvailable(newX, newY) && !visited.has(newPos)) {
                    visited.add(newPos);
                    queue.push({ x: newX, y: newY, path: [...path, dir] });
                }
            }
        }

        // Если путь не найден, возвращаем null
        return null;
    }
}