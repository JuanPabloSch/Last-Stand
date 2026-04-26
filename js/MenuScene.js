class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    preload() {
        this.load.image('menu_bg', 'assets/background/menu.png');
        this.load.image('lvl1', 'assets/background/lvl1.png');
        this.load.image('lvl2', 'assets/background/lvl2.png');
        this.load.image('lvl3', 'assets/background/lvl3.png');
    }

    create() {

    // cursor normal
    this.input.setDefaultCursor('default');
    this.game.canvas.style.cursor = 'default';

    this.add.image(400, 300, 'menu_bg').setDisplaySize(800, 600);

    this.add.text(260, 80, "SELECT LEVEL", {
        fontSize: '40px',
        fill: '#ffffff'
    });

    const createLevelCard = (x, y, texture, labelText, color, sceneKey) => {

        const thumb = this.add.image(0, 0, texture).setScale(0.11);

        // 🧱 fondo blanco
        const bg = this.add.rectangle(
            0,
            0,
            thumb.displayWidth + 14,
            thumb.displayHeight + 14,
            0xffffff
        );

        // 🏷️ etiqueta arriba
        const label = this.add.text(
            0,
            -thumb.displayHeight / 2 - 16,
            labelText,
            {
                fontSize: '16px',
                color: color,
                backgroundColor: '#000000aa',
                padding: { x: 6, y: 2 }
            }
        ).setOrigin(0.5);

        // 📦 container
        const container = this.add.container(x, y, [bg, thumb, label]);

        // 🖱️ interacción
        container.setSize(bg.width, bg.height);
        container.setInteractive({ useHandCursor: true });

        container.on('pointerdown', () => {
            this.scene.start(sceneKey);
        });

        container.on('pointerover', () => {
            container.setScale(1.08);
        });

        container.on('pointerout', () => {
            container.setScale(1);
        });

        return container;
    };

    // progreso guardado
    const lvl1Done = localStorage.getItem('lvl1');
    const lvl2Done = localStorage.getItem('lvl2');
    const lvl3Done = localStorage.getItem('lvl3');

    // 🟩 NIVEL 1
    createLevelCard(200, 300, 'lvl1', 'EASY 👨‍✈️', '#00ff88', 'GameScene');

    // 🟨 NIVEL 2
    createLevelCard(400, 300, 'lvl2', 'NORMAL 🤖', '#ffaa00', 'GameScene1');

    // 🟥 NIVEL 3
    createLevelCard(600, 300, 'lvl3', 'HARD 👽', '#ff4444', 'GameScene2');

    // ⭐ FINAL (solo si completó los 3)
    if (lvl1Done && lvl2Done && lvl3Done) {

        let finalBtn = this.add.text(400, 450, "FINAL DESBLOQUEADO", {
            fontSize: '30px',
            fill: '#00ff00',
            backgroundColor: '#000'
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

        finalBtn.on('pointerdown', () => {
            this.scene.start('BossScene');
        });
    }
    }
}