import Phaser from "phaser";

class WorldScene extends Phaser.Scene {
  constructor() {
    super("WorldScene");
  }

  create() {
    // WORLD SETTINGS
    this.worldWidth = 2400;
    this.worldHeight = 1800;

    // CREATE GRASS BACKGROUND
    const grass = this.add.graphics();

    grass.fillStyle(0x75ad48, 1);
    grass.fillRect(0, 0, this.worldWidth, this.worldHeight);

    // CREATE GRASS DETAILS
    for (let i = 0; i < 700; i++) {
      const x = Phaser.Math.Between(0, this.worldWidth);

      const y = Phaser.Math.Between(0, this.worldHeight);

      const color = Phaser.Utils.Array.GetRandom([
        0x649d3d, 0x83b957, 0x92c463, 0x5e963d,
      ]);

      grass.fillStyle(color, 1);
      grass.fillRect(x, y, 4, 4);
    }

    // CREATE PLAYER TEXTURE
    const playerGraphics = this.make.graphics({
      x: 0,
      y: 0,
      add: false,
    });

    // Shadow
    playerGraphics.fillStyle(0x000000, 0.25);
    playerGraphics.fillEllipse(16, 29, 22, 9);

    // Body
    playerGraphics.fillStyle(0x2874c8);
    playerGraphics.fillRect(8, 15, 16, 13);

    // Head
    playerGraphics.fillStyle(0xf2c18d);
    playerGraphics.fillRect(9, 3, 14, 13);

    // Hair
    playerGraphics.fillStyle(0x513323);
    playerGraphics.fillRect(8, 2, 16, 5);
    playerGraphics.fillRect(8, 5, 3, 7);

    // Eyes
    playerGraphics.fillStyle(0x222222);
    playerGraphics.fillRect(12, 9, 2, 2);
    playerGraphics.fillRect(19, 9, 2, 2);

    // Arms
    playerGraphics.fillStyle(0xf2c18d);
    playerGraphics.fillRect(4, 16, 5, 10);
    playerGraphics.fillRect(23, 16, 5, 10);

    // Legs
    playerGraphics.fillStyle(0x403b35);
    playerGraphics.fillRect(9, 27, 6, 6);
    playerGraphics.fillRect(17, 27, 6, 6);

    playerGraphics.generateTexture("player", 32, 36);

    playerGraphics.destroy();

    // CREATE TREE TEXTURE
    const treeGraphics = this.make.graphics({
      x: 0,
      y: 0,
      add: false,
    });

    // Tree trunk
    treeGraphics.fillStyle(0x704323);
    treeGraphics.fillRect(17, 23, 14, 28);

    // Tree leaves
    treeGraphics.fillStyle(0x246b36);
    treeGraphics.fillRect(7, 12, 34, 25);

    treeGraphics.fillStyle(0x358b40);
    treeGraphics.fillRect(12, 4, 24, 28);

    treeGraphics.fillStyle(0x55a447);
    treeGraphics.fillRect(17, 7, 14, 10);

    treeGraphics.generateTexture("tree", 48, 52);

    treeGraphics.destroy();

    // CREATE ROCK TEXTURE
    const rockGraphics = this.make.graphics({
      x: 0,
      y: 0,
      add: false,
    });

    rockGraphics.fillStyle(0x777777);
    rockGraphics.fillRect(3, 8, 28, 17);

    rockGraphics.fillStyle(0xaaaaaa);
    rockGraphics.fillRect(9, 3, 17, 10);

    rockGraphics.generateTexture("rock", 36, 28);

    rockGraphics.destroy();

    // WORLD OBJECTS
    this.obstacles = this.physics.add.staticGroup();

    // RANDOM TREES
    for (let i = 0; i < 65; i++) {
      const x = Phaser.Math.Between(80, this.worldWidth - 80);

      const y = Phaser.Math.Between(80, this.worldHeight - 80);

      // Keep spawn area clear
      if (Phaser.Math.Distance.Between(x, y, 400, 400) < 150) {
        continue;
      }

      const tree = this.obstacles.create(x, y, "tree");

      tree.setOrigin(0.5, 1);
      tree.refreshBody();
      tree.setDepth(y);
    }

    // RANDOM ROCKS
    for (let i = 0; i < 30; i++) {
      const x = Phaser.Math.Between(80, this.worldWidth - 80);

      const y = Phaser.Math.Between(80, this.worldHeight - 80);

      const rock = this.obstacles.create(x, y, "rock");

      rock.setOrigin(0.5, 1);
      rock.refreshBody();
      rock.setDepth(y);
    }

    // CREATE PLAYER
    this.player = this.physics.add.sprite(400, 400, "player");

    this.player.setDepth(400);
    this.player.setCollideWorldBounds(true);

    this.player.body.setSize(18, 12);
    this.player.body.setOffset(7, 22);

    // COLLISION
    this.physics.add.collider(this.player, this.obstacles);

    // WORLD BOUNDS
    this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);

    // CAMERA
    this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    this.cameras.main.setZoom(2);

    // KEYBOARD
    this.keys = this.input.keyboard.addKeys({
      up: "W",
      down: "S",
      left: "A",
      right: "D",
    });

    this.cursors = this.input.keyboard.createCursorKeys();

    // PLAYER NAME
    this.playerName = this.add.text(0, 0, "Adventurer", {
      fontSize: "9px",
      color: "#ffffff",
      stroke: "#222222",
      strokeThickness: 3,
    });

    this.playerName.setOrigin(0.5, 1);
    this.playerName.setDepth(10000);

    // WELCOME MESSAGE
    this.add
      .text(400, 340, "GREEN VALLEY", {
        fontSize: "22px",
        color: "#ffffff",
        stroke: "#244522",
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setScrollFactor(0);
  }

  update() {
    const speed = 180;

    let velocityX = 0;
    let velocityY = 0;

    // MOVEMENT
    if (this.keys.left.isDown || this.cursors.left.isDown) {
      velocityX = -speed;
    }

    if (this.keys.right.isDown || this.cursors.right.isDown) {
      velocityX = speed;
    }

    if (this.keys.up.isDown || this.cursors.up.isDown) {
      velocityY = -speed;
    }

    if (this.keys.down.isDown || this.cursors.down.isDown) {
      velocityY = speed;
    }

    // NORMALIZE DIAGONAL MOVEMENT
    const velocity = new Phaser.Math.Vector2(velocityX, velocityY);

    velocity.normalize();

    this.player.setVelocity(velocity.x * speed, velocity.y * speed);

    // UPDATE PLAYER DEPTH
    this.player.setDepth(this.player.y);

    // UPDATE NAME POSITION
    this.playerName.setPosition(this.player.x, this.player.y - 35);
  }
}

// GAME CONFIGURATION
const config = {
  type: Phaser.AUTO,

  parent: "game",

  width: window.innerWidth,
  height: window.innerHeight,

  backgroundColor: "#75ad48",

  pixelArt: true,

  physics: {
    default: "arcade",
    arcade: {
      debug: false,
    },
  },

  scene: [WorldScene],
};

// START GAME
const game = new Phaser.Game(config);

// RESPONSIVE WINDOW
window.addEventListener("resize", () => {
  game.scale.resize(window.innerWidth, window.innerHeight);
});
