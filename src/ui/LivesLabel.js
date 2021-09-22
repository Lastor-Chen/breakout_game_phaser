// @ts-check
import Phaser from 'phaser'

class LivesLabel extends Phaser.GameObjects.Text {
  /**
   * @param {Phaser.Scene} scene 
   * @param {number} x 
   * @param {number} y 
   * @param {number} lives 
   * @param {Phaser.Types.GameObjects.Text.TextStyle} style
   */
  constructor(scene, x, y, lives, style) {
    super(scene, x, y, '', style)
    this.lives = lives
    this.setText(this.livesText)
  }

  get livesText() {
    return `Lives: ${this.lives}`
  }

  get isDead() {
    return this.lives < 1
  }

  setLives(lives) {
    this.lives = lives
    this.setText(this.livesText)
  }

  removeLife() {
    this.setLives(this.lives - 1)
  }
}

export default LivesLabel