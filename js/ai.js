class SnakeAI {
    constructor(grid, snake, rocks) {
        this.grid = grid;
        this.snake = snake;
        this.rocks = rocks;
    }

    // Проверка, доступна ли ячейка и нет ли в ней сегмента змейки или препятствия
    isCellAvailable(x, y) {
        const wrappedX = (x + this.grid.width) % this.grid.width;
        const wrappedY = (y + this.grid.height) % this.grid.height;

        return !this.snake.some(segment => segment.x === wrappedX && segment.y === wrappedY) &&
               !this.rocks.some(segment => segment.x === wrappedX && segment.y === wrappedY);
    }

    // Оценка доступного пространства вокруг позиции
    evaluateSpace(x, y) {
        const queue = [{ x, y }];
        const visited = new Set([`${x},${y}`]);
        let spaceCount = 0;

        // BFS для оценки свободного пространства вокруг позиции
        while (queue.length > 0 && spaceCount < 10) {  // Ограничиваем до 10 для эффективности
            const { x, y } = queue.shift();
            spaceCount++;

            const directions = [
                { x: 1, y: 0 }, { x: -1, y: 0 },
                { x: 0, y: 1 }, { x: 0, y: -1 }
            ];

            for (const dir of directions) {
                const newX = (x + dir.x + this.grid.width) % this.grid.width;
                const newY = (y + dir.y + this.grid.height) % this.grid.height;
                const newPos = `${newX},${newY}`;

                if (this.isCellAvailable(newX, newY) && !visited.has(newPos)) {
                    visited.add(newPos);
                    queue.push({ x: newX, y: newY });
                }
            }
        }
        return spaceCount;  // Чем больше свободного пространства, тем безопаснее путь
    }

    // Поиск пути к еде с учётом тупиков
    findPathToFood(food, candy) {
        const maxSteps = 500;
        let step = 0;
        const head = this.snake[0];
        const queue = [{ x: head.x, y: head.y, path: [] }];
        const visited = new Set();
        visited.add(`${head.x},${head.y}`);

        while (queue.length > 0 && step < maxSteps) {
            const { x, y, path } = queue.shift();

            // Если достигли еды, возвращаем первый шаг на пути
            if ((x === food.x && y === food.y) || (candy && x === candy.x && y === candy.y)) {
                return path.length > 0 ? path[0] : null;
            }

            const directions = [
                { x: 1, y: 0 }, { x: -1, y: 0 },
                { x: 0, y: 1 }, { x: 0, y: -1 }
            ];

            // Оценка доступных ходов с приоритетом для направлений с большим свободным пространством
            const moves = directions
                .map(dir => {
                    const newX = (x + dir.x + this.grid.width) % this.grid.width;
                    const newY = (y + dir.y + this.grid.height) % this.grid.height;
                    const newPos = `${newX},${newY}`;
                    if (this.isCellAvailable(newX, newY) && !visited.has(newPos)) {
                        return { dir, newX, newY, space: this.evaluateSpace(newX, newY) };
                    }
                    return null;
                })
                .filter(move => move !== null)
                .sort((a, b) => b.space - a.space);  // Приоритет ходов с большим свободным пространством

            for (const move of moves) {
                const { dir, newX, newY } = move;
                const newPos = `${newX},${newY}`;
                visited.add(newPos);
                queue.push({ x: newX, y: newY, path: [...path, dir] });
            }
            step++;
        }

        // Если путь не найден, возвращаем null
        return null;
    }
}
