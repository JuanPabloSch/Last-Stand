class GameScene2 extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene2' });
    }

    preload() {
        this.load.image('game_bg3', 'assets/background/lvl3.png');
        this.load.audio('shoot3', 'assets/sfx/lvl3/shoot.mp3');
        this.load.audio('reload', 'assets/sfx/gunreload.mp3');
        this.load.audio('emptyVoice', 'assets/sfx/reloadvoice.mp3');
        this.load.image('crosshair', 'assets/ui/crosshair.png');
        this.load.audio('enemyShoot3', 'assets/sfx/lvl3/enemyshoot.mp3');
        this.load.audio('grunt', 'assets/sfx/grunt.mp3');
        this.load.audio('heartbeat', 'assets/sfx/heartbeat.mp3');
        this.load.audio('gameoverSound', 'assets/sfx/gameover.mp3');
        this.load.audio('deathScream', 'assets/sfx/deathscream.mp3');
        this.load.image('aenemy1', 'assets/enemies/lvl3/alien1.png');
        this.load.image('aenemy2', 'assets/enemies/lvl3/alien2.png');
        this.load.image('aenemy3', 'assets/enemies/lvl3/alien3.png');
        this.load.audio('adeath1', 'assets/sfx/lvl3/death1.mp3');
        this.load.audio('adeath2', 'assets/sfx/lvl3/death2.mp3');
        this.load.audio('adeath3', 'assets/sfx/lvl3/death3.mp3');
        this.load.audio('getReadySound', 'assets/sfx/getready.mp3');
        this.load.audio('gameMusic3', 'assets/music/lvl3.mp3');
        this.load.audio('thunder1', 'assets/sfx/lvl3/thunder1.mp3');
        this.load.audio('thunder2', 'assets/sfx/lvl3/thunder2.mp3');
    }

    create() {
        this.input.removeAllListeners();
        this.wave = 1;
        this.maxWaves = 10;
        this.isGameOver = false;
        this.enemiesAlive = 0;
        this.enemiesToSpawn = 0;
        this.spawning = false;
        this.getReadySound = this.sound.add('getReadySound');
        this.maxAmmo = 6;
        this.ammo = this.maxAmmo;
        this.isReloading = false;
        this.shootSound = this.sound.add('shoot3');
        this.reloadSound = this.sound.add('reload');
        this.emptyVoice = this.sound.add('emptyVoice');
        this.emptyVoiceCooldown = false;
        this.prevAmmo = this.ammo;
        this.add.image(400, 300, 'game_bg3').setDisplaySize(800, 600);
        this.crosshair = this.add.image(400, 300, 'crosshair');
        this.crosshair.setScale(0.08); // ajustá tamaño
        this.crosshair.setDepth(1000);
        this.enemyShootSound = this.sound.add('enemyShoot3');
        this.gruntSound = this.sound.add('grunt');
        this.heartbeatSound = this.sound.add('heartbeat', {
        loop: true,
        volume: 0.8
        });
        this.deathScream = this.sound.add('deathScream');
        this.gameoverSound = this.sound.add('gameoverSound');
        this.enemyTypes = ['aenemy1', 'aenemy2', 'aenemy3'];
        this.flyingEnemy = 'aenemy3';
        this.lowHpActive = false;
        if (this.sound.get('gameMusic3')) {
        this.sound.stopByKey('gameMusic3');
        }

        this.gameMusic = this.sound.add('gameMusic3', {
            loop: true,
            volume: 0.45
        });

        this.gameMusic.play();
        this.thunders = [
            this.sound.add('thunder1', { volume: 0.7 }),
            this.sound.add('thunder2', { volume: 0.7 })
        ];
        this.startStorm();
    const g = this.add.graphics();
    g.fillStyle(0xffffff);
    g.fillRect(0, 0, 3, 18);
    g.generateTexture('rain', 3, 18);
    g.destroy();

    this.rain = this.add.particles(0, 0, 'rain', {
        x: { min: 0, max: 800 },
        y: { min: -50, max: 0 },

        lifespan: 900,

        speedY: { min: 900, max: 1200 },
        speedX: { min: -120, max: -60 },

        quantity: 6,
        frequency: 15,

        scale: { start: 1, end: 1 },
        alpha: { start: 0.8, end: 0.3 }
    });

    this.rain.setDepth(999);
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

    if (this.isGameOver) return;

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

    if (this.gameMusic?.isPlaying) {
    this.gameMusic.stop();
    }

    if (this.isGameOver) return;
    this.isGameOver = true;

    // 🚫 cortar input
    this.isLeftDown = false;
    this.isRightDown = false;

    // 🛑 frenar spawn
    if (this.spawnLoop) {
        this.spawnLoop.remove();
    }

    this.time.removeAllEvents();

    // 🧹 borrar enemigos
    this.targets.clear(true, true);

    // 📴 sonido
    if (this.heartbeatSound?.isPlaying) {
        this.heartbeatSound.stop();
    }

    // 😱 grito
    this.deathScream.play();

    // 🎥 efectos
    this.cameras.main.shake(400, 0.02);
    this.cameras.main.flash(150, 255, 0, 0);

    // 🖤 overlay oscuro (ACÁ VA)
    let fade = this.add.rectangle(400, 300, 800, 600, 0x000000)
        .setDepth(100)
        .setAlpha(0);

    this.tweens.add({
        targets: fade,
        alpha: 0.7,
        duration: 500
    });

    // ⏱ mostrar UI después
    this.time.delayedCall(600, () => {

        this.gameoverSound.play();

        // 🟥 GAME OVER
        this.add.text(250, 250, "GAME OVER", {
            fontSize: '48px',
            fill: '#ff0000'
        }).setDepth(200);

        // 🔁 TRY AGAIN
        let retry = this.add.text(400, 320, "TRY AGAIN", {
            fontSize: '32px',
            fill: '#ffffff',
            backgroundColor: '#000000aa',
            padding: { x: 20, y: 10 }
        })
        .setOrigin(0.5)
        .setDepth(200)
        .setInteractive({ useHandCursor: true });

        retry.on('pointerdown', () => {
            this.scene.restart();
        });

        // ⬅ VOLVER AL MENU
        let menu = this.add.text(400, 380, "VOLVER AL MENU", {
            fontSize: '28px',
            fill: '#ffffff',
            backgroundColor: '#000000aa',
            padding: { x: 20, y: 10 }
        })
        .setOrigin(0.5)
        .setDepth(200)
        .setInteractive({ useHandCursor: true });

        menu.on('pointerdown', () => {

    this.sound.stopAll();
    this.tweens.killAll();
    this.time.removeAllEvents();

    this.scene.stop();
    this.scene.start('MenuScene');
    });

    });
}
// 🔫
shoot() {
    if (this.isGameOver) return;
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

        spawnTarget() {

        const type = Phaser.Math.RND.pick(this.enemyTypes);

        let x, y;

        // =========================
        // 🚁 VOLADOR
        // =========================
        if (type === this.flyingEnemy) {

            x = Phaser.Math.Between(150, 650);

            // arriba o abajo del puente
            y = Phaser.Math.RND.pick([
                Phaser.Math.Between(70, 170),
                Phaser.Math.Between(430, 530)
            ]);

        } else {

            // =========================
            // 👟 SUELO (camina puente)
            // =========================
            y = Phaser.Math.Between(260, 340);

            // sale desde izquierda o derecha
            if (Phaser.Math.Between(0, 1) === 0) {
                x = -60;
            } else {
                x = 860;
            }
        }

        const target = this.add.image(x, y, type);

        target.type = type;
        target.health = 1;

        // =========================
        // 📏 ESCALA
        // =========================
        if (type === this.flyingEnemy) {
            target.setScale(0.20);
        } else {
            target.setScale(0.28);
            target.setDepth(y);
        }

        target.setTint(0xff8800);
        target.state = 0;

        this.targets.add(target);

        // mirar hacia donde va
        if (type !== this.flyingEnemy) {
            target.setFlipX(x < 0);
        } else {
            target.setFlipX(x >= 400);
        }

        // =========================
        // 🎞 MOVIMIENTO
        // =========================
        if (type === this.flyingEnemy) {

            this.tweens.add({
                targets: target,
                x: Phaser.Math.Between(150, 650),
                y: y + Phaser.Math.Between(-40, 40),
                duration: 1800,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            this.tweens.add({
                targets: target,
                y: '+=15',
                duration: 700,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

        } else {

            // caminar horizontal
            const destinoX = x < 0 ? 860 : -60;

            this.tweens.add({
                targets: target,
                x: destinoX,
                duration: Phaser.Math.Between(3500, 5000),
                ease: 'Linear'
            });
        }

        // =========================
        // 🟡 WARNING
        // =========================
        this.time.delayedCall(1000, () => {
            if (!target.active) return;

            target.setTint(0xffcc00);
            target.state = 1;
        });

        // =========================
        // 🔴 DANGER
        // =========================
        this.time.delayedCall(2100, () => {
            if (!target.active) return;

            target.setTint(0xff0000);
            target.state = 2;

            this.damagePlayer();

            this.tweens.killTweensOf(target);
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

    // 🎯 HEADSHOT = muerte directa
    if (isHeadshot) {
        target.health = 0;
    } else {
        target.health--;
    }

    // ❌ si sigue vivo, no muere
    if (target.health > 0) {

        // feedback visual opcional
        target.setTint(0xffffff);

        return;
    }

        this.sound.play(
    Phaser.Math.RND.pick(['adeath1','adeath2','adeath3'])
    );

    this.tweens.killTweensOf(target);
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
    localStorage.setItem('lvl3', 'true');
    this.isGameOver = true;

    // 🖤 fondo
    let fade = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.7)
        .setDepth(100);

    // 🟢 textos
    this.add.text(120, 200, "SOBREVIVISTE TODAS LAS OLEADAS", {
        fontSize: '32px',
        fill: '#00ff00'
    }).setDepth(200);

    this.add.text(300, 280, `Score: ${this.score}`, {
        fontSize: '28px',
        fill: '#ffffff'
    }).setDepth(200);

    this.add.text(300, 330, `Vida: ${this.life}`, {
        fontSize: '28px',
        fill: '#ffffff'
    }).setDepth(200);

    // ⬅ botón
    let menu = this.add.text(400, 420, "VOLVER AL MENU", {
        fontSize: '30px',
        fill: '#ffffff',
        backgroundColor: '#000000aa',
        padding: { x: 20, y: 10 }
    })
    .setOrigin(0.5)
    .setDepth(200)
    .setInteractive({ useHandCursor: true });

    menu.on('pointerdown', () => {

    this.sound.stopAll();
    this.tweens.killAll();
    this.time.removeAllEvents();

    this.scene.stop();
    this.scene.start('MenuScene');
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

    startStorm() {

    const launchLightning = () => {

        if (this.isGameOver) return;

        // ⚡ flash
        this.cameras.main.flash(
            120,
            255,
            255,
            255,
            false
        );
        this.cameras.main.shake(120, 0.003);

        // segundo flash opcional
        this.time.delayedCall(100, () => {
            this.cameras.main.flash(
                80,
                255,
                255,
                255,
                false
            );
        });

        // 🌩 trueno retrasado
        this.time.delayedCall(
            Phaser.Math.Between(250, 700),
            () => {

                const sound = Phaser.Math.RND.pick(this.thunders);
                sound.play();
            }
        );

        // repetir aleatorio
        this.time.delayedCall(
            Phaser.Math.Between(4000, 9000),
            launchLightning
        );
    };

    launchLightning();
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
getScaleByY(y) {

    const minY = 80;
    const maxY = 500;

    const minScale = 0.2;
    const maxScale = 0.3;

    const t = Phaser.Math.Clamp((y - minY) / (maxY - minY), 0, 1);

    return minScale + t * (maxScale - minScale);
}
getTunnelXRange(y) {

    const minY = 80;   // fondo del túnel
    const maxY = 500;  // cerca del jugador

    const t = Phaser.Math.Clamp((y - minY) / (maxY - minY), 0, 1);

    // ancho del túnel según profundidad
    const minWidth = 100;  // arriba (angosto)
    const maxWidth = 700;  // abajo (ancho)

    const width = minWidth + t * (maxWidth - minWidth);

    const centerX = 400;

    return {
        minX: centerX - width / 2,
        maxX: centerX + width / 2
    };
}
}
