export class NPC extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        const texture = Math.random() > 0.5 ? 'friend_1' : 'friend_2';
        super(scene, x + 5, y - 50, texture); // Shift NPC down by 10 pixels visually
        this.baseTextureKey = texture;

        const scale = 0.85; // slightly smaller
        this.setScale(scale);

        // Move platform down further to increase relative height difference
        this.platformImg = scene.add.image(x, y + 80, 'platform');
        this.platformImg.setScale(scale);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setImmovable(true);
        const radius = Math.max(25, Math.min(this.width, this.height) * 0.45);
        this.body.setCircle(radius, (this.width / 2) - radius, (this.height / 2) - radius);
        this.setOrigin(0.5);

        this.state = 'idle'; // idle, satisfied
        this.needsItem = true;

        // (Static heartIcon removed in favor of dynamic hearts in satisfied state)
        // Depth dynamic assigned on update
        
        this.cooldownTimeTotal = 4000;
        this.cooldownRemaining = 0;
    }

    receiveItem() {
        if (!this.needsItem) return false;

        this.state = 'satisfied';
        this.needsItem = false;
        this.setTexture('friend_3'); // Swap to satisfied texture
        
        // Emit a fountain of floating glowing hearts!
        for (let i = 0; i < 6; i++) {
            this.scene.time.delayedCall(i * 200, () => {
                const offsetX = Phaser.Math.Between(-40, 40);
                const offsetY = Phaser.Math.Between(-30, 30);
                const heart = this.scene.add.sprite(this.x + offsetX, this.y - 50 + offsetY, 'vfx_heart')
                    .setOrigin(0.5).setScale(0.1).setDepth(10000); // Massive depth to pop

                this.scene.tweens.add({
                    targets: heart,
                    scale: 1.2,
                    y: heart.y - 120, // Float high wildly
                    alpha: { from: 1, to: 0 },
                    duration: 1800,
                    ease: 'Sine.easeOut',
                    onComplete: () => heart.destroy()
                });
            });
        }

        this.cooldownRemaining = this.cooldownTimeTotal;

        this.scene.time.addEvent({
            delay: this.cooldownTimeTotal,
            callback: this.resetState,
            callbackScope: this
        });

        return true;
    }

    resetState() {
        this.state = 'idle';
        this.needsItem = true;
        this.setTexture(this.baseTextureKey); // Revert to base texture
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        
        // Dynamically perform 2.5D depth sort based on screen Y
        this.setDepth(this.y);
        
        if (this.platformImg) {
            this.platformImg.setDepth(this.y - 1);
        }

        if (this.state === 'satisfied') {
            this.cooldownRemaining -= delta;
            if (this.cooldownRemaining < 0) this.cooldownRemaining = 0;

            // Continuously spawn hearts flying around
            if (Math.random() < 0.08) {
                const angle = Math.random() * Math.PI * 2;
                const distance = Phaser.Math.Between(30, 60);
                const startX = this.x + Math.cos(angle) * distance;
                const startY = this.y - 40 + Math.sin(angle) * distance;
                
                const heart = this.scene.add.sprite(startX, startY, 'vfx_heart')
                    .setOrigin(0.5).setScale(0.2).setDepth(10000);

                // Float upwards and slightly outwards
                this.scene.tweens.add({
                    targets: heart,
                    y: startY - Phaser.Math.Between(40, 80),
                    x: startX + Math.cos(angle) * 20,
                    alpha: { from: 1, to: 0 },
                    scale: 0.5,
                    duration: Phaser.Math.Between(1000, 1500),
                    ease: 'Sine.easeInOut',
                    onComplete: () => heart.destroy()
                });
            }
        }
    }
}
