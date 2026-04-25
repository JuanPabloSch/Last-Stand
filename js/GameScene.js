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
        this.load.audio('death1', 'assets/sfx/death1.mp3');
        this.load.audio('death2', 'assets/sfx/death2.mp3');
        this.load.audio('death3', 'assets/sfx/death3.mp3');
        this.load.audio('getReadySound', 'assets/sfx/getready.mp3');
    }

    create() {
        this.wave = 1;
        this.maxWaves = 10;

        this.enemiesAlive = 0;
        this.enemiesToSpawn = 0;
        this.spawning = false;
        this.getReadySound = this.sound.add('getReadySound');
        this.maxAmmo = 6;
        this.ammo = this.maxAmmo;
        this.isReloading = false;
        this.shootSound = this.sound.add('shoot');
        this.reloadSound = this.sound.add('reload');
        this.emptyVoice = this.sound.add('emptyVoice');
        this.emptyVoiceCooldown = false;
        this.prevAmmo = this.ammo;
        this.add.image(400, 300, 'game_bg').setDisplaySize(800, 600);
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
        
        // 🔦 luces del techo
        this.light1 = this.add.circle(380, 82, 6, 0xffffaa, 0.6);
        this.light2 = this.add.circle(650, 82, 6, 0xffffaa, 0.6);
        this.time.addEvent({
            delay: 200,
            loop: true,
            callback: () => {
                this.light1.alpha = Phaser.Math.FloatBetween(0.4, 0.8);
                this.light2.alpha = Phaser.Math.FloatBetween(0.3, 0.9);
            }
        });

        const g = this.add.graphics();
        g.fillStyle(0xffffff);
        g.fillCircle(0, 0, 2);
        g.generateTexture('dust', 4, 4);
        g.destroy();
        this.dust = this.add.particles(0, 0, 'dust', {
        x: { min: 0, max: 800 },
        y: { min: 0, max: 600 },

        lifespan: 7000,

        speedX: { min: -8, max: 8 },
        speedY: { min: 5, max: 25 },

        scale: { start: 1.8, end: 0 },
        alpha: { start: 0.25, end: 0 },

        quantity: 1,
        frequency: 50,

        tint: 0xaaaaaa
    });
        // ocultar cursor del sistema
        this.input.setDefaultCursor('none');
        this.game.canvas.style.cursor = 'none';

        // 🔫 UI SIEMPRE VISIBLE
        this.ammoText = this.add.text(20, 20, '', {
            fontSize: '22px',
            fill: '#ffffff',
            backgroundColor: '#000000aa',
            padding: { x: 10, y: 5 }
        });
        
        this.maxLife = 5;
        this.life = this.maxLife;

        this.lifeText = this.add.text(600, 20, '', {
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
        this.startWave();

        

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

        }

    startWave() {

    if (this.wave > this.maxWaves) {
        this.winGame();
        return;
    }

    this.spawning = true;

    // cartel
    let text = this.add.text(300, 200, `WAVE ${this.wave}`, {
        fontSize: '40px',
        fill: '#ffffff'
    });

    this.time.delayedCall(1000, () => text.destroy());

    // cantidad enemigos (simple y estable)
    this.enemiesToSpawn = 2 + this.wave * 2;
    this.enemiesAlive = 0;

    // loop de spawn CONTROLADO
    this.spawnLoop = this.time.addEvent({
        delay: 1000,
        loop: true,
        callback: () => {

            if (this.enemiesToSpawn <= 0) {
                this.spawnLoop.remove();
                return;
            }

            this.spawnTarget();
        }
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
    const impact = this.add.circle(x, y, 3, 0xffff00);

this.tweens.add({
    targets: impact,
    alpha: 0,
    scale: 0.3,
    duration: 150,
    onComplete: () => impact.destroy()
});

    // 🎯 hit detection
let hit = false;

this.targets.children.iterate((target) => {

    if (!target || !target.active || hit) return;

    let b = target.getBounds();

    let bounds = new Phaser.Geom.Rectangle(b.x, b.y, b.width, b.height);

    bounds.width *= 0.6;
    bounds.height *= 0.8;
    bounds.x += bounds.width * 0.2;
    bounds.y += bounds.height * 0.1;

    const head = new Phaser.Geom.Rectangle(
        bounds.x,
        bounds.y,
        bounds.width,
        bounds.height * 0.3
    );

    if (Phaser.Geom.Rectangle.Contains(head, x, y)) {
        this.hitTarget(target, true);
        hit = true;
    }
    else if (Phaser.Geom.Rectangle.Contains(bounds, x, y)) {
        this.hitTarget(target, false);
        hit = true;
    }
});
    // 🔊 aviso cuando se queda sin balas
    if (this.ammo === 0) {
        this.emptyVoice.play();
    }
}

    // 🎯 spawn target
spawnTarget() {

    const positions = [

        // 🟤 PISO ABAJO
        { x: 53, y: 490 },
        { x: 188, y: 475 },
        { x: 353, y: 485 },
        { x: 404, y: 463 },
        { x: 507, y: 490 },
        { x: 686, y: 449 },
        { x: 656, y: 501 },
        { x: 55, y: 446 },
        { x: 390, y: 448 },
        { x: 749, y: 475 },

        // 🪜 ESCALERA
        { x: 727, y: 215 },
        { x: 558, y: 200 },

        // 🟡 PISO ARRIBA (ligero random en X)
        { x: Phaser.Math.Between(80, 700), y: 205 },
        { x: Phaser.Math.Between(80, 700), y: 200 }
    ];

    const pos = Phaser.Math.RND.pick(positions);
    const type = Phaser.Math.RND.pick(this.enemyTypes);

    const target = this.add.image(pos.x, pos.y, type);

    // 🔥 tamaño base SIEMPRE
    target.displayWidth = 80;
    target.scaleY = target.scaleX;

    // 🧠 ajuste por altura
    if (pos.y < 300) {
        target.setScale(target.scaleX * 0.8); // 👈 más chico arriba
    }

    target.setTint(0xff8800);
    target.state = 0;

    this.targets.add(target);
    if (pos.x >= 400) {
    target.setFlipX(true);  // derecha → se da vuelta
    } else {
    target.setFlipX(false); // izquierda → normal
    }

    // 🟡 warning
    this.time.delayedCall(1200, () => {
        if (!target.active) return;
        target.setTint(0xffcc00);
        target.state = 1;
    });

    // 🔴 danger
    this.time.delayedCall(2400, () => {
        if (!target.active) return;
        target.setTint(0xff0000);
        target.state = 2;

        this.damagePlayer();
        target.destroy();
        
        this.enemiesAlive--;
        this.checkWaveEnd();
    });
    this.enemiesAlive++;
    this.enemiesToSpawn--;
}

    // 💥 hit
hitTarget(target, isHeadshot = false) {

    if (!target.active) return;

        this.sound.play(
    Phaser.Math.RND.pick(['death1','death2','death3'])
    );

    target.destroy();

    this.enemiesAlive--;
    this.checkWaveEnd();

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

checkWaveEnd() {

    if (this.enemiesAlive <= 0 && this.enemiesToSpawn <= 0 && this.spawning) {

        this.spawning = false;

        this.time.delayedCall(1000, () => {
            this.endWave();
        });
    }
}
endWave() {

    let text = this.add.text(300, 250, "GET READY", {
        fontSize: '32px',
        fill: '#ffff00'
    });
    this.getReadySound.play();
    this.time.delayedCall(1200, () => text.destroy());

    this.time.delayedCall(1500, () => {
        this.wave++;

        if (this.wave > this.maxWaves) {
            this.winGame();
        } else {
            this.startWave();
        }
    });
}

winGame() {

    this.scene.pause();

    this.add.text(120, 200, "SOBREVIVISTE TODAS LAS OLEADAS", {
        fontSize: '32px',
        fill: '#00ff00'
    });

    this.add.text(300, 280, `Score: ${this.score}`, {
        fontSize: '28px',
        fill: '#ffffff'
    });

    this.add.text(300, 330, `Vida: ${this.life}`, {
        fontSize: '28px',
        fill: '#ffffff'
    });
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
