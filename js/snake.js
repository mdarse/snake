exports.Snake = Snake = function(playerId) {
    this.SNAKE_LENGTH = 8;
    this.STAGE_WIDTH  = 50;
    this.STAGE_HEIGHT = 50;

    this.playerId = playerId;
    this.initialize();
};

Snake.prototype.initialize = function() {
    
    this.kills = 0;
    this.deaths = 0;

    this.reset();
};

Snake.prototype.die = function() {
    this.deaths++;
    this.reset();
};

Snake.prototype.reset = function() {
    this.elements = [];
    this.direction = this.nextDirection = 'right';

    var y = Math.floor(Math.random() * this.STAGE_WIDTH);
    for (var i = this.SNAKE_LENGTH - 1; i >= 0; i--) {
        this.elements[i] = { x: -i, y: y };
    }
    this.head = this.elements[0];
    this.tail = this.elements[this.elements.length -1];
};

Snake.prototype.grow = function() {
    console.log('Snake::grow');

    
};

Snake.prototype.step = function() {
    this.direction = this.nextDirection;
    
    var newTail = this.findNewTail(this.tail);

    // Move tail to new head position
    this.tail.x = (this.head.x + this.dx[this.direction] + this.STAGE_HEIGHT) % this.STAGE_HEIGHT;
    this.tail.y = (this.head.y + this.dy[this.direction] + this.STAGE_WIDTH) % this.STAGE_WIDTH;

    // update tail & head references
    this.head = this.tail;
    this.tail = newTail;
};

Snake.prototype.findNewTail = function(currentTail) {
    var currentTailIndex = this.elements.indexOf(currentTail);
    var tailIndex = (currentTailIndex + this.SNAKE_LENGTH -1) % this.SNAKE_LENGTH;
    return this.elements[tailIndex];
};

Snake.prototype.directions = ['right', 'left', 'up', 'down'];
Snake.prototype.dx = {
    right: 1,
    left: -1,
    up: 0,
    down: 0
};
Snake.prototype.dy = {
    right: 0,
    left: 0,
    up: -1,
    down: 1
};
Snake.prototype.opposite = {
    right: 'left',
    left: 'right',
    up: 'down',
    down: 'up'
};

Snake.prototype.setDirection = function(direction) {
    // Prevent backway
    if (this.opposite[direction] === this.direction) return;
    this.nextDirection = direction;
};

Snake.prototype.collideWith = function(other) {
    return (this.head.x === other.x && this.head.y === other.y);
};

Snake.prototype.collideWithSelf = function() {
    var elements = this.elements;
    for (var i = 0, l = elements.length; i < l; i++) {
        var elementA = elements[i];
        for (var j = 0; j < l; j++) {
            var elementB = elements[j];
            if (elementA !== elementB && elementA.x === elementB.x && elementA.y === elementB.y)
                return true;
        }
    }
    return false;
};
