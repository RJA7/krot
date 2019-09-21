const { ContainerController } = require('./container-controller');
const { createControllerBuilder } = require('./builder');

class GraphicsController extends ContainerController {
  constructor(gui, getTreeHash, debugGraphics) {
    super(gui, getTreeHash, debugGraphics);

    this.object.rectProps = '0,0,100,100,0x000000,0.6';

    [
      { prop: 'tint', defaults: 0xffffff, color: true },
      { prop: 'blendMode', defaults: PIXI.BLEND_MODES.NORMAL, list: PIXI.BLEND_MODES },
      { prop: 'interactive', defaults: false },
      { prop: 'buttonMode', defaults: false },
      { prop: 'rectProps', defaults: '0,0,100,100,0x000000,0.6' },
    ].forEach(createControllerBuilder(this, this.generalFolder));
  }

  set rectProps(v) {
    const [x, y, w, h, color, alpha] = v.split(',').map((v) => Number(v));
    this.object.clear();
    this.object.beginFill(color, alpha);
    this.object.drawRect(x, y, w, h);
  }

  get rectProps() {
    return this.object.rectProps;
  }

  getSaveObject(object) {
    return Object.assign(
      {},
      super.getSaveObject(object),
      {
        type: 'Graphics',
        tint: object.tint,
        blendMode: object.blendMode,
        interactive: object.interactive,
        buttonMode: object.buttonMode,
        rectProps: object.rectProps,
      },
    );
  }
}

module.exports = { GraphicsController };
