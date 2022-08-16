import Phaser  from "phaser";

console.log(Phaser, "test poney");


const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {
                y: 300
            },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

let GAME = new Phaser.Game(config);

let platforms;
let player;
let cursors;
let stars;
let bombs;
let score = 0;
let scoreText;
let gameOver = false;

function preload() {
    this.load.image('sky', 'assets/sky.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('notastar', 'assets/notastar.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
}

function create() {
    createWorld(this);
    createPlayer(this);
    addStarsGroup(this);
    addBombs(this);
    scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#FFFF' });
    cursors = this.input.keyboard.createCursorKeys();
}

function update() {
    if (gameOver) {
        return;
    }

    if (cursors.left.isDown) {
        player.setVelocityX(-160);

        player.anims.play('gauche', true);
    }
    else if (cursors.right.isDown) {
        player.setVelocityX(160);

        player.anims.play('right', true);
    }
    else {
        player.setVelocityX(0);

        player.anims.play('turn');
    }

    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-330);
    }
    
    if (cursors.down.isDown  && !player.body.touching.down) {
        player.setVelocityY(330);
    }
}

function createWorld(game) {
    game.add.image(400, 300, 'sky');
    platforms = game.physics.add.staticGroup();

    platforms.create(400, 568, 'ground').setScale(2).refreshBody();

    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 220, 'ground');
}

function createPlayer(game) {
    player = game.physics.add.sprite(100, 450, 'dude');
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);
    game.physics.add.collider(player, platforms);

    // Animation cursors
    game.anims.create({
        key: 'gauche',
        frames: game.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    game.anims.create({
        key: 'turn',
        frames: [{ key: 'dude', frame: 4 }],
        frameRate: 20
    });

    game.anims.create({
        key: 'right',
        frames: game.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });
}

function collectStar(player, star) {
    star.disableBody(true, true);
    score += 1;
    scoreText.setText(`Score: ${score}` );

    if (stars.countActive(true) === 0)
    {
        stars.children.iterate(function (child) {
            child.enableBody(true, child.x, 0, true, true);
        });

        var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

        var bomb = bombs.create(x, 16, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
    }
};

function addStarsGroup(game) {
    stars = game.physics.add.group({
        key: 'star',
        repeat: 11,
        setXY: { x: 12, y: 0, stepX: 70 }
    });
    
    stars.children.iterate(child => {
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8))
    });

    game.physics.add.collider(stars, platforms);
    game.physics.add.overlap(player, stars, collectStar, null, game);
}

function hitBomb (player, bomb)
{
    this.physics.pause();

    player.setTint(0xff0000);

    player.anims.play('turn');

    gameOver = true;
}

function addBombs(game) {
    bombs = game.physics.add.group();

    game.physics.add.collider(bombs, platforms);

    game.physics.add.collider(player, bombs, hitBomb, null, game);
}