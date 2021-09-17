// @ts-check
// Phaser v3 tutorial:
//   - https://link.medium.com/j7eNhBPYAjb
// Original MDN Phaser v2 tutorial:
//   - https://developer.mozilla.org/zh-CN/docs/Games/Tutorials/2D_breakout_game_Phaser

import './style.css'
import Phaser from 'phaser'
import GameScene from './scenes/GameScene'

/** @type {HTMLElement} */
const app = document.querySelector('#app')

const game = new Phaser.Game({
  type: Phaser.CANVAS,
  parent: app,
  width: 480,
  height: 320,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {}
  },
  scene: [GameScene],
})
