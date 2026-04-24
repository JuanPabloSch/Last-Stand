class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        this.load.image('game_bg', 'assets/background/game.png');
        this.load.audio('shoot', 'assets/sfx/shoot.mp3');
        this.load.audio('reload', 'assets/sfx/gunreload.mp3');
        this.load.audio('emptyVoice', 'assets/sfx/reloadvoice.mp3');
        this.load.image('crosshair', 'assets/ui/crosshair.png');
        this.load.audio('enemyShoot', 'assets/sfx/enemyshoot.mp3');
        this.load.audio('grunt', 'assets/sfx/grunt.mp3');
        this.load.audio('heartbeat', 'assets/sfx/heartbeat.mp3');
        this.load.audio('gameoverSound', 'assets/sfx/gameover.mp3');
        this.load.audio('deathScream', 'assets/sfx/deathscream.mp3');
        this.load.image('enemy1', 'assets/enemies/human1.png');
        this.load.image('enemy2', 'assets/enemies/human2.png');
        this.load.image('enemy3', 'assets/enemies/human3.png');
    }

    create() {

        this.maxAmmo = 6;
        this.ammo = this.maxAmmo;
        this.isReloading = false;
        this.shootSound = this.sound.add('shoot');
        this.reloadSound = this.sound.add('reload');
        this.emptyVoice = this.sound.add('emptyVoice');
        this.emptyVoiceCooldown = false;
        this.prevAmmo = this.ammo;
        this.crosshair = this.add.image(400, 300, 'crosshair');
        this.crosshair.setScale(0.08); // ajustá tamaño
        this.crosshair.setDepth(10);
        this.enemyShootSound = this.sound.add('enemyShoot');
        this.gruntSound = this.sound.add('grunt');
        this.heartbeatSound = this.sound.add('heartbeat', {
        loop: true,
        volume: 0.8
        });
        this.deathScream = this.sound.add('deathScream');

        this.gameoverSound = this.sound.add('gameoverSound');
        this.enemyTypes = ['enemy1', 'enemy2', 'enemy3'];
        this.lowHpActive = false;

        // ocultar cursor del sistema
        this.input.setDefaultCursor('none');
        this.game.canvas.style.cursor = 'none';

        this.add.image(400, 300, 'game_bg').setDisplaySize(800, 600);

        // 🔫 UI SIEMPRE VISIBLE
        this.ammoText = this.add.text(20, 20, '', {
            fontSize: '22px',
            fill: '#ffffff',
            backgroundColor: '#000000aa',
            padding: { x: 10, y: 5 }
        });

        this.maxLife = 5;
        this.life = this.maxLife;

        this.lifeText = this.add.text(650, 20, '', {
            fontSize: '22px',
            fill: '#ff4444',
            backgroundColor: '#000000aa',
            padding: { x: 10, y: 5 }
        });

        this.score = 0;

        this.scoreText = this.add.text(300, 20, '', {
            fontSize: '22px',
            fill: '#ffffff',
            backgroundColor: '#000000aa',
            padding: { x: 10, y: 5 }
        });

    this.updateScoreUI();
    this.updateLifeUI();
    this.updateAmmoUI();

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

        this.targets = this.add.group();

        // 👇 MENOS ENEMIGOS (más tranquilo)
        this.time.addEvent({
            delay: 1200, // antes 600–700
            loop: true,
            callback: () => this.spawnTarget()
        });
    }

    update() {

    if (this.isRightDown) {
        this.reload();
        this.isRightDown = false;
    }

    if (this.isLeftDown) {
        this.shoot();
        this.isLeftDown = false;
    }

    // 🎯 crosshair sigue mouse
    this.crosshair.x = this.input.x;
    this.crosshair.y = this.input.y;
    }

damagePlayer() {

    this.life--;

    // 🔫 sonido disparo enemigo primero
    this.enemyShootSound.play();

    // ⏱ reacción del jugador después
    this.time.delayedCall(120, () => {
        this.gruntSound.play();
    });

    // 📳 feedback visual
    this.cameras.main.shake(200, 0.01);
    this.cameras.main.flash(100, 255, 0, 0);

    console.log("DAÑO! vida:", this.life);

    this.updateLifeUI();

    if (this.life <= 0) {
        this.gameOver();
    }
}

gameOver() {

    // 📴 parar latido si estaba activo
    if (this.heartbeatSound?.isPlaying) {
        this.heartbeatSound.stop();
    }

    // 😱 grito antes de morir
    this.deathScream.play();

    // 📳 efecto fuerte final
    this.cameras.main.shake(400, 0.02);
    this.cameras.main.flash(150, 255, 0, 0);

    // ⏱ después del grito, game over
    this.time.delayedCall(600, () => {

        this.gameoverSound.play();

        this.add.text(250, 250, "GAME OVER", {
            fontSize: '48px',
            fill: '#ff0000'
        });

        this.scene.pause();
    });
}
// 🔫
shoot() {

    if (this.isReloading) return;

    // 🔊 sin balas
    if (this.ammo <= 0) {
        this.emptyVoice.play();
        return;
    }

    // 🔫 consumir bala
    this.ammo--;
    this.updateAmmoUI();

    // 🔊 sonido
    this.shootSound.play();

    // 💥 recoil
    this.cameras.main.shake(60, 0.002);

    // 🎯 posición
    const x = this.input.x;
    const y = this.input.y;

    // efecto visual
    this.add.circle(x, y, 4, 0xffff00);

    // 🎯 hit detection
this.targets.children.iterate((target) => {

    if (!target) return;

    let b = target.getBounds();

// CLON seguro
let bounds = new Phaser.Geom.Rectangle(
    b.x,
    b.y,
    b.width,
    b.height
);

    // ajuste fino
    bounds.width *= 0.6;
    bounds.height *= 0.8;
    bounds.x += bounds.width * 0.2;
    bounds.y += bounds.height * 0.1;

    // 🧠 HEADSHOT (parte superior)
    const head = new Phaser.Geom.Rectangle(
        bounds.x,
        bounds.y,
        bounds.width,
        bounds.height * 0.3
    );

    // 🎯 chequeo headshot
    if (Phaser.Geom.Rectangle.Contains(head, x, y)) {
    this.hitTarget(target, true);
    } else if (Phaser.Geom.Rectangle.Contains(bounds, x, y)) {
    this.hitTarget(target, false);
    }

    // 💥 cuerpo
    if (Phaser.Geom.Rectangle.Contains(bounds, x, y)) {
        this.hitTarget(target, false);
    }
});

    // 🔊 aviso cuando se queda sin balas
    if (this.ammo === 0) {
        this.emptyVoice.play();
    }
}

    // 🎯 spawn target
    spawnTarget() {

    const x = Phaser.Math.Between(100, 700);
    const y = Phaser.Math.Between(100, 500);

    const type = Phaser.Math.RND.pick(this.enemyTypes);

    const target = this.add.image(x, y, type);

    target.displayWidth = 60;
    target.scaleY = target.scaleX;
    target.setTint(0xff8800); // 🟠 inicio

    target.state = 0;

    this.targets.add(target);

    // 🟡 warning
    this.time.delayedCall(1200, () => {
        if (!target.active) return;

        target.setTint(0xffcc00);
        target.state = 1;
    });

    // 🔴 danger + daño
    this.time.delayedCall(2400, () => {
        if (!target.active) return;

        target.setTint(0xff0000);
        target.state = 2;

        this.damagePlayer();
        target.destroy();
    });
}

    // 💥 hit
hitTarget(target, isHeadshot = false) {

    if (!target.active) return;

    target.destroy();

    let points = 10;

    if (target.state === 0) points = 20;
    if (target.state === 1) points = 10;
    if (target.state === 2) points = 5;

    // 🧠 bonus headshot
    if (isHeadshot) {
        points += 5;
    }

    this.score += points;

    this.updateScoreUI();
}

    // 🔄 reload
    reload() {

        if (this.isReloading) return;
        if (this.ammo === this.maxAmmo) return;

        this.isReloading = true;
        this.ammoText.setText("Recargando...");

        this.reloadSound.play();

        this.time.delayedCall(1200, () => {
            this.ammo = this.maxAmmo;
            this.isReloading = false;
            this.updateAmmoUI();
        });
    }

    updateAmmoUI() {
    this.ammoText.setText(`Ammo: ${this.ammo}/${this.maxAmmo}`);
}
updateLifeUI() {

    const hearts = "❤️".repeat(this.life) + "🖤".repeat(this.maxLife - this.life);
    this.lifeText.setText(hearts);

    // 💓 activar low HP
    if (this.life === 1 && !this.lowHpActive) {
        this.lowHpActive = true;
        this.heartbeatSound.play();
    }

    // 📴 apagar latido si se cura (opcional)
    if (this.life > 1 && this.lowHpActive) {
        this.lowHpActive = false;
        this.heartbeatSound.stop();
    }
}
updateScoreUI() {
    this.scoreText.setText(`Score: ${this.score}`);
}
}
