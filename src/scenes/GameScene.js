// @ts-check
import Phaser from 'phaser'
import physicsConstants from '../config/physicsConstants'

const ballKey = 'ball'
const paddleKey = 'paddle'

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('game-scene')
    this.canvas = null
    this.ball = null
    this.cursors = null
    this.velocity = 0
  }

  preload() {
    this.canvas = this.sys.game.canvas
    this.load.image(ballKey, '/img/ball.png')
    this.load.image(paddleKey, '/img/paddle.png')
  }

  create() {
    this.ball = this.createBall()
    this.paddle = this.createPaddle()
    this.physics.add.collider(this.ball, this.paddle)

    // 綁定監聽 keyboard 事件到 cursors 屬性
    this.cursors = this.input.keyboard.createCursorKeys()

    // 監聽 screen 碰撞事件
    this.physics.world.on('worldbounds', this.detectBounds, this)
  }

  update() {
    // paddle movement
    if (this.cursors.left.isDown) {
      this.velocity -= physicsConstants.acceleration
    } else if (this.cursors.right.isDown) {
      this.velocity += physicsConstants.acceleration
    } else {
      if (this.velocity > 0) {
        this.velocity -= physicsConstants.drag
      } else {
        this.velocity += physicsConstants.drag
      }

      // 防止飄移
      if (this.velocity < physicsConstants.drag * 1.1) {
        this.velocity = 0
      }
    }

    // 限制 velocity 最大值
    if (Math.abs(this.velocity) > physicsConstants.maxVelocity) {
      this.velocity = physicsConstants.maxVelocity * Math.sign(this.velocity)
    }

    this.paddle.setVelocityX(this.velocity)
  }

  // ==========
  createBall() {
    const ball = this.physics.add.sprite(this.canvas.width * 0.5, this.canvas.height - 25, ballKey)
    ball.setOrigin(0.5)

    // 設定能與 world bounds 發生碰撞, 彈力
    // 參數 4 的 onWorldBounds, 允許碰撞時 emit event
    ball.body.setCollideWorldBounds(true, 1, 1, true)
    // 設定彈力(撞到東西後的減速值), 1 保持原速
    ball.setBounce(1)
    // 設定速度
    ball.setVelocity(150, -150)
    return ball
  }

  createPaddle() {
    const posX = this.canvas.width * 0.5
    const posY = this.canvas.height - 5
    const paddle = this.physics.add.sprite(posX, posY, paddleKey).setOrigin(0.5, 1)

    // 防止 paddle 離開 screen
    paddle.setCollideWorldBounds()
    // 使其不因被碰撞而移動
    paddle.setImmovable()

    return paddle
  }

  /**
   * @param {Phaser.Physics.Arcade.Body} body
   * @param {boolean} up is碰到頂部
   * @param {boolean} down is碰到底部
   * @param {boolean} left is碰到左側
   * @param {boolean} right is碰到右側
   */
  detectBounds(body, up, down, left, right) {
    if (down) {
      alert('game over!')
      this.scene.stop()
    }
  }
}
