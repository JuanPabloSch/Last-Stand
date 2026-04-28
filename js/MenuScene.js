class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    preload() {

        this.load.image('menu_bg', 'assets/background/menu.png');

        this.load.image('lvl1', 'assets/background/lvl1.png');
        this.load.image('lvl2', 'assets/background/lvl2.png');
        this.load.image('lvl3', 'assets/background/lvl3.png');
        this.load.image('lvl4', 'assets/background/lvl4.png');
    }

    create() {
        console.log('lvl1:', JSON.stringify(localStorage.getItem('lvl1')));
        console.log('lvl2:', JSON.stringify(localStorage.getItem('lvl2')));
        console.log('lvl3:', JSON.stringify(localStorage.getItem('lvl3')));
        this.input.setDefaultCursor('default');

        this.add.image(400, 300, 'menu_bg').setDisplaySize(800, 600);

        this.add.text(260, 80, "SELECT LEVEL", {
            fontSize: '40px',
            fill: '#ffffff'
        });

        // 🔧 helper de botones
        const createLevelCard = (x, y, texture, label, color, sceneKey) => {

            const thumb = this.add.image(0, 0, texture).setScale(0.11);

            const bg = this.add.rectangle(
                0, 0,
                thumb.displayWidth + 14,
                thumb.displayHeight + 14,
                0xffffff
            );

            const text = this.add.text(
                0,
                -thumb.displayHeight / 2 - 16,
                label,
                {
                    fontSize: '16px',
                    color: color,
                    backgroundColor: '#000000aa',
                    padding: { x: 6, y: 2 }
                }
            ).setOrigin(0.5);

            const container = this.add.container(x, y, [bg, thumb, text]);

            container.setSize(bg.width, bg.height);
            container.setInteractive({ useHandCursor: true });

            container.on('pointerdown', () => {
                this.scene.start(sceneKey);
            });

            container.on('pointerover', () => container.setScale(1.08));
            container.on('pointerout', () => container.setScale(1));

            return container;
        };

        // =========================
        // 📊 PROGRESO (IMPORTANTE)
        // =========================
        const lvl1Done = localStorage.getItem('lvl1') === 'true';
        const lvl2Done = localStorage.getItem('lvl2') === 'true';
        const lvl3Done = localStorage.getItem('lvl3') === 'true';

        // =========================
        // 🎮 niveles siempre visibles
        // =========================
        createLevelCard(200, 260, 'lvl1', '👨‍✈️', '#00ff88', 'GameScene');
        createLevelCard(400, 260, 'lvl2', '🤖', '#ffaa00', 'GameScene1');
        createLevelCard(600, 260, 'lvl3', '👽', '#ff4444', 'GameScene2');

        // =========================
        // 🛸 nivel final desbloqueo
        // =========================
        const lvl4Unlocked = lvl1Done && lvl2Done && lvl3Done;

        if (lvl4Unlocked) {

            createLevelCard(
                400,
                450,
                'lvl4',
                '🛸 FINAL',
                '#ff00ff',
                'GameScene3'
            );

        } else {

            this.add.text(400, 450, "🔒 COMPLETE LEVELS 1-3", {
                fontSize: '26px',
                fill: '#888888',
                backgroundColor: '#000000aa',
                padding: { x: 12, y: 6 }
            }).setOrigin(0.5);
        }
    }
}