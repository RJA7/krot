const {ContainerController} = require('./container-controller');
const {createControllerBuilder} = require('./builder');

class DisplayController extends ContainerController {
  constructor(gui, getTreeHash, debugGraphics) {
    super(gui, getTreeHash, debugGraphics);

    [
      {prop: 'anchor.x', defaults: 0, step: 0.01},
      {prop: 'anchor.y', defaults: 0, step: 0.01},
      {prop: 'tint', defaults: 0xffffff, color: true},
      {prop: 'blendMode', defaults: PIXI.BLEND_MODES.NORMAL, list: PIXI.BLEND_MODES},
      {prop: 'interactive', defaults: false},
      {prop: 'buttonMode', defaults: false},
    ].forEach(createControllerBuilder(this, this.generalFolder));
  }

  getSaveObject(object) {
    return Object.assign(
      {},
      super.getSaveObject(object),
      {
        anchor: {x: object.anchor.x, y: object.anchor.y},
        interactive: object.interactive,
        buttonMode: object.buttonMode,
      },
    );
  }
}

module.exports = {DisplayController};
