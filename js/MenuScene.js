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

    // progreso guardado
    const lvl1Done = localStorage.getItem('lvl1');
    const lvl2Done = localStorage.getItem('lvl2');
    const lvl3Done = localStorage.getItem('lvl3');

    // 🟩 NIVEL 1
    let lvl1 = this.add.image(200, 300, 'lvl1')
        .setScale(0.11)
        .setInteractive({ useHandCursor: true });

    lvl1.on('pointerdown', () => {
        this.scene.start('GameScene');
    });
    lvl1.on('pointerover', () => lvl1.setScale(0.12));
    lvl1.on('pointerout', () => lvl1.setScale(0.11));


// 🟨 NIVEL 2
    let lvl2 = this.add.image(400, 300, 'lvl2')
        .setScale(0.11)
        .setInteractive({ useHandCursor: true });

    lvl2.on('pointerdown', () => {
        this.scene.start('GameScene1');
    });
    lvl2.on('pointerover', () => lvl2.setScale(0.12));
    lvl2.on('pointerout', () => lvl2.setScale(0.11));

// 🟥 NIVEL 3
    let lvl3 = this.add.image(600, 300, 'lvl3')
        .setScale(0.11)
        .setInteractive({ useHandCursor: true });

    lvl3.on('pointerdown', () => {
        this.scene.start('GameScene2');
    });
    lvl3.on('pointerover', () => lvl3.setScale(0.12));
    lvl3.on('pointerout', () => lvl3.setScale(0.11));

    // ⭐ FINAL (solo si completó los 3)
    if (lvl1Done && lvl2Done && lvl3Done) {

        let finalBtn = this.add.text(400, 450, "FINAL DESBLOQUEADO", {
            fontSize: '30px',
            fill: '#00ff00',
            backgroundColor: '#000'
        })
        .setOrigin(0.5)
        .setInteractive();

        finalBtn.on('pointerdown', () => {
            this.scene.start('BossScene'); // 👈 tu boss final
        });
    }
    }
}