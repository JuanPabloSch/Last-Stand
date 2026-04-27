const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: [StartScene, MenuScene, GameScene, GameScene1, GameScene2],
    backgroundColor: '#000'
};

const game = new Phaser.Game(config);