import './style.css'
import Phaser from 'phaser'

function preload() {}
function create() {}
function update() {}

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: document.querySelector('#app'),
  width: 480,
  height: 320,
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
})