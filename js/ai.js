class SnakeAI {
    constructor(grid, snake, rocks) {
        this.grid = grid;
        this.snake = snake;
        this.rocks = rocks;
    }

    isCellAvailable(x, y) {
        const wrappedX = (x + this.grid.width) % this.grid.width;
        const wrappedY = (y + this.grid.height) % this.grid.height;
        return !this.snake.some(segment => segment.x === wrappedX && segment.y === wrappedY) &&
               !this.rocks.some(segment => segment.x === wrappedX && segment.y === wrappedY);
    }

    evaluateSpace(x, y) {
        const queue = [{ x, y }];
        const visited = new Set([`${x},${y}`]);
        let spaceCount = 0;
        while (queue.length > 0 && spaceCount < 10) {
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
        return spaceCount;
    }

    findSafePath(food, candy) {
        const head = this.snake[0];
        const queue = [{ x: head.x, y: head.y, path: [] }];
        const visited = new Set([`${head.x},${head.y}`]);
        let moves = [];  // Инициализация moves за пределами цикла

        while (queue.length > 0) {
            const { x, y, path } = queue.shift();

            if ((x === food.x && y === food.y) || (candy && x === candy.x && y === candy.y)) {
                if (this.evaluateSpace(x, y) >= 5) {
                    return path.length > 0 ? path[0] : null;
                }
            }

            const directions = [
                { x: 1, y: 0 }, { x: -1, y: 0 },
                { x: 0, y: 1 }, { x: 0, y: -1 }
            ];

            moves = directions
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
                .sort((a, b) => b.space - a.space);

            for (const move of moves) {
                const { dir, newX, newY } = move;
                const newPos = `${newX},${newY}`;
                visited.add(newPos);
                queue.push({ x: newX, y: newY, path: [...path, dir] });
            }
        }

        return moves.length > 0 ? moves[0].dir : null;
    }
}
