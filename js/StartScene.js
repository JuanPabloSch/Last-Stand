class StartScene extends Phaser.Scene {
    constructor() {
        super({ key: 'StartScene' });
    }

    preload() {
        this.load.image('start_bg', 'assets/background/start.png');
    }

    create() {
        this.add.image(400, 300, 'start_bg').setDisplaySize(800, 600);

        this.input.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });
    }
}