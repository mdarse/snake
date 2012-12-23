var Server = require('./server.js').Server,
    Snake = require('./snake.js').Snake,
    Bonus = require('./bonus.js').Bonus,
    Portal = require('./portal.js').Portal,
    io = require('socket.io'),
    _ = require('underscore');

var snakes = {};
var bonuses = [];

// Portals
var portals = [];
// Portal gives the ability to teleport from one place to another
// you just need to enter by the entry portal and you will teleport
// Warning: Wrond way will kill your snake.

var port = process.env.PORT || 5000;
var server = new Server({
    port: port,
    snakes: snakes,
    bonuses: bonuses,
    portals: portals
});

// Event process
server.em.addListener('player:connect', function(playerId) {
    console.log('Player #' + playerId + ' connected');
    var snake = new Snake(playerId);
    snakes[playerId] = snake;

    // Publish new player
    server.updateScoreBoard();
});
server.em.addListener('player:disconnect', function(playerId) {
    console.log('Player #' + playerId + ' disconnected');
    delete snakes[playerId];

    // Update scores
    server.updateScoreBoard();
});
server.em.addListener('player:direction:change', function(playerId, direction) {
    snakes[playerId].setDirection(direction);
});

// Make bonuses
(function makeBonuses() {
    for (var i = 0; i < 5; i++) {
        bonuses.push(new Bonus());
    }
})();
// Make portals
portals.push(new Portal());

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

    var deads = [];
    var scoreboardNeedUpdate = false;

    _(snakes).each(function(snake) {
        // Bonus collision
        _(bonuses).each(function(bonus, index) {
            if (snake.collideWith(bonus)) {
                bonuses[index] = new Bonus();
                snake.grow();
                scoreboardNeedUpdate = true;
            }
        });
        // Portal  collision
        _(portals).each(function(portal, index) {
            if (snake.collideWith(portal.input)) {
                snake.teleportTo(portal.output);
            }
            else if (snake.collideWith(portal.output)) {
                deads.push(snake);
            }
        });
        // Self collision
        if (snake.collideWithSelf()) {
            deads.push(snake);
            scoreboardNeedUpdate = true;
        }
        // Other killed
        _(snakes).each(function(other) {
            // Check if others head hit snake body
            if (other !== snake && other.collideWithSnake(snake)) {
                deads.push(other);
                snake.onKill();
                scoreboardNeedUpdate = true;
            }
        });
    });

    _(deads).invoke('onDie');

    // Scoreboard
    if (scoreboardNeedUpdate) server.updateScoreBoard();
}

server.start();
