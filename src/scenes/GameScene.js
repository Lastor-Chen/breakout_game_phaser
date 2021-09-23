// @ts-check
import Phaser from 'phaser'
import physicsConstants from '../config/physicsConstants'
import gameConstants from '../config/gameConstants'
import ScoreLabel from '../ui/ScoreLabel'
import LivesLabel from '../ui/LivesLabel'
import ClearedLabel from '../ui/ClearedLabel'

const ballKey = 'ball'
const ballAnimKey = 'wobble'
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
    left: 60,
  },
  padding: 10,
}
const paddleHitKey = 'paddleHit'
const brickHitKey = 'brickHit'
const buttonKey = 'button'

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('game-scene')
    this.canvas = null
    this.ball = null
    this.bricks = null
    this.cursors = null
    this.velocity = 0
    this.scoreLabel = null
    this.livesLabel = null
    this.clearedLabel = null
    this.timesCleared = 0
    this.isPlaying = false
    this.startButton = null
    this.enterKey = null
  }

  preload() {
    this.canvas = this.sys.game.canvas
    this.load.spritesheet(ballKey, 'img/wobble.png', { frameWidth: 20, frameHeight: 20 })
    this.load.image(paddleKey, 'img/paddle.png')
    this.load.image(brickKey, 'img/brick.png')
    this.load.spritesheet(buttonKey, 'img/button.png', { frameWidth: 120, frameHeight: 40 })
    this.load.audio(paddleHitKey, 'audio/114187__edgardedition__thud17.wav')
    this.load.audio(brickHitKey, 'audio/478284__joao-janz__finger-tap-2-2.wav')
  }

  create() {
    this.startButton = this.createStartButton()
    this.ball = this.createBall()
    this.paddle = this.createPaddle()
    this.physics.add.collider(this.ball, this.paddle, this.ballHitPaddle)

    this.bricks = this.createBricks()
    this.physics.add.collider(this.ball, this.bricks, this.ballHitBrick)

    this.scoreLabel = this.createScoreLabel(8, 8, 0)
    this.livesLabel = this.createLivesLabel(140, 8, gameConstants.startingLives)
    this.clearedLabel = this.createClearedLabel(240, 8, 0)

    // 綁定監聽 keyboard 事件到 cursors 屬性
    this.cursors = this.input.keyboard.createCursorKeys()
    // start 控制監聽
    this.startButton.on('pointerdown', this.startGame, this)
    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER)

    // 監聽 screen 碰撞事件
    this.physics.world.on('worldbounds', this.detectBounds, this)
  }

  update() {
    // starting controller
    const isSpaceDown = this.cursors.space.isDown
    const isEnterDown = this.enterKey.isDown
    if ((isSpaceDown || isEnterDown) && !this.isPlaying) {
      this.startGame()
    }

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

    if (this.isPlaying) {
      this.paddle.setVelocityX(this.velocity)
    } else if (this.paddle.body.velocity.x > 0) {
      this.paddle.setVelocityX(0)
    }
  }

  // ==========
  createStartButton() {
    const startButton = this.add.sprite(this.canvas.width * 0.5, this.canvas.height * 0.5, buttonKey)
    // 允許 Input 互動事件
    startButton.setInteractive()
    return startButton
  }

  createBall() {
    const ball = this.physics.add.sprite(this.canvas.width * 0.5, this.canvas.height - 25, ballKey)
    ball.setOrigin(0.5)

    const wobbleFrames = [0, 1, 0, 2, 0, 1, 0, 2, 0]
    const wobbleFrameKeys = wobbleFrames.map(frame => {
      return {
        key: ballKey,
        frame: frame
      }
    })
    this.anims.create({
      key: ballAnimKey,
      frames: wobbleFrameKeys,
      frameRate: 24,
    })

    // 設定能與 world bounds 發生碰撞, 彈力
    // 參數 4 的 onWorldBounds, 允許碰撞時 emit event
    ball.body.setCollideWorldBounds(true, 1, 1, true)
    // 設定彈力(撞到東西後的減速值), 1 保持原速
    ball.setBounce(1)
    // 設定速度
    ball.setMaxVelocity(physicsConstants.maxBallVelocity, physicsConstants.maxBallVelocity)
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
   * @param {number} x position x
   * @param {number} y position y
   * @param {number} lives 
   */
  createLivesLabel(x, y, lives) {
    const livesLabel = new LivesLabel(this, x, y, lives, {
      fontSize: '20px',
      fontFamily: 'Ariel',
      strokeThickness: 1,
      color: '#eee',
      stroke: '#0095DD',
    })
    this.add.existing(livesLabel)
    return livesLabel
  }

  /**
   * @param {number} x position x
   * @param {number} y position y
   * @param {number} clearedNum 
   */
  createClearedLabel(x, y, clearedNum) {
    const clearedLabel = new ClearedLabel(this, x, y, clearedNum, {
      fontSize: '20px',
      fontFamily: 'Ariel',
      strokeThickness: 1,
      color: '#eee',
      stroke: '#0095DD',
    })
    this.add.existing(clearedLabel)

    return clearedLabel
  }

  startGame() {
    this.isPlaying = true
    // 卸掉 startButton
    this.startButton.setActive(false).setVisible(false)
    // reset state
    this.scoreLabel.setScore(0)
    this.livesLabel.setLives(gameConstants.startingLives)
    this.timesCleared = 0
    this.clearedLabel.setClearedNum(0)
    // reset gameObjects
    this.setBallVelocity()
    this.resetBallPaddlePosition()
  }

  setBallVelocity() {
    const multiplier = this.timesCleared > 0 ? Math.pow(physicsConstants.speedMultiplier, this.timesCleared) : 1
    this.ball.setVelocity(150 * multiplier, -150 * multiplier)
  }

  stopBallVelocity() {
    this.ball.setVelocity(0, 0)
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
      this.livesLabel.removeLife()
      if (this.livesLabel.isDead) {
        this.resetLevel()
        this.gameOver()
      } else {
        this.resetBallPaddlePosition()
        this.physics.pause()
        // 末位參數指定 this scope
        this.time.delayedCall(gameConstants.deathDelay, this.resumeGame, null, this)
      }
    }
  }

  /** @type {ArcadePhysicsCallback} */
  ballHitPaddle = () => {
    this.sound.play(paddleHitKey)
    this.ball.anims.play(ballAnimKey, true)
  }

  /** @type {ArcadePhysicsCallback} */
  ballHitBrick = (ball, obj2) => {
    /** @type {Phaser.Types.Physics.Arcade.SpriteWithDynamicBody} */
    const brick = (obj2)
    brick.disableBody(true, false)
    this.sound.play(brickHitKey)

    // 淡出效果
    this.tweens.add({
      targets: brick,
      alpha: { from: 1, to: 0 },
      ease: 'Linear',
      duration: gameConstants.brickVanishDelay,
      repeat: 0,
      yoyo: false, // mirror
      onComplete: () => brick.disableBody(true, true),
    })

    // 計分
    const multiplier = this.timesCleared > 0 ? gameConstants.clearMultiplier * this.timesCleared : 1
    const pointValue = gameConstants.basePoints * multiplier
    this.scoreLabel.add(pointValue)

    // 判斷勝利
    if (this.bricks.countActive(true) === 0) {
      this.resetLevel()
    }
  }

  resetBallPaddlePosition() {
    const ballX = this.canvas.width * 0.5
    const ballY = this.canvas.height - this.paddle.height - this.ball.height
    this.ball.setPosition(ballX, ballY)
    this.paddle.setPosition(this.canvas.width * 0.5, this.paddle.y)
  }

  resumeGame() {
    this.physics.resume()
  }

  resetLevel() {
    // temporarily pause game
    this.physics.pause()

    // increased clearedNum value
    // to cause increase in score value and ball speed
    this.clearedLabel.addClear()
    this.timesCleared += 1
    this.setBallVelocity()

    // reset gameObjects
    this.resetBallPaddlePosition()
    this.time.delayedCall(gameConstants.deathDelay, () => {
      this.repopulateBricks()
      this.resumeGame()
    })
  }

  repopulateBricks() {
    // respawn bricks
    this.bricks.children.iterate((child) => {
      /** @type {Phaser.Types.Physics.Arcade.SpriteWithDynamicBody} */
      const brick = (child)
      brick.enableBody(true, brick.x, brick.y, true, true)
      brick.clearAlpha()
    })
  }

  gameOver() {
    this.isPlaying = false
    this.startButton.setActive(true).setVisible(true)
    this.stopBallVelocity()
  }
}
