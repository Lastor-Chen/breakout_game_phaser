// @ts-check
import Phaser from 'phaser'

class ScoreLabel extends Phaser.GameObjects.Text {
  /**
   * @param {Phaser.Scene} scene 
   * @param {number} x 
   * @param {number} y 
   * @param {number} score 
   * @param {Phaser.Types.GameObjects.Text.TextStyle} style 
   */
  constructor(scene, x, y, score, style) {
    super(scene, x, y, '', style)
    this.score = score
    this.setText(this.scoreText)
  }

  get scoreText() {
    return `Score: ${this.score}`
  }

  /** @param {number} points */
  setScore(points) {
    this.score = points
    this.setText(this.scoreText)
  }

  /** @param {number} points */
  add(points) {
    this.score += points
    this.setText(this.scoreText)
  }
}

export default ScoreLabel
