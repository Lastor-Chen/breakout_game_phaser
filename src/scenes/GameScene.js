// @ts-check
import Phaser from 'phaser'

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('game-scene')
    /** @type {HTMLCanvasElement} */
    this.canvas = null
  }

  preload() {
    this.canvas = this.sys.game.canvas
    this.load.image('ball', '/img/ball.png')
  }

  create() {
    this.ball = this.createBall()
  }

  update() {
  }

  // ==========
  createBall() {
    const ball = this.physics.add.sprite(this.canvas.width * 0.5, this.canvas.height - 25, 'ball')
    // 設定能與 world bounds 發生碰撞
    ball.setCollideWorldBounds()
    // 設定彈力(撞到東西後的減速值), 1 保持原速
    ball.setBounce(1)
    // 設定速度
    ball.setVelocity(150, -150)
    return ball
  }
}
