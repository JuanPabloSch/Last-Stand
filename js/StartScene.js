class StartScene extends Phaser.Scene {
    constructor() {
        super({ key: 'StartScene' });
    }

    preload() {
        this.load.image('start_bg', 'assets/background/start.png');
    }

    create() {

        this.add.image(400, 300, 'start_bg').setDisplaySize(800, 600);

        // 🔄 RESET SOLO AL INICIAR EL JUEGO
        localStorage.removeItem('lvl1');
        localStorage.removeItem('lvl2');
        localStorage.removeItem('lvl3');

        console.log("Progreso reseteado al iniciar");

        this.input.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });
    }
}