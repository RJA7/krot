const { ContainerController } = require('./container-controller');
const { createControllerBuilder } = require('./builder');

class NineSlicePlaneController extends ContainerController {
  constructor(gui, getTreeHash, debugGraphics) {
    super(gui, getTreeHash, debugGraphics);

    [
      { prop: 'width', defaults: 0, step: 1 },
      { prop: 'height', defaults: 0, step: 1 },
      { prop: 'leftWidth', defaults: 0, step: 1 },
      { prop: 'topHeight', defaults: 0, step: 1 },
      { prop: 'rightWidth', defaults: 0, step: 1 },
      { prop: 'bottomHeight', defaults: 0, step: 1 },
      { prop: 'tint', defaults: 0xffffff, color: true },
      { prop: 'blendMode', defaults: PIXI.BLEND_MODES.NORMAL, list: PIXI.BLEND_MODES },
      { prop: 'interactive', defaults: false },
      { prop: 'buttonMode', defaults: false },
    ].forEach(createControllerBuilder(this, this.generalFolder));

    this.object.texture = { textureCacheIds: [''] };
    this.generalFolder.add(this, 'texture');
  }

  set texture(v) {
    this.object.texture = new PIXI.Texture.from(v);
    this.object.width = this.object.texture.width;
    this.object.height = this.object.texture.height;
  }

  get texture() {
    return this.object.texture.textureCacheIds[0];
  }

  getSaveObject(object) {
    return Object.assign(
      {},
      super.getSaveObject(object),
      {
        type: 'NineSlicePlane',
        width: object.width,
        height: object.height,
        leftWidth: object.leftWidth,
        topHeight: object.topHeight,
        rightWidth: object.rightWidth,
        bottomHeight: object.bottomHeight,
        tint: object.tint,
        blendMode: object.blendMode,
        texture: this.object.texture.textureCacheIds[0],
      },
    );
  }

  update() {
    super.update();

    if (!this.__visible) return;

    const lt = new PIXI.Point(this.object.leftWidth, this.object.topHeight);
    const rt = new PIXI.Point(this.object.width - this.object.rightWidth, this.object.topHeight);
    const rb = new PIXI.Point(this.object.width - this.object.rightWidth, this.object.height - this.object.bottomHeight);
    const lb = new PIXI.Point(this.object.leftWidth, this.object.height - this.object.bottomHeight);

    this.debugGraphics.lineStyle(1, 0x000000, 1);
    this.debugGraphics.beginFill(0, 0);

    const start = this.debugGraphics.toLocal(lb, this.object);
    this.debugGraphics.moveTo(start.x, start.y);

    [lt, rt, rb, lb].forEach((local) => {
      const pos = this.debugGraphics.toLocal(local, this.object);
      this.debugGraphics.lineTo(pos.x, pos.y);
    });
  }
}

module.exports = { NineSlicePlaneController };
