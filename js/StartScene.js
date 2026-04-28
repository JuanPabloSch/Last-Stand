class StartScene extends Phaser.Scene {
    constructor() {
        super({ key: 'StartScene' });
    }

    preload() {
        this.load.image('start_bg', 'assets/background/start.png');

        // 🎵 música intro (agregá tu archivo)
        this.load.audio('startMusic', 'assets/music/start.mp3');
    }

    create() {

        this.add.image(400, 300, 'start_bg').setDisplaySize(800, 600);

        // 🔄 reset progreso solo al iniciar juego
        localStorage.removeItem('lvl1');
        localStorage.removeItem('lvl2');
        localStorage.removeItem('lvl3');

        // 🎵 música
        this.music = this.sound.add('startMusic', {
            loop: true,
            volume: 0.5
        });

        this.music.play();

        // 🟡 texto "click to start"
        const text = this.add.text(400, 500, "CLICK TO START", {
            fontSize: '32px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        // ✨ animación simple (parpadeo)
        this.tweens.add({
            targets: text,
            alpha: 0.2,
            duration: 800,
            yoyo: true,
            repeat: -1
        });

        // ▶ entrar al menú
        this.input.once('pointerdown', () => {

            this.music.stop();

            this.scene.start('MenuScene');
        });
    }
}