const {DisplayController} = require("./display-controller");
const {createControllerBuilder} = require("./builder");

class SpriteController extends DisplayController {
  constructor(gui, getTreeHash, debugGraphics) {
    super(gui, getTreeHash, debugGraphics);

    [
      {prop: "textureName", defaults: ""},
    ].forEach(createControllerBuilder(this, this.generalFolder));
  }

  getSaveObject(object) {
    return Object.assign(
      {},
      super.getSaveObject(object),
      {
        type: "Sprite",
        textureName: object.textureName,
      },
    );
  }
}

module.exports = {SpriteController};
