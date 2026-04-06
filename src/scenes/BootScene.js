export class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // Load joystick plugin
        this.load.plugin('rexvirtualjoystickplugin', 'https://cdn.jsdelivr.net/npm/phaser3-rex-plugins@1.1.39/dist/rexvirtualjoystickplugin.min.js', true);
        
        // Load Audio
        this.load.audio('sfx_button', 'assets/audio/button.mp3');
        this.load.audio('sfx_collect', 'assets/audio/collect_good.mp3');
        this.load.audio('sfx_lose', 'assets/audio/lose.mp3');
        this.load.audio('music_main', 'assets/audio/main.mp3');
        this.load.audio('sfx_victory', 'assets/audio/victory.mp3');
        this.load.audio('sfx_timer', 'assets/audio/timer.mp3');

        // Load Menu Assets
        this.load.image('start_background', 'assets/start-menu/start_background.webp');
        this.load.image('start_name', 'assets/start-menu/start_name.png');
        this.load.image('light_reward', 'assets/fx/light_REWARD.webp');
        this.load.image('btn_play', 'assets/btn/ui_b_play.png');
        this.load.image('btn_exit', 'assets/btn/ui_b_exit.png');
        this.load.image('how_to_play', 'assets/start-menu/HOWtoPLAY.webp');

        // Load Gameplay Assets
        this.load.image('platform', 'assets/gameplay/platform.png');
        this.load.image('friend_1', 'assets/gameplay/friend_1.png');
        this.load.image('friend_2', 'assets/gameplay/friend_2.png');
        this.load.image('friend_3', 'assets/gameplay/friend_3.png');
        this.load.image('ui_top', 'assets/gameplay/UI_top.png');
        this.load.image('ui_progress', 'assets/gameplay/ui_progress.png');
        this.load.image('ui_progressbar', 'assets/gameplay/ui_progressbar.png');
        this.load.image('vfx_heart', 'assets/fx/vfx_heard.png');
        this.load.image('ui_icon_timer', 'assets/gameplay/ui_icon_timer.png');
        this.load.image('ui_icon_element', 'assets/gameplay/ui_icon_element.png');
        this.load.image('element_1', 'assets/gameplay/element_1.png');
        this.load.image('element_0.5', 'assets/gameplay/element_0.5.png');
        this.load.image('element_timer', 'assets/gameplay/element_timer.png');
        this.load.image('bg_game', 'assets/gameplay/Background.webp');
        this.load.image('p_idle_0', 'assets/gameplay/0_idle.png');
        this.load.image('p_idle_1', 'assets/gameplay/1_idle.png');
        this.load.image('p_down', 'assets/gameplay/6.png');
        this.load.image('p_down_side', 'assets/gameplay/2.png');
        this.load.image('p_side', 'assets/gameplay/4.png');
        this.load.image('p_up', 'assets/gameplay/5.png');
    }

    create() {
        // Generate placeholder graphics

        // 1. Player (Circle 30px radius, white with a small outline or distinctive 'head')
        const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        playerGraphics.fillStyle(0xffffff, 1.0);
        playerGraphics.lineStyle(4, 0x000000);
        playerGraphics.strokeCircle(30, 30, 28);
        playerGraphics.fillCircle(30, 30, 28);
        // Face indication
        playerGraphics.fillStyle(0x000000, 1.0);
        playerGraphics.fillCircle(40, 30, 5);
        playerGraphics.generateTexture('player', 60, 60);

        // 2. NPC (Circle 35px radius, blue)
        const npcGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        npcGraphics.fillStyle(0x4287f5, 1.0);
        npcGraphics.lineStyle(4, 0x000000);
        npcGraphics.strokeCircle(35, 35, 33);
        npcGraphics.fillCircle(35, 35, 33);
        npcGraphics.generateTexture('npc', 70, 70);

        // 3. Item (Circle 20px radius, yellow/gold)
        const itemGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        itemGraphics.fillStyle(0xffd700, 1.0);
        itemGraphics.lineStyle(3, 0xff8c00);
        itemGraphics.strokeCircle(20, 20, 18);
        itemGraphics.fillCircle(20, 20, 18);
        itemGraphics.generateTexture('item', 40, 40);

        // 4. Bonus Item (Star or just pink circle)
        const bonusGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        bonusGraphics.fillStyle(0xff1493, 1.0); // deep pink
        bonusGraphics.lineStyle(3, 0xffffff);
        bonusGraphics.strokeCircle(20, 20, 18);
        bonusGraphics.fillCircle(20, 20, 18);
        // Put a "+" in the middle
        bonusGraphics.fillStyle(0xffffff, 1.0);
        bonusGraphics.fillRect(17, 10, 6, 20);
        bonusGraphics.fillRect(10, 17, 20, 6);
        bonusGraphics.generateTexture('bonus', 40, 40);

        // 5. Grass Tile (just a green square with some noise)
        const grassGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        grassGraphics.fillStyle(0x3b821c, 1.0);
        grassGraphics.fillRect(0, 0, 128, 128);
        grassGraphics.fillStyle(0x2d6b13, 1.0);
        for(let i=0; i<10; i++){
            grassGraphics.fillRect(Math.random()*120, Math.random()*120, 8, 8);
        }
        grassGraphics.generateTexture('grass', 128, 128);

        this.anims.create({
            key: 'player_idle',
            frames: [
                { key: 'p_idle_0' },
                { key: 'p_idle_1', duration: 500 }
            ],
            frameRate: 2,
            repeat: -1
        });

        // Go to menu
        this.scene.start('MenuScene');
    }
}
