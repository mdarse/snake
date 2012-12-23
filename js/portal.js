exports.Portal = Portal = function() {
    this.STAGE_WIDTH  = 50;
    this.STAGE_HEIGHT = 50;

    // init
    do {
        this.input = this.generatePoint();
        this.output = this.generatePoint();
    } while (
        this.input.x === this.output.x ||
        this.input.y === this.output.y
    );
};

Portal.prototype.generatePoint = function() {
    var x = Math.floor(Math.random() * (this.STAGE_WIDTH - 1));
    var y = Math.floor(Math.random() * (this.STAGE_HEIGHT - 1));
    return { x: x, y: y };
};