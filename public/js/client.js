(function($) {

    var $stage,
        context,
        $scoreboard,
        server,
        snakeId,
        STAGE_WIDTH  = 50,
        STAGE_HEIGHT = 50,
        BLOCK_WIDTH = 10,
        BLOCK_HEIGHT = 10;

    function connect() {
        server = io.connect(document.location.origin + '/snake');

        server.on('response', function(data) {
            snakeId = data.snakeId;
        });

        server.on('update', function(data) {
            renderSnakes(data.snakes);
            renderBonuses(data.bonuses);
            renderPortals(data.portals);
        });

        server.on('scoreboard:update', function(players) {
            renderScoreboard(players);
        });
    }

    function listenKeys() {
        var direction;

        $(document).keydown(function(e) {
            switch (e.keyCode) {
                case 37: // Left
                    direction = 'left';
                    break;
                case 38: // Up
                    direction = 'up';
                    break;
                case 39: // Right
                    direction = 'right';
                    break;
                case 40: // Down
                    direction = 'down';
                    break;
                default:
                    return;
            }
            e.preventDefault();
            server.emit('player:direction:request', direction);
        });
    }

    function renderSnakes(snakes) {
        // context.clearRect(0, 0, BLOCK_WIDTH*STAGE_WIDTH - 1, BLOCK_HEIGHT*STAGE_HEIGHT - 1);
        renderGrid();

        for (var i in snakes) {
            var snake = snakes[i];
            var elements = snake.elements;
            if (snake.playerId === snakeId) {
                context.fillStyle = '#3b59a9';
            } else {
                context.fillStyle = 'rgba(255, 43, 0, 0.8)';
            }
            for (var j = 0, l = elements.length; j < l; j++) {
                var x = elements[j].x * BLOCK_WIDTH,
                    y = elements[j].y * BLOCK_HEIGHT;
                    // alpha = (jj*l)/100+0.1;

                // context.fillStyle = 'rgba(0, 0, 0, ' + alpha + ')';
                context.fillRect(x, y, BLOCK_WIDTH -1, BLOCK_HEIGHT -1);
            }
        }
    }

    function renderBonuses(bonuses) {
        bonuses.forEach(function(bonus) {
            context.fillStyle = '#777';
            var x = bonus.x * BLOCK_WIDTH,
                y = bonus.y * BLOCK_HEIGHT;
            context.fillRect(x, y, BLOCK_WIDTH -1, BLOCK_HEIGHT -1);
        });
    }

    function renderPortals(portals) {
        portals.forEach(function(portal) {
            // input
            context.fillStyle = 'rgb(80, 192, 238)';
            var inX = portal.input.x * BLOCK_WIDTH,
                inY = portal.input.y * BLOCK_HEIGHT;
            context.fillRect(inX, inY, BLOCK_WIDTH -1, BLOCK_HEIGHT -1);
            // output
            context.fillStyle = 'rgb(236, 93, 48)';
            var outX = portal.output.x * BLOCK_WIDTH,
                outY = portal.output.y * BLOCK_HEIGHT;
            context.fillRect(outX, outY, BLOCK_WIDTH -1, BLOCK_HEIGHT -1);
        });
    }

    function renderGrid() {
        context.fillStyle = '#eee';
        for (var x = 0; x < STAGE_WIDTH; x++) {
            for (var y = 0; y < STAGE_HEIGHT; y++) {
                context.fillRect(x * BLOCK_WIDTH, y * BLOCK_HEIGHT,BLOCK_WIDTH -1, BLOCK_HEIGHT -1);
            }
        }
    }

    function renderScoreboard(players) {
        // Emty and render each player
        $scoreboard.empty();
        players.forEach(function(player) {
            $scoreboard.append(makeScoreboardRow(player));
        });
    }

    function makeScoreboardRow(player) {
        // Display only 2 decimals, keeping original value if NaN
        var ratio = typeof(player.ratio) === 'number' ?
            player.ratio.toFixed(2) :
            player.ratio;
        return '<tr>' +
            '<td>' + player.name   + '</td>' +
            '<td>' + player.kills  + '</td>' +
            '<td>' + player.deaths + '</td>' +
            '<td>' + ratio         + '</td>' +
            '<td>' + player.score  + '</td>' +
            '</tr>';
    }
    
    $(document).ready(function() {
        $stage = $('#stage');
        context = $stage.get(0).getContext('2d');
        $scoreboard = $('#scoreboard > tbody');

        // Bootstrap app
        connect();
        listenKeys();
    });

})(window.jQuery);