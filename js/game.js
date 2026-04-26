const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
     scene: [MenuScene, GameScene, GameScene1], // 👈 ACÁ
    backgroundColor: '#000'
};

const game = new Phaser.Game(config);