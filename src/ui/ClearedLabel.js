// @ts-check
import Phaser from 'phaser'

class ClearedLabel extends Phaser.GameObjects.Text {
  /**
   * @param {Phaser.Scene} scene 
   * @param {number} x 
   * @param {number} y 
   * @param {number} clearedNum 
   * @param {Phaser.Types.GameObjects.Text.TextStyle} style 
   */
  constructor(scene, x, y, clearedNum, style) {
    super(scene, x, y, '', style)
    this.clearedNum = clearedNum
    this.setText(this.clearedText)
  }

  get clearedText() {
    return `Cleared: ${this.clearedNum}`
  }

  /** @param {number} clearedNum */
  setClearedNum(clearedNum) {
    this.clearedNum = clearedNum
    this.setText(this.clearedText)
  }

  addClear() {
    this.clearedNum += 1
    this.setText(this.clearedText)
  }
}

export default ClearedLabel