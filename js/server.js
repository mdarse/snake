var express = require('express'),
    EventEmitter = require('events').EventEmitter,
    http = require('http'),
    io = require('socket.io');

exports.Server = Server = function(options) {
    this.clientId = 1;
    this.snakes = options.snakes;
    this.bonuses = options.bonuses;

    this.options = options;
    this.initialize(options);
};

Server.prototype.initialize = function(options) {
    // New express app
    this.app = express();
    this.server = http.createServer(this.app);
    this.em = new EventEmitter();

    // Load static file serving middleware
    this.app.use(express.static(__dirname + '/../public'));
    
    this.setupSockets();
};

Server.prototype.start = function() {
    var port = this.options.port;
    this.server.listen(port);
    console.log('Listening on port: ' + port);
};

Server.prototype.setupSockets = function() {

    this.socket = io.listen(this.server);

    this.socket.configure(function() {
        this.socket.set('log level', 1);
    }.bind(this));

    this.socket.of('/snake').on('connection', function(client) {
        client.snakeId = this.clientId;
        this.clientId++;

        client.emit('response', { snakeId: client.snakeId });
        this.em.emit('Server.newSnake', client.snakeId);
        console.log('Client connected with ID ' + client.snakeId);

        client.on('Snake.requestDirection', function(direction) {
            this.em.emit('Snake.changeDirection', {
                id: client.snakeId,
                direction: direction
            });
        }.bind(this));

        client.on('disconnect', function() {
            this.em.emit('Snake.disconnect', client.snakeId);
        }.bind(this));

    }.bind(this));
};

Server.prototype.update = function() {
    this.socket.of('/snake').emit('update', {
        snakes: this.snakes,
        bonuses: this.bonuses
    });
};
