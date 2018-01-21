var Sprite = function(coords, sprite) {
    this.x = coords.x;
    this.y = coords.y;
    this.xInit = coords.x;
    this.yInit = coords.y;
    this.sprite = sprite;
    if (!Resources.get(this.sprite)) {
        Resources.load(this.sprite);
        let that = this;
        Resources.onReadyUrl(this.sprite, function(img) {
            that.spriteWidth = img.width;
            that.collisionEpsilon = that.spriteWidth / 5;
        });
    } else {
        this.spriteWidth = Resources.get(this.sprite).width;
        this.collisionEpsilon = this.spriteWidth / 5;
    }
};

Sprite.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

Sprite.prototype.update = function(dt) {
};

Sprite.prototype.reset = function() {
    this.x = this.xInit;
    this.y = this.yInit;
};

// Enemies our player must avoid
var Enemy = function(coords, velocity, player) {
    Sprite.call(this, coords, 'images/enemy-bug.png');
    this.velocity = velocity;
    this.player = player;
    this.collisionEpsilon = 20;
};

Enemy.prototype = Object.create(Sprite.prototype);
Enemy.prototype.constructor = Enemy;

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    if (game.roundOver()) {
        return;
    }

    Sprite.prototype.update.call(this);

    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    this.x = this.x + this.velocity * dt;
    if (this.x > ctx.canvas.clientWidth) {
        this.x = -this.spriteWidth;
    }
    // check for collision
    game.checkCollisionPlayer(this);
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function(coords) {
    Sprite.call(this, coords, 'images/char-boy.png');
    this.collision = false;
    this.won = false;
    this.wonVelocity = 300;
};

Player.prototype = Object.create(Sprite.prototype);
Player.prototype.constructor = Player;

Player.prototype.reset = function() {
    Sprite.prototype.reset.call(this);
    this.collision = false;
    this.won = false;
};

Player.prototype.render = function() {
    let frequency = 200;
    if (this.alive() || Math.floor(Date.now() / frequency) % 2) {
        Sprite.prototype.render.call(this)
    }
};

Player.prototype.update = function(dt) {
    if (this.won) {
        this.x += this.wonVelocity * dt;
    } else {
        game.checkWin();
    }
};

Player.prototype.setWon = function() {
    this.won = true;
};

Player.prototype.collide = function() {
    this.collision = true;
    game.collide();
};

Player.prototype.alive = function() {
    return !this.collision;
};

Player.prototype.handleInput = function(keyCode) {
    let newX, newY;
    if (!this.alive() || this.won) {
        return;
    }
    switch(keyCode) {
        case 'up':
            newY = this.y - game.grid.cellHeight();
            if (this.y > 0) {
                this.y = newY;
            }
            break;
        case 'down':
            newY = this.y + game.grid.cellHeight();
            if (this.y < game.grid.maxY()) {
                this.y = newY;
            }
            break;
        case 'right':
            newX = this.x + game.grid.cellWidth();
            if (this.x < game.grid.maxX()) {
              this.x = newX;
            }
            break;
        case 'left':
            newX = this.x - game.grid.cellWidth();
            if (this.x > 0) {
              this.x = newX;
            }
            break;
    }
};

var Grid = function() {
    this.CELL_HEIGHT = 83;
    this.CELL_WIDTH = 101;
};

Grid.prototype.maxX = function() {
    return this.cellToCoords(4, 0).x;
};
Grid.prototype.maxY = function() {
    return this.cellToCoords(0, 5).y;
};
Grid.prototype.cellToCoords = function(col, row) {
    return {
        x: col * this.CELL_WIDTH,
        y: row * this.CELL_HEIGHT - 10
    };
};
Grid.prototype.cellWidth = function() {
    return this.CELL_WIDTH;
};
Grid.prototype.cellHeight = function() {
    return this.CELL_HEIGHT;
};
Grid.prototype.roadLaneCoords = function(laneNum, colNum) {
    return {
        x: colNum === undefined ? 0 : this.cellToCoords(colNum, 0).x,
        y: this.CELL_HEIGHT * (laneNum) - 20
    };
};

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});

var Game = function() {
    this.level = 1;
    this.score = 0;
    this.lives = 3;
    this.grid = new Grid();

    this.enemies = [];
    this.player = new Player(this.grid.cellToCoords(2, 5));
};

Game.prototype.createEnemies = function() {
    let numLanes = 3;
    let numEnemies = numLanes + this.level;
    let enemies = [];
    for (let i = 0; i < numEnemies; ++i) {
        let lane = Math.floor(Math.random() * 10) % numLanes;
        let speed = 60 + 2 * Math.floor(Math.random() * 10) * i;
        let start = Math.random() > 0.3 ? -1 : Math.floor(Math.random() * 10) % 4;
        enemies.push(new Enemy(this.grid.roadLaneCoords(lane + 1, start), speed));
    }
    this.enemies = enemies;
};

Game.prototype.reset = function() {
    this.player.reset();
    this.createEnemies();
    allEnemies = this.getEnemies();
};

Game.prototype.getEnemies = function() {
    return this.enemies;
};

Game.prototype.getPlayer = function() {
    return this.player;
};

Game.prototype.setWin = function() {
    this.player.setWon();
    let that = this;
    setTimeout(function() {
        that.level += 1;
        that.score += 100;
        if (that.score >= 500 && that.score % 500 == 0) {
            that.lives += 1;
        }
        that.reset();
    }, 2000);
};

Game.prototype.roundOver = function() {
    return !this.player.alive();
};

Game.prototype.checkCollisionPlayer = function(sprite) {
    if (Math.abs(sprite.y - player.y) < this.grid.cellHeight() / 4) {
        if (Math.abs(sprite.x - player.x) <
            sprite.spriteWidth - sprite.collisionEpsilon) {
            player.collide();
        }
    }
};

Game.prototype.checkWin = function() {
    if (Math.abs(this.grid.cellToCoords(0,0).y - this.player.y) < this.grid.cellHeight()) {
        this.setWin();
    }
};

Game.prototype.collide = function() {
    this.lives -= 1;
    let that = this;
    setTimeout(function() {
        if (that.lives === 0) {
            that.over();
        } else {
            that.player.reset();
        }
    }, 2000);
}

Game.prototype.over = function() {
    allEnemies = [];
    let that = this;
    labels.render = function() {
        ctx.save();
        ctx.fillStyle = "Blue";
        ctx.font = "bold 50px Arial";
        ctx.fillText("Game Over (:", 120, that.grid.cellHeight() * 2 + 30);
        ctx.fillText("Refresh to restart", 40, that.grid.cellHeight() * 3 + 30);
        ctx.restore();
    }
};

var game = new Game();
game.createEnemies();

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
allEnemies = game.getEnemies();
player = game.getPlayer();

var labels = {
    render: function(e) {
        ctx.save();
        ctx.strokeStyle = "Black";
        ctx.font = "30px Comic Sans MS";
        ctx.strokeText("Level: " + game.level, 0, 30);
        ctx.strokeText("Score: " + game.score, 180, 30);
        ctx.strokeText("Lives: " + game.lives, 390, 30);
        ctx.restore();
    }
};
