var Server = require('./server.js').Server,
    Snake = require('./snake.js').Snake,
    Bonus = require('./bonus.js').Bonus,
    io = require('socket.io');

var snakes = {};
var bonuses = [];

var server = new Server({
    port: 5000,
    snakes: snakes,
    bonuses: bonuses
});

// Event process
server.em.addListener('Server.newSnake', function(playerId) {
    var snake = new Snake(playerId);
    snakes[playerId] = snake;
});
server.em.addListener('Snake.disconnect', function(playerId) {
    console.log('Client disconnected with ID ' + playerId);
    delete snakes[playerId];
});
server.em.addListener('Snake.changeDirection', function(data) {
    snakes[data.id].setDirection(data.direction);
});

// Make bonuses
(function makeBonuses() {
    for (var i = 0; i < 5; i++) {
        bonuses.push(new Bonus());
    }
})();

// Update positions & notify clients
var update = function() {
    for (var i in snakes) {
        snakes[i].step();
    }
    checkCollisions();
    server.update();
};
var tick = setInterval(update, 100);

function checkCollisions() {
    // Check bonus collision
    bonuses.forEach(function(item, index) {
        for (var i in snakes) {
            if (snakes[i].collideWith(item)) {
                bonuses[index] = new Bonus();
                snakes[i].grow();
            }
        }
    });
    // snake him self
    
    // others
    for (var j in snakes) {
        var snake = snakes[j];
        // Check self-collisions
        if (snake.collideWithSelf()) {
            snake.die();
        }
    }
}

server.start();