import { Player } from '../entities/Player.js';
import { NPC } from '../entities/NPC.js';
import { Item, BonusItem } from '../entities/Item.js';

export class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    create() {
        // Setup background
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const bg = this.add.image(width / 2, height / 2, 'bg_game');
        bg.setDisplaySize(width, height);

        // Game State
        this.score = 0;
        this.timeLimit = 10000; // 10 seconds
        this.timeRemaining = this.timeLimit;
        this.isGameOver = false;

        // UI Container
        this.uiContainer = this.add.container(0, 0);
        this.uiContainer.setDepth(10000);

        // Add graphical UI Assets shifted higher to match mockups
        this.uiTop = this.add.image(width / 2, 90, 'ui_top');
        this.uiProgressBg = this.add.image(width / 2, 115, 'ui_progressbar');
        this.timeBarFill = this.add.image(width / 2, 115, 'ui_progress');

        // Lock origin to left for accurate cropping and position it over the background
        this.timeBarFill.setOrigin(0, 0.5);
        this.timeBarFill.setPosition(this.uiProgressBg.x - this.timeBarFill.width / 2, 115);
        this.timeBarFill.setCrop(0, 0, this.timeBarFill.width, this.timeBarFill.height);

        // Icon placement relative to progress bar strictly
        this.uiIconTimer = this.add.image(this.timeBarFill.x - 20, 115, 'ui_icon_timer').setScale(0.9);

        // Score placement with inline element icon
        this.uiIconElement = this.add.image(width / 2 - 230, 40, 'ui_icon_element').setScale(0.85);
        this.scoreText = this.add.text(width / 2 - 20, 40, '0 / 100', {
            fontSize: '44px', color: '#53230a', fontStyle: 'bold', stroke: '#ffcc99', strokeThickness: 4, fontFamily: 'sans-serif'
        }).setOrigin(0.5);

        this.statusText = this.add.text(width / 2, height / 2, '', {
            fontSize: '48px', color: '#ff0000', stroke: '#000', strokeThickness: 6, align: 'center'
        }).setOrigin(0.5);
        this.statusText.setVisible(false);

        this.uiContainer.add([this.uiTop, this.uiProgressBg, this.timeBarFill, this.uiIconTimer, this.uiIconElement, this.scoreText, this.statusText]);

        // Input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,S,A,D');

        this.setupVirtualJoystick();

        // Object Groups
        this.itemsGroup = this.add.group({ runChildUpdate: true });
        this.npcsGroup = this.add.group({ runChildUpdate: true });

        // Spawn Player
        this.player = new Player(this, width / 2, height / 2);

        // Spawn NPCs closer to the center of the screen
        const npcX1 = width * 0.15;
        const npcX2 = width * 0.85;
        const npcY1 = height * 0.15;
        const npcY2 = height * 0.85;

        this.npcsGroup.add(new NPC(this, npcX1, npcY1)); // TL
        this.npcsGroup.add(new NPC(this, npcX2, npcY1)); // TR
        this.npcsGroup.add(new NPC(this, npcX1, npcY2)); // BL
        this.npcsGroup.add(new NPC(this, npcX2, npcY2)); // BR

        // Initial items (allow many items to fill map like mockup)
        for (let i = 0; i < 6; i++) {
            this.spawnItem();
        }

        // Periodically spawn bonus items (timers) every 6 seconds
        this.time.addEvent({
            delay: 6000,
            callback: this.spawnBonusItem,
            callbackScope: this,
            loop: true
        });

        // Setup overlapping functionality
        this.physics.add.overlap(this.player, this.itemsGroup, this.handlePlayerItemCollision, null, this);
        this.physics.add.overlap(this.player, this.npcsGroup, this.handlePlayerNPCCollision, null, this);
    }

    setupVirtualJoystick() {
        // Detect mobile roughly
        const isMobile = this.cameras.main.width < 800 || this.sys.game.device.os.android || this.sys.game.device.os.iOS;
        if (isMobile) {
            this.joyStick = this.plugins.get('rexvirtualjoystickplugin').add(this, {
                x: 100,
                y: this.cameras.main.height - 100,
                radius: 60,
                base: this.add.circle(0, 0, 60, 0x888888, 0.5).setDepth(10000),
                thumb: this.add.circle(0, 0, 25, 0xcccccc, 0.8).setDepth(10000),
                forceMin: 10,
            });
        }
    }

    spawnItem() {
        if (this.isGameOver) return;

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Restrict spawn zone significantly tightly center
        const minX = width * 0.2;
        const maxX = width * 0.8;
        const minY = height * 0.2;
        const maxY = height * 0.8;

        const x = Phaser.Math.Between(minX, maxX);
        const y = Phaser.Math.Between(minY, maxY);

        const item = new Item(this, x, y);
        this.itemsGroup.add(item);
    }

    spawnBonusItem() {
        if (this.isGameOver) return;

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Restrict spawn zone significantly tightly center
        const minX = width * 0.2;
        const maxX = width * 0.8;
        const minY = height * 0.2;
        const maxY = height * 0.8;

        const x = Phaser.Math.Between(minX, maxX);
        const y = Phaser.Math.Between(minY, maxY);

        const bonus = new BonusItem(this, x, y);
        this.itemsGroup.add(bonus);
    }

    handlePlayerItemCollision(player, item) {
        if (this.isGameOver) return;

        if (item.isBonus) {
            // Disable physics so it can't be repeatedly triggered
            item.body.enable = false;

            // Tween the item to the UI Timer Icon
            this.tweens.add({
                targets: item,
                x: this.uiIconTimer.x,
                y: this.uiIconTimer.y,
                scale: 0.3,
                duration: 500,
                ease: 'Cubic.easeIn',
                onComplete: () => {
                    item.destroy();

                    // Actually add time directly once the tween lands
                    this.timeRemaining += 3000;
                    if (this.timeRemaining > this.timeLimit) {
                        this.timeRemaining = this.timeLimit;
                    }

                    // Quick visual bounce on the timer icon
                    this.tweens.add({
                        targets: this.uiIconTimer,
                        scale: 1.3,
                        duration: 100,
                        yoyo: true
                    });
                }
            });

            // Respawn bonus item soon
            this.time.delayedCall(3000, () => this.spawnBonusItem(), [], this);
        } else {
            // Pick up regular item
            if (!player.hasItem) {
                player.pickUpItem(item.texture.key);
                player.carriedItemScore = item.scoreValue; // Note the score value for delivery
                item.destroy();
                // Dynamic delay: respawn gets much slower as you get closer to 100 score (end game)
                const delay = 3000 + (this.score * 50); // Decreased spawn rate
                this.time.delayedCall(delay, () => {
                    this.spawnItem();
                });
            }
        }
    }

    handlePlayerNPCCollision(player, npc) {
        if (this.isGameOver) return;

        if (player.hasItem && npc.needsItem) {
            // Generous interaction radius mapping to visual body boundaries
            const dist = Phaser.Math.Distance.Between(player.x, player.y, npc.x, npc.y);
            const interactDist = player.body.radius + npc.body.radius + 60; // 60px extra padding
            if (dist <= interactDist) {
                if (npc.receiveItem()) {
                    player.dropOffItem();
                    this.score += player.carriedItemScore || 0; // use item's value
                    player.carriedItemScore = 0;
                    this.scoreText.setText(`${this.score} / 100`); // Updated format to fit UI neatly

                    if (this.score >= 100) {
                        this.endGame(true);
                    } else if (this.score === 40) {
                        // Spawn a bonus item when they are halfway or something
                        this.spawnBonusItem();
                    }
                }
            }
        }
    }

    update(time, delta) {
        if (this.isGameOver) {
            this.player.setVelocity(0, 0); // Lock movement explicitly each frame
            return;
        }

        // --- Time handling ---
        this.timeRemaining -= delta;
        if (this.timeRemaining <= 0) {
            this.timeRemaining = 0;
            this.endGame(false);
        }

        // Update Time Bar with Crop
        const timeRatio = this.timeRemaining / this.timeLimit;
        if (this.timeBarFill && this.timeBarFill.width > 0) {
            this.timeBarFill.setCrop(0, 0, this.timeBarFill.width * timeRatio, this.timeBarFill.height);
            if (timeRatio < 0.3) {
                this.timeBarFill.setTint(0xff0000); // Danger tint
            } else {
                this.timeBarFill.clearTint();
            }
        }

        // --- Input handling ---
        let dirX = 0;
        let dirY = 0;

        if (this.cursors.left.isDown || this.wasd.A.isDown) dirX = -1;
        else if (this.cursors.right.isDown || this.wasd.D.isDown) dirX = 1;

        if (this.cursors.up.isDown || this.wasd.W.isDown) dirY = -1;
        else if (this.cursors.down.isDown || this.wasd.S.isDown) dirY = 1;

        // Joystick overrides
        if (this.joyStick && this.joyStick.force > 0) {
            const angle = this.joyStick.angle * Math.PI / 180;
            dirX = Math.cos(angle);
            dirY = Math.sin(angle);
        }

        this.player.move(dirX, dirY);
    }

    endGame(win) {
        this.isGameOver = true;
        this.player.move(0, 0);
        this.player.setVelocity(0, 0);

        this.statusText.setVisible(true);

        if (win) {
            this.statusText.setText('Вітаємо!\nВи розблокували значок\n"Сила Добра!"');
            this.statusText.setColor('#00ff00');
        } else {
            this.statusText.setText('GAME OVER');
            this.statusText.setColor('#ff0000');
        }

        // Auto return to menu after 5 seconds
        this.time.delayedCall(5000, () => {
            this.scene.start('MenuScene');
        });
    }
}
