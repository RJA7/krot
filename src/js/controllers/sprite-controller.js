const {DisplayController} = require('./display-controller');
const PIXI = require('pixi.js');

class SpriteController extends DisplayController {
  constructor(gui, getTreeHash, debugGraphics) {
    super(gui, getTreeHash, debugGraphics);

    this.object.texture = {textureCacheIds: ['']};
    this.generalFolder.add(this, 'texture');
  }

  set texture(v) {
    this.object.texture = PIXI.Texture.from(v);
  }

  get texture() {
    return this.object.texture.textureCacheIds[0];
  }

  getSaveObject(object) {
    return Object.assign(
      {},
      super.getSaveObject(object),
      {
        type: 'Sprite',
        texture: object.texture.textureCacheIds[0],
      },
    );
  }
}

module.exports = {SpriteController};
