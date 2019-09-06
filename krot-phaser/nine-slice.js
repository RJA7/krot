const {getImageByTextureName} = require("./utils");

class NineSlice extends Phaser.Sprite {
  constructor(game, x, y, textureName) {
    super(game, x, y, textureName);

    this.x0 = 0;
    this.y0 = 0;
    this.x1 = this.width;
    this.y1 = this.height;

    this.bmd = game.make.bitmapData(10, 10);
    this.originalTextureName = textureName;
    this.hash = "";
  }

  get textureName() {
    return this.originalTextureName;
  }

  set textureName(v) {
    this.originalTextureName = v;
  }

  getHash() {
    return `${this.originalTextureName} ${this.x0} ${this.y0} ${this.x1} ${this.y1} ${this.width} ${this.height}`;
  }

  refresh() {
    const textureName = this.originalTextureName;
    const image = getImageByTextureName(textureName);

    if (!image) return;

    const frame = image.frameData.getFrameByName(textureName) || image.frameData.getFrame(0);
    const src = image.base.source;

    const x = frame.x;
    const y = frame.y;
    const w = frame.width;
    const h = frame.height;
    const l = this.x0;
    const t = this.y0;
    const r = this.x1;
    const b = this.y1;

    const width = w * this.scale.x;
    const height = h * this.scale.y;
    const left = l;
    const top = t;
    const right = width - (w - r);
    const bottom = height - (h - b);

    this.bmd.resize(
      Math.max(10, width), // Math.max(10, Math.ceil(width / 10) * 10),
      Math.max(10, height), // Math.max(10, Math.ceil(height / 10) * 10),
    );

    this.loadTexture(this.bmd);
    this.hash = this.getHash();

    if (frame.trimmed) {
      console.warn(`Nine slice texture ${this.originalTextureName} is trimmed. Not supported for now`);
      return;
    }

    if (
      this.width < this.x0 + w - this.x1 || this.height < this.y0 + h - this.y1 ||
      this.x0 > this.x1 || this.y0 > this.y1 ||
      this.x0 < 0 || this.y0 < 0 || this.x1 > w || this.y1 > h
    ) {
      console.warn(`Nine slice ${this.originalTextureName} is invalid`);
      return;
    }

    const ctx = this.bmd.ctx;

    ctx.drawImage(src, x, y, l, t, 0, 0, left, top); // left top
    ctx.drawImage(src, x + r, y, w - r, t, right, 0, width - right, top); // right top
    ctx.drawImage(src, x + r, y + b, w - r, h - b, right, bottom, width - right, height - bottom); // right bottom
    ctx.drawImage(src, x, y + b, l, h - b, 0, bottom, left, height - bottom); // left bottom

    ctx.drawImage(src, x + l, y, r - l, t, left, 0, right - left, top); // top
    ctx.drawImage(src, x + r, y + t, w - r, b - t, right, top, width - right, bottom - top); // right
    ctx.drawImage(src, x + l, y + b, r - l, h - b, left, bottom, right - left, height - bottom); // bottom
    ctx.drawImage(src, x, y + t, l, b - t, 0, top, left, bottom - top); // left

    ctx.drawImage(src, x + l, y + t, r - l, b - t, left, top, right - left, bottom - top); // center
  }

  updateTransform(parent) {
    super.updateTransform(parent);
    this.worldTransform.a /= this.scale.x;
    this.worldTransform.b /= this.scale.x;
    this.worldTransform.c /= this.scale.y;
    this.worldTransform.d /= this.scale.y;

    return this;
  }

  _renderCanvas(renderSession, matrix) {
    this.hash !== this.getHash() && this.refresh();
    super._renderCanvas(renderSession, matrix);
  }
}

Phaser.NineSlice = NineSlice;
