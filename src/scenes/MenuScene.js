export class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const centerX = width / 2;

        // Background
        const bg = this.add.image(centerX, height / 2, 'start_background');
        // Fit background to screen
        const scaleX = width / bg.width;
        const scaleY = height / bg.height;
        bg.setScale(Math.max(scaleX, scaleY));

        // Title FX (Rotating Light)
        const fxLight = this.add.image(centerX, height * 0.25, 'light_reward').setScale(1.3);
        this.tweens.add({
            targets: fxLight,
            rotation: Math.PI * 2,
            duration: 8000,
            repeat: -1,
            ease: 'Linear'
        });

        // Title Image
        const titleImg = this.add.image(centerX, height * 0.25, 'start_name')
            .setInteractive({ useHandCursor: true });

        // Hover/Floating animation for Title
        this.tweens.add({
            targets: titleImg,
            y: titleImg.y - 15, // float up
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        const titleBaseScale = titleImg.scale;

        titleImg.on('pointerover', () => {
            this.tweens.add({
                targets: titleImg,
                scaleX: titleBaseScale * 1.05,
                scaleY: titleBaseScale * 1.05,
                duration: 100,
                ease: 'Power1'
            });
        });

        titleImg.on('pointerout', () => {
            this.tweens.add({
                targets: titleImg,
                scaleX: titleBaseScale,
                scaleY: titleBaseScale,
                duration: 100,
                ease: 'Power1'
            });
        });

        const btnPlay = this.add.image(centerX, height * 0.7, 'btn_play')
            .setInteractive({ useHandCursor: true });
        this.setupButton(btnPlay, width, () => {
            this.scene.start('TutorialScene');
        });

        // Exit Button
        const btnExit = this.add.image(centerX, height * 0.85, 'btn_exit')
            .setInteractive({ useHandCursor: true });
        this.setupButton(btnExit, width, () => {
            console.log("Exit clicked");
        });

    }

    setupButton(btn, screenWidth, onClick) {
        // Target button width ~45% of screen
        const targetBtnWidth = screenWidth * 0.45;
        const btnScale = targetBtnWidth / btn.width;
        btn.setScale(btnScale);

        // Button interactions (Smooth, slight animations)
        btn.on('pointerover', () => {
            this.tweens.add({
                targets: btn,
                scaleX: btnScale * 1.05, // Slightly bigger
                scaleY: btnScale * 1.05,
                duration: 100,           // 100ms makes it quick but smooth
                ease: 'Power1'
            });
        });

        btn.on('pointerout', () => {
            this.tweens.add({
                targets: btn,
                scaleX: btnScale,        // Back to normal size
                scaleY: btnScale,
                duration: 100,
                ease: 'Power1'
            });
        });

        btn.on('pointerdown', () => {
            btn.setAlpha(0.8);
        });

        btn.on('pointerup', () => {
            btn.setAlpha(1);
            onClick();
        });
    }
}
