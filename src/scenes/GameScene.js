// @ts-check
import Phaser from 'phaser'
import physicsConstants from '../config/physicsConstants'
import ScoreLabel from '../ui/ScoreLabel'

const ballKey = 'ball'
const paddleKey = 'paddle'
const brickKey = 'brick'
const brickInfo = {
  width: 50,
  height: 20,
  count: {
    row: 3,
    col: 7,
  },
  offset: {
    top: 50,
    left: 60
  },
  padding: 10,
}
const paddleHitKey = 'paddleHit'
const brickHitKey = 'brickHit'

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('game-scene')
    this.canvas = null
    this.ball = null
    this.bricks = null
    this.cursors = null
    this.velocity = 0
    this.scoreLabel = null
  }

  preload() {
    this.canvas = this.sys.game.canvas
    this.load.image(ballKey, '/img/ball.png')
    this.load.image(paddleKey, '/img/paddle.png')
    this.load.image(brickKey, '/img/brick.png')
    this.load.audio(paddleHitKey, '/audio/114187__edgardedition__thud17.wav')
    this.load.audio(brickHitKey, '/audio/478284__joao-janz__finger-tap-2-2.wav')
  }

  create() {
    this.ball = this.createBall()
    this.paddle = this.createPaddle()
    this.physics.add.collider(this.ball, this.paddle, this.ballHitPaddle)

    this.bricks = this.createBricks()
    this.physics.add.collider(this.ball, this.bricks, this.ballHitBrick)

    this.scoreLabel = this.createScoreLabel(8, 8, 0)

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

  createBricks() {
    // 建立 bricks 的 static group
    const bricks = this.physics.add.staticGroup()
    for (let col = 0; col < brickInfo.count.col; col++) {
      for (let row = 0; row < brickInfo.count.row; row++) {
        const brickX = (brickInfo.width + brickInfo.padding) * col + brickInfo.offset.left
        const brickY = (brickInfo.height + brickInfo.padding) * row + brickInfo.offset.top
        bricks.create(brickX, brickY, brickKey)
      }
    }
    return bricks
  }

  /**
   * @param {number} x position x
   * @param {number} y position y
   * @param {number} score 
   */
  createScoreLabel(x, y, score) {
    const scoreLabel = new ScoreLabel(this, x, y, score, {
      fontSize: '20px',
      fontFamily: 'Ariel',
      strokeThickness: 1,
      color: '#eee',
      stroke: '#0095DD',
    })
    this.add.existing(scoreLabel)

    return scoreLabel
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
      this.scene.pause()
    }
  }

  /** @type {ArcadePhysicsCallback} */
  ballHitPaddle = () => {
    this.sound.play(paddleHitKey)
  }

  /** @type {ArcadePhysicsCallback} */
  ballHitBrick = (ball, brick) => {
    /** @type {Phaser.Types.Physics.Arcade.SpriteWithDynamicBody} */
    (brick).disableBody(true, true)
    this.sound.play(brickHitKey)
    this.scoreLabel.add(50)

    if (this.bricks.countActive(true) === 0) {
      alert('You won the game. Congratulations!!')
      window.location.reload()
    }
  }
}
