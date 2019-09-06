const {getKeyAndFrameName} = require("./utils");

class TextIcon {
  constructor(texture, x = 0, y = 0, scaleX = 1, scaleY = 1) {
    const keyFrame = getKeyAndFrameName(texture);

    if (!keyFrame) {
      console.warn(`Text icon texture ${texture} not found`);
      return;
    }

    this.texture = texture;
    this.x = x;
    this.y = y;
    this.scaleX = scaleX;
    this.scaleY = scaleY;
    this.image = game.cache.getItem(keyFrame[0], Phaser.Cache.IMAGE);
    this.frame = this.image.frameData.getFrameByName(keyFrame[1]);
  }
}

module.exports = {TextIcon};
