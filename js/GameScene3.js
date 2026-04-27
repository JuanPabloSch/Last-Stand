class GameScene3 extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene3' });
    }

    preload() {

        // 🌾 fondo campo
        this.load.image('lvl4_bg', 'assets/background/lvl4.png');

        // 👽 nave boss
        this.load.image('bossShip1', 'assets/enemies/lvl4/mothership1.png');
        this.load.image('bossShip2', 'assets/enemies/lvl4/mothership2.png');
        this.load.image('bossShip3', 'assets/enemies/lvl4/mothership3.png');

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
        this.boss = this.add.image(400, -250, 'bossShip1')
            .setScale(0.75)
            .setDepth(20);

        this.bossHealth = 100;
        this.maxBossHealth = 100;

        this.tweens.add({
            targets: this.boss,
            y: 170,
            duration: 3000,
            ease: 'Sine.easeOut'
        });

        this.bossBarBg = this.add.rectangle(
            400, 580, 320, 24, 0x000000
        ).setDepth(2000);

        this.bossBar = this.add.rectangle(
            400, 580, 320, 18, 0xff0000
        ).setDepth(2001);

        this.add.text(330,550,"MOTHERSHIP",{
            fontSize:'20px',
            fill:'#ffffff'
        }).setDepth(2000);

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

        // stats jugador
        this.maxAmmo = 10;
        this.ammo = 10;
        this.isReloading = false;

        this.maxLife = 5;
        this.life = 5;

        this.score = 0;

        // ui
        this.ammoText = this.add.text(20, 20, '', {
            fontSize: '22px',
            fill: '#ffffff',
            backgroundColor: '#000000aa',
            padding: { x: 10, y: 5 }
        }).setDepth(1000);

        this.lifeText = this.add.text(600, 20, '', {
            fontSize: '22px',
            fill: '#ff4444',
            backgroundColor: '#000000aa',
            padding: { x: 10, y: 5 }
        }).setDepth(1000);

        this.scoreText = this.add.text(320, 20, '', {
            fontSize: '22px',
            fill: '#ffffff',
            backgroundColor: '#000000aa',
            padding: { x: 10, y: 5 }
        }).setDepth(1000);

        this.updateAmmoUI();
        this.updateLifeUI();
        this.updateScoreUI();

        //MOUSE
        this.input.mouse.disableContextMenu();

        this.isLeftDown = false;
        this.isRightDown = false;

        this.input.on('pointerdown', (p) => {
            if (p.leftButtonDown()) this.isLeftDown = true;
            if (p.rightButtonDown()) this.isRightDown = true;
        });

        this.input.on('pointerup', (p) => {
            if (!p.leftButtonDown()) this.isLeftDown = false;
            if (!p.rightButtonDown()) this.isRightDown = false;
        });

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
    if (this.isGameOver) return;

    this.crosshair.x = this.input.x;
    this.crosshair.y = this.input.y;

    if (this.isLeftDown) {
        this.shoot();
        this.isLeftDown = false;
    }

    if (this.isRightDown) {
        this.reload();
        this.isRightDown = false;
    }
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
    shoot() {

    if (this.isReloading) return;
    if (this.ammo <= 0) return;
    if (this.isGameOver) return;

    this.ammo--;
    this.updateAmmoUI();

    this.sound.play('shoot');

    this.cameras.main.shake(60, 0.002);

    const x = this.input.x;
    const y = this.input.y;

    // efecto disparo
    const impact = this.add.circle(x, y, 3, 0xffff00).setDepth(2000);

    this.tweens.add({
        targets: impact,
        alpha: 0,
        scale: 0.3,
        duration: 150,
        onComplete: () => impact.destroy()
    });

    // ==========================
    // 🎯 HIT AL BOSS
    // ==========================
    if (this.boss && this.boss.active) {

        const bounds = this.boss.getBounds();

        if (Phaser.Geom.Rectangle.Contains(bounds, x, y)) {

        this.bossHealth--;

        this.bossBar.width =
        (this.bossHealth / this.maxBossHealth) * 320;

        // 🔥 cambio de fase
        if (this.bossHealth <= 60 &&
            this.boss.texture.key !== 'bossShip2' &&
            this.bossHealth > 30) {

            this.boss.setTexture('bossShip2');
            this.cameras.main.shake(250,0.01);
        }

        if (this.bossHealth <= 30 &&
            this.boss.texture.key !== 'bossShip3') {

            this.boss.setTexture('bossShip3');
            this.cameras.main.shake(250,0.01);
        }

            // feedback visual
            this.boss.setTint(0xff4444);

            this.time.delayedCall(80, () => {
                if (this.boss.active)
                    this.boss.clearTint();
            });

            this.score += 10;
            this.updateScoreUI();

            // muerte boss
            if (this.bossHealth <= 0) {
                this.killBoss();
            }
        }
    }
}

    reload() {

        if (this.isReloading) return;
        if (this.ammo === this.maxAmmo) return;

        this.isReloading = true;
        this.ammoText.setText("Recargando...");

        this.sound.play('reload');

        this.time.delayedCall(1200, () => {
            this.ammo = this.maxAmmo;
            this.isReloading = false;
            this.updateAmmoUI();
        });
    }

    damagePlayer() {

        this.life--;
        this.updateLifeUI();

        this.cameras.main.flash(100,255,0,0);
        this.cameras.main.shake(150,0.01);

        if (this.life <= 0) {
            this.gameOver();
        }
    }

    gameOver() {

        this.isGameOver = true;
        this.sound.stopAll();

        this.add.rectangle(400,300,800,600,0x000000,0.7).setDepth(2000);

        this.add.text(260,250,"GAME OVER",{
            fontSize:'48px',
            fill:'#ff0000'
        }).setDepth(3000);
    }

    killBoss() {

        this.isGameOver = true;

        this.music.stop();

        this.tweens.killTweensOf(this.boss);

        this.cameras.main.flash(300,255,255,255);
        this.cameras.main.shake(400,0.02);

        this.boss.destroy();

        this.add.rectangle(400,300,800,600,0x000000,0.7).setDepth(2000);

        this.add.text(260,240,"VICTORY!",{
            fontSize:'52px',
            fill:'#00ff00'
        }).setDepth(3000);

        this.add.text(290,320,`Score: ${this.score}`,{
            fontSize:'30px',
            fill:'#ffffff'
        }).setDepth(3000);
    }

    updateAmmoUI() {
        this.ammoText.setText(`Ammo: ${this.ammo}/${this.maxAmmo}`);
    }

    updateLifeUI() {
        const hearts =
            "❤️".repeat(this.life) +
            "🖤".repeat(this.maxLife - this.life);

        this.lifeText.setText(hearts);
    }

    updateScoreUI() {
        this.scoreText.setText(`Score: ${this.score}`);
    }

}