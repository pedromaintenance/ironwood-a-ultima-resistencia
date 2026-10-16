import Phaser from 'phaser';
import { BattleScene } from './BattleScene';
import './style.css';

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: 480,
  height: 480,
  pixelArt: true,
  backgroundColor: '#101916',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BattleScene],
});
