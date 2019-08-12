const {ContainerController} = require('./container-controller');
const {createControllerBuilder} = require('./builder');

class DisplayController extends ContainerController {
  constructor(gui, getTreeHash, debugGraphics) {
    super(gui, getTreeHash, debugGraphics);

    [
      {prop: 'anchor.x', defaults: 0},
      {prop: 'anchor.y', defaults: 0},
      {prop: 'interactive', defaults: false},
    ].forEach(createControllerBuilder(this, this.generalFolder));
  }

  getSaveObject(object) {
    return Object.assign(
      {},
      super.getSaveObject(object),
      {
        anchor: {x: object.anchor.x, y: object.anchor.y},
        interactive: object.interactive,
      },
    );
  }
}

module.exports = {DisplayController};
