const {GroupController} = require("./group-controller");
const {createControllerBuilder} = require('./builder');

class DisplayController extends GroupController {
  constructor(gui, getTreeHash, debugGraphics) {
    super(gui, getTreeHash, debugGraphics);

    [
      {prop: "anchor.x", defaults: 0, step: 0.001},
      {prop: "anchor.y", defaults: 0, step: 0.001},
      {prop: "inputEnabled", defaults: false},
      {prop: "scaleOnClick", defaults: false},
    ].forEach(createControllerBuilder(this, this.generalFolder));
  }

  getSaveObject(object) {
    return Object.assign(
      {},
      super.getSaveObject(object),
      {
        anchor: {x: object.anchor.x, y: object.anchor.y},
        inputEnabled: object.inputEnabled || false,
        scaleOnClick: object.scaleOnClick || false,
      },
    );
  }
}

module.exports = {DisplayController};
