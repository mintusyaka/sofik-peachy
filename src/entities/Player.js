export class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'p_idle_0');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setCollideWorldBounds(true);
        // Collision Circle based on dynamic width
        const radius = Math.max(20, Math.min(this.width, this.height) * 0.45);
        this.body.setCircle(radius, (this.width / 2) - radius, (this.height / 2) - radius); 
        this.setOrigin(0.5);

        this.setScale(0.7);

        // Movement Settings
        this.maxSpeed = 8 * 60; // ~480 px/sec
        this.carryingSpeed = this.maxSpeed; // 100% of max speed
        this.accelerationValue = 1.5 * 3600; // per sec squared
        
        this.setDrag(0.85 * 60 * 10); // Approximation for friction
        this.setMaxVelocity(this.maxSpeed);

        this.hasItem = false;
        this.play('player_idle');
        
        this.carryOffsetY = -20; // resting height for backpack effect
        
        // Visual indicator of carrying item
        this.carriedItemSprite = scene.add.sprite(0, this.carryOffsetY, 'element_1'); // default, will update dynamically
        this.carriedItemSprite.setVisible(false);
        this.carriedItemSprite.setDepth(20); // Front layer highly visible
        
        this.setDepth(10); // Base player depth
    }

    pickUpItem(texture) {
        if (!this.hasItem) {
            this.hasItem = true;
            this.carriedItemSprite.setTexture(texture);
            this.carriedItemSprite.setVisible(true);

            // Clean up any old tweens when doing instant interactions
            this.scene.tweens.killTweensOf(this.carriedItemSprite);
            if (this.carryTweenY) this.carryTweenY.stop();
            
            // Pop-in animation setup
            this.carryOffsetY = 0; 
            this.carriedItemSprite.setScale(0); 

            // Scale up with bounce
            this.scene.tweens.add({
                targets: this.carriedItemSprite,
                scale: 1,
                duration: 400,
                ease: 'Back.easeOut'
            });

            // Fly up to resting position with bounce
            this.carryTweenY = this.scene.tweens.add({
                targets: this,
                carryOffsetY: -20,
                duration: 400,
                ease: 'Back.easeOut'
            });

            this.setMaxVelocity(this.carryingSpeed);
        }
    }

    dropOffItem() {
        if (this.hasItem) {
            this.hasItem = false;

            this.scene.tweens.killTweensOf(this.carriedItemSprite);
            if (this.carryTweenY) this.carryTweenY.stop();
            
            // Shrink out
            this.scene.tweens.add({
                targets: this.carriedItemSprite,
                scale: 0,
                duration: 200,
                ease: 'Back.easeIn',
                onComplete: () => {
                    // Make sure we haven't picked up another item before setting to false
                    if (!this.hasItem) {
                        this.carriedItemSprite.setVisible(false);
                    }
                }
            });

            // Suck into center
            this.carryTweenY = this.scene.tweens.add({
                targets: this,
                carryOffsetY: 0,
                duration: 200,
                ease: 'Back.easeIn'
            });

            this.setMaxVelocity(this.maxSpeed);
            return true;
        }
        return false;
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        
        // Classic 2.5D Depth Sorting
        this.setDepth(this.y);
        
        if (this.carriedItemSprite.visible) {
            this.carriedItemSprite.setPosition(this.x, this.y + this.carryOffsetY);
            this.carriedItemSprite.setDepth(this.y + 1); // tightly over player
        }

        // Create footprints if moving
        if (this.body.velocity.lengthSq() > 100) {
            this.stepTimer = (this.stepTimer || 0) - delta;
            if (this.stepTimer <= 0) {
                this.stepTimer = 150; // Every 150ms
                this.createFootprint();
            }
        }
    }

    createFootprint() {
        this.footToggle = !this.footToggle;
        
        const velX = this.body.velocity.x;
        const velY = this.body.velocity.y;
        const length = Math.sqrt(velX*velX + velY*velY);
        
        let nx = 0; let ny = 1;
        if (length > 0) {
            nx = velX / length;
            ny = velY / length;
        }

        // Perpendicular vector for foot offset spacing
        const px = -ny;
        const py = nx;
        
        const offsetDist = 12; // spread between left/right foot
        const offsetX = px * offsetDist * (this.footToggle ? 1 : -1);
        const offsetY = py * offsetDist * (this.footToggle ? 1 : -1);

        // Position at feet
        const startX = this.x + offsetX;
        const startY = this.y + 35 + offsetY; 

        // Create larger dark ellipse
        const footprint = this.scene.add.ellipse(startX, startY, 24, 16, 0x000000, 0.4);
        footprint.setRotation(Math.atan2(ny, nx));
        footprint.setDepth(1); 

        // Fade slowly over 5 seconds
        this.scene.tweens.add({
            targets: footprint,
            alpha: 0,
            duration: 5000,
            ease: 'Linear',
            onComplete: () => {
                footprint.destroy();
            }
        });
    }

    move(dirX, dirY) {
        if (dirX === 0 && dirY === 0) {
            this.setAcceleration(0, 0);
            if (this.anims.currentAnim?.key !== 'player_idle') {
                this.play('player_idle');
            }
            return;
        }
        
        // Stop idle animation
        if (this.anims.isPlaying && this.anims.currentAnim?.key === 'player_idle') {
            this.stop();
        }

        // Texture logic based on direction
        const movingDown = dirY > 0;
        const movingUp = dirY < 0;
        const movingSide = dirX !== 0;

        if (movingDown && movingSide) {
            this.setTexture('p_down_side');
            this.setFlipX(dirX < 0);
        } else if (movingDown) {
            this.setTexture('p_down');
            this.setFlipX(false);
        } else if (movingUp) {
            this.setTexture('p_up');
            this.setFlipX(dirX < 0); 
        } else if (movingSide) {
            this.setTexture('p_side');
            this.setFlipX(dirX < 0);
        }

        // Normalize direction
        const length = Math.sqrt(dirX*dirX + dirY*dirY);
        const nx = dirX / length;
        const ny = dirY / length;

        this.setAcceleration(nx * this.accelerationValue, ny * this.accelerationValue);
    }
}
