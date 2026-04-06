export class TutorialScene extends Phaser.Scene {
    constructor() {
        super('TutorialScene');
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const centerX = width / 2;

        // Full Background
        const bg = this.add.image(centerX, height / 2, 'start_background');
        const scaleX = width / bg.width;
        const scaleY = height / bg.height;
        bg.setScale(Math.max(scaleX, scaleY));

        // Rotating FX Light positioned exactly behind HOWtoPLAY image
        const fxLight = this.add.image(centerX, height * 0.45, 'light_reward').setScale(1.5);
        this.tweens.add({
            targets: fxLight,
            rotation: Math.PI * 2,
            duration: 8000,
            repeat: -1,
            ease: 'Linear'
        });

        // How to play image
        const howToImg = this.add.image(centerX, height * 0.45, 'how_to_play');
        const hScale = Math.min(width * 0.9 / howToImg.width, height * 0.55 / howToImg.height);
        howToImg.setScale(hScale);

        // Buttons
        const overlayPlayBtn = this.add.image(centerX, height * 0.78, 'btn_play')
            .setInteractive({ useHandCursor: true });
        this.setupButton(overlayPlayBtn, width, () => {
            this.cameras.main.fadeOut(300, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('GameScene');
            });
        });

        const overlayExitBtn = this.add.image(centerX, height * 0.9, 'btn_exit')
            .setInteractive({ useHandCursor: true });
        this.setupButton(overlayExitBtn, width * 0.7, () => { 
            this.scene.start('MenuScene');
        });
    }

    setupButton(btn, screenWidth, onClick) {
        const targetBtnWidth = screenWidth * 0.45;
        const btnScale = targetBtnWidth / btn.width;
        btn.setScale(btnScale);

        btn.on('pointerover', () => {
            this.tweens.add({
                targets: btn,
                scaleX: btnScale * 1.05,
                scaleY: btnScale * 1.05,
                duration: 100,
                ease: 'Power1'
            });
        });

        btn.on('pointerout', () => {
            this.tweens.add({
                targets: btn,
                scaleX: btnScale,
                scaleY: btnScale,
                duration: 100,
                ease: 'Power1'
            });
        });

        btn.on('pointerdown', () => {
            btn.setAlpha(0.8);
            this.sound.play('sfx_button');
        });

        btn.on('pointerup', () => {
            btn.setAlpha(1);
            onClick();
        });
    }
}
