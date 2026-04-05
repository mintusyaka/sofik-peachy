export class Item extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        // randomly choose 1 or 0.5
        const isTen = Math.random() > 0.5;
        const texture = isTen ? 'element_1' : 'element_0.5';
        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        const radius = Math.max(25, Math.min(this.width, this.height) * 0.5); // more generous picking up hitboxes
        this.body.setCircle(radius, (this.width / 2) - radius, (this.height / 2) - radius); 
        this.setOrigin(0.5);
        this.isBonus = false;
        this.scoreValue = isTen ? 10 : 5;
        
        // Gentle hover animation
        scene.tweens.add({
            targets: this,
            y: y - 5,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
}

export class BonusItem extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'element_timer');
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        const radius = Math.max(25, Math.min(this.width, this.height) * 0.5);
        this.body.setCircle(radius, (this.width / 2) - radius, (this.height / 2) - radius);
        this.setOrigin(0.5);
        this.isBonus = true;

        // Gentle pulsing hover instead of wild rotation
        scene.tweens.add({
            targets: this,
            scale: 1.1,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
}
