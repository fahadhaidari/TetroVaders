class Entity {
    constructor(shape, color, size, row = 0, col = 0) {
        this.shape = shape;
        this.color = color;
        this.size = size;
        this.x = col * size;
        this.y = row * size;
        this.row = row;
        this.col = col;
        this.parts = [];
        this.pool = [];
        this.partsDictionary = {};
        this.init(shape, this.row, this.col);
    }

    init(shape, row, col) {
        this.row = row;
        this.col = col;
        let id = 0;
        for (let i = 0; i < shape.matrix.length; i ++) {
            for (let j = 0; j < shape.matrix[i].length; j ++) {
                if (shape.matrix[i][j] > 0) {
                    let part = null;
                    if (this.pool.length) {
                        part = this.pool.pop();
                    } else {
                        part = {};
                    }
                    id ++;
                    part.id = id;
                    part.row = this.row + i;
                    part.col = this.col + j;
                    part.x = this.x + j * this.size;
                    part.y = this.y + i * this.size;
                    part.color = shape.color;
                    this.partsDictionary[id] = part;
                }
            }
        }
    }

    draw(context) {
        const lineWidth = 0;
        const padding = 0;

        for (let i in this.partsDictionary) {
            const p = this.partsDictionary[i];
            context.fillStyle = p.color;
            context.strokeStyle = '#111111';
            context.lineWidth = lineWidth;
            context.fillRect(p.x + (lineWidth + padding), p.y + (lineWidth + padding), this.size, this.size);
            context.strokeRect(p.x + (lineWidth + padding), p.y + (lineWidth + padding), this.size, this.size);
        }
        context.lineWidth = 1;
    }

    move(row, col) {
        this.row += row;
        this.col += col;
        for (let i in this.partsDictionary) {
            const p = this.partsDictionary[i];
            p.row += row;
            p.col += col;
            p.y += row * this.size;
            p.x += col * this.size;
        }
    }

    removePart(id) {
        this.pool.push(this.partsDictionary[id]);
        delete this.partsDictionary[id];
    }

    getLastCol() {
        let max = 0;

        Object.values(this.partsDictionary).forEach(p => max = p.col > max ? p.col : max);
        return max;
    }

    getLastRow() {
        let max = 0;

        Object.values(this.partsDictionary).forEach(p => max = p.row > max ? p.row : max);
        return max;
    }

    getFirstCol() {
        let min = 100;

        Object.values(this.partsDictionary).forEach(p => min = p.col < min ? p.col : min);
        return min;
    }

    getFirstRow() {
        let min = 100;

        Object.values(this.partsDictionary).forEach(p => min = p.row < min ? p.row : min);
        return min;
    }

    isEmpty() {
        return Object.keys(this.partsDictionary).length === 0;
    }
}