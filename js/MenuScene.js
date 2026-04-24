class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    preload() {
        this.load.image('menu_bg', 'assets/background/menu.png');
    }

    create() {
        this.add.image(400, 300, 'menu_bg').setDisplaySize(800, 600);

        const playButton = this.add.text(400, 300, 'JUGAR', {
            fontSize: '32px',
            fill: '#fff',
            backgroundColor: '#000'
        })
        .setOrigin(0.5)
        .setInteractive();

        playButton.on('pointerdown', () => {
            this.scene.start('GameScene');
        });
    }
}