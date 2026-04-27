class GameScene3 extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene3' });
    }

    preload() {

        // 🌾 fondo campo
        this.load.image('lvl4_bg', 'assets/background/lvl4.png');

        // 👽 nave boss
        this.load.image('bossShip', 'assets/enemies/lvl4/mothership1.png');

        // 🎯 mira
        this.load.image('crosshair', 'assets/ui/crosshair.png');

        // 🔫 sonidos base
        this.load.audio('shoot', 'assets/sfx/shoot.mp3');
        this.load.audio('reload', 'assets/sfx/gunreload.mp3');

        // 🎵 música final
        this.load.audio('lvl4_music', 'assets/music/lvl4.mp3');

        // ⚡ tormenta
        this.load.audio('thunder1', 'assets/sfx/lvl3/thunder1.mp3');
        this.load.audio('thunder2', 'assets/sfx/lvl3/thunder2.mp3');
    }

    create() {

        console.log("scene create ok");

        // limpiar sonidos anteriores
        this.sound.stopAll();

        // estado base
        this.isGameOver = false;

        // fondo
        this.add.image(400, 300, 'lvl4_bg').setDisplaySize(800, 600);

        // =====================
        // 🌧 LLUVIA
        // =====================
          const g = this.add.graphics();

        g.fillStyle(0xffffff);
        g.fillRect(0, 0, 4, 28);
        g.generateTexture('rain', 4, 28);
        g.destroy();

        this.rain = this.add.particles(0, 0, 'rain', {
            x: { min: 0, max: 800 },
            y: { min: -100, max: 0 },

            lifespan: 600,

            speedY: { min: 1200, max: 1600 },
            speedX: { min: -200, max: -120 },

            quantity: 7,
            frequency: 15,

            alpha: { start: 1, end: 0.5 }
        });

        this.rain.setDepth(50);

        // =====================
        // 🎵 música
        // =====================
        this.music = this.sound.add('lvl4_music', {
            loop: true,
            volume: 0.55
        });

        this.music.play();

        // =====================
        // ⚡ sonidos tormenta
        // =====================
        this.thunders = [
            this.sound.add('thunder1', { volume: 0.35 }),
            this.sound.add('thunder2', { volume: 0.35 })
        ];

        this.startStorm();

        // =====================
        // 👽 NAVE ENTRANDO
        // =====================

        console.log("creating boss");
        this.boss = this.add.image(400, -250, 'bossShip')
            .setScale(0.75)
            .setDepth(20);

        this.tweens.add({
            targets: this.boss,
            y: 170,
            duration: 3000,
            ease: 'Sine.easeOut'
        });

        // flotación leve
        this.time.delayedCall(3200, () => {

            this.tweens.add({
                targets: this.boss,
                y: '+=12',
                duration: 1400,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

        });

        // =====================
        // 🎯 mira
        // =====================
        this.input.setDefaultCursor('none');
        this.game.canvas.style.cursor = 'none';

        this.crosshair = this.add.image(400, 300, 'crosshair')
            .setScale(0.08)
            .setDepth(1000);

        // =====================
        // 📝 intro texto
        // =====================
        const warning = this.add.text(170, 260, 'MOTHERSHIP DETECTED', {
            fontSize: '34px',
            fill: '#ff2222',
            backgroundColor: '#000000aa',
            padding: { x: 15, y: 8 }
        }).setDepth(1000);

        this.time.delayedCall(2500, () => warning.destroy());
    }

    update() {

    if (!this.crosshair) return;

    this.crosshair.x = this.input.x;
    this.crosshair.y = this.input.y;
}

    // =====================
    // ⚡ tormenta dinámica
    // =====================
    startStorm() {

        const lightning = () => {

            if (this.isGameOver) return;

            this.cameras.main.flash(
                100,
                255,
                255,
                255,
                false
            );

            this.time.delayedCall(
                Phaser.Math.Between(250, 700),
                () => {
                    Phaser.Math.RND.pick(this.thunders).play();
                }
            );

            this.time.delayedCall(
                Phaser.Math.Between(4000, 9000),
                lightning
            );
        };

        lightning();
    }
}