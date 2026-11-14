import Phaser from "phaser";

class WorldScene extends Phaser.Scene {
  constructor() {
    super("WorldScene");

    this.mobileControls = {
      up: false,
      down: false,
      left: false,
      right: false,
    };

    this.mobilePointers = new Map();
    this.mobileButtons = {};
  }

  create() {
    this.worldWidth = 2400;
    this.worldHeight = 1800;

    // GRASS BACKGROUND
    const grass = this.add.graphics();

    grass.fillStyle(0x75ad48, 1);
    grass.fillRect(0, 0, this.worldWidth, this.worldHeight);

    for (let i = 0; i < 700; i++) {
      const x = Phaser.Math.Between(0, this.worldWidth);
      const y = Phaser.Math.Between(0, this.worldHeight);

      const color = Phaser.Utils.Array.GetRandom([
        0x649d3d, 0x83b957, 0x92c463, 0x5e963d,
      ]);

      grass.fillStyle(color, 1);
      grass.fillRect(x, y, 4, 4);
    }

    // PLAYER TEXTURE
    const playerGraphics = this.make.graphics({
      x: 0,
      y: 0,
      add: false,
    });

    playerGraphics.fillStyle(0x000000, 0.25);
    playerGraphics.fillEllipse(16, 29, 22, 9);

    playerGraphics.fillStyle(0x2874c8);
    playerGraphics.fillRect(8, 15, 16, 13);

    playerGraphics.fillStyle(0xf2c18d);
    playerGraphics.fillRect(9, 3, 14, 13);

    playerGraphics.fillStyle(0x513323);
    playerGraphics.fillRect(8, 2, 16, 5);
    playerGraphics.fillRect(8, 5, 3, 7);

    playerGraphics.fillStyle(0x222222);
    playerGraphics.fillRect(12, 9, 2, 2);
    playerGraphics.fillRect(19, 9, 2, 2);

    playerGraphics.fillStyle(0xf2c18d);
    playerGraphics.fillRect(4, 16, 5, 10);
    playerGraphics.fillRect(23, 16, 5, 10);

    playerGraphics.fillStyle(0x403b35);
    playerGraphics.fillRect(9, 27, 6, 6);
    playerGraphics.fillRect(17, 27, 6, 6);

    playerGraphics.generateTexture("player", 32, 36);
    playerGraphics.destroy();

    // TREE TEXTURE
    const treeGraphics = this.make.graphics({
      x: 0,
      y: 0,
      add: false,
    });

    treeGraphics.fillStyle(0x704323);
    treeGraphics.fillRect(17, 23, 14, 28);

    treeGraphics.fillStyle(0x246b36);
    treeGraphics.fillRect(7, 12, 34, 25);

    treeGraphics.fillStyle(0x358b40);
    treeGraphics.fillRect(12, 4, 24, 28);

    treeGraphics.fillStyle(0x55a447);
    treeGraphics.fillRect(17, 7, 14, 10);

    treeGraphics.generateTexture("tree", 48, 52);
    treeGraphics.destroy();

    // ROCK TEXTURE
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

    // OBSTACLES
    this.obstacles = this.physics.add.staticGroup();

    // TREES
    for (let i = 0; i < 65; i++) {
      const x = Phaser.Math.Between(80, this.worldWidth - 80);
      const y = Phaser.Math.Between(80, this.worldHeight - 80);

      if (Phaser.Math.Distance.Between(x, y, 400, 400) < 150) {
        continue;
      }

      const tree = this.obstacles.create(x, y, "tree");

      tree.setOrigin(0.5, 1);
      tree.refreshBody();
      tree.setDepth(y);
    }

    // ROCKS
    for (let i = 0; i < 30; i++) {
      const x = Phaser.Math.Between(80, this.worldWidth - 80);
      const y = Phaser.Math.Between(80, this.worldHeight - 80);

      const rock = this.obstacles.create(x, y, "rock");

      rock.setOrigin(0.5, 1);
      rock.refreshBody();
      rock.setDepth(y);
    }

    // PLAYER
    this.player = this.physics.add.sprite(400, 400, "player");

    this.player.setDepth(400);
    this.player.setCollideWorldBounds(true);

    this.player.body.setSize(18, 12);
    this.player.body.setOffset(7, 22);

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

    // WORLD TITLE
    this.add
      .text(400, 340, "GREEN VALLEY", {
        fontSize: "22px",
        color: "#ffffff",
        stroke: "#244522",
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setScrollFactor(0);

    // MOBILE CONTROLLER
    this.createMobileControls();
  }

  // CREATE MOBILE D-PAD
  createMobileControls() {
    const isTouchDevice =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;

    if (!isTouchDevice) return;

    // Additional touch pointers
    this.input.addPointer(3);

    const directions = [
      { name: "up", icon: "▲" },
      { name: "down", icon: "▼" },
      { name: "left", icon: "◀" },
      { name: "right", icon: "▶" },
    ];

    directions.forEach((direction) => {
      const button = this.add.circle(0, 0, 27, 0x333333, 0.75);

      button.setStrokeStyle(2, 0xffffff);
      button.setScrollFactor(0);
      button.setDepth(10000);
      button.setInteractive();

      const label = this.add.text(0, 0, direction.icon, {
        fontSize: "23px",
        color: "#ffffff",
        fontStyle: "bold",
      });

      label.setOrigin(0.5);
      label.setScrollFactor(0);
      label.setDepth(10001);

      this.mobileButtons[direction.name] = {
        button,
        label,
      };

      button.on("pointerdown", (pointer) => {
        this.mobilePointers.set(pointer.id, direction.name);

        this.updateMobileInput();
      });
    });

    // RELEASE TOUCH
    this.input.on("pointerup", (pointer) => {
      this.mobilePointers.delete(pointer.id);
      this.updateMobileInput();
    });

    // RELEASE IF POINTER MOVES OUTSIDE GAME
    this.input.on("pointerupoutside", (pointer) => {
      this.mobilePointers.delete(pointer.id);
      this.updateMobileInput();
    });

    // RESET IF GAME LOSES FOCUS
    this.input.on("gameout", () => {
      this.mobilePointers.clear();
      this.updateMobileInput();
    });

    this.positionMobileControls();

    this.scale.on("resize", this.positionMobileControls, this);
  }

  // UPDATE TOUCH INPUT
  updateMobileInput() {
    Object.keys(this.mobileControls).forEach((direction) => {
      const active = Array.from(this.mobilePointers.values()).includes(
        direction,
      );

      this.mobileControls[direction] = active;

      const objects = this.mobileButtons[direction];

      if (objects) {
        objects.button.setFillStyle(
          active ? 0x888888 : 0x333333,
          active ? 1 : 0.75,
        );
      }
    });
  }

  // RESPONSIVE BUTTON POSITION
  positionMobileControls() {
    const spacing = 55;

    const centerX = Math.max(90, Math.min(100, this.scale.width * 0.18));

    const centerY = this.scale.height - 105;

    const positions = {
      up: {
        x: centerX,
        y: centerY - spacing,
      },
      down: {
        x: centerX,
        y: centerY + spacing,
      },
      left: {
        x: centerX - spacing,
        y: centerY,
      },
      right: {
        x: centerX + spacing,
        y: centerY,
      },
    };

    Object.keys(positions).forEach((direction) => {
      const objects = this.mobileButtons[direction];

      if (!objects) return;

      const position = positions[direction];

      objects.button.setPosition(position.x, position.y);

      objects.label.setPosition(position.x, position.y);
    });
  }

  // GAME UPDATE
  update() {
    const speed = 180;

    let velocityX = 0;
    let velocityY = 0;

    const left =
      this.keys.left.isDown ||
      this.cursors.left.isDown ||
      this.mobileControls.left;

    const right =
      this.keys.right.isDown ||
      this.cursors.right.isDown ||
      this.mobileControls.right;

    const up =
      this.keys.up.isDown || this.cursors.up.isDown || this.mobileControls.up;

    const down =
      this.keys.down.isDown ||
      this.cursors.down.isDown ||
      this.mobileControls.down;

    if (left) velocityX = -speed;
    if (right) velocityX = speed;

    if (up) velocityY = -speed;
    if (down) velocityY = speed;

    // NORMALIZE DIAGONAL MOVEMENT
    const velocity = new Phaser.Math.Vector2(velocityX, velocityY);

    velocity.normalize();

    this.player.setVelocity(velocity.x * speed, velocity.y * speed);

    // PLAYER DEPTH
    this.player.setDepth(this.player.y);

    // PLAYER NAME
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
