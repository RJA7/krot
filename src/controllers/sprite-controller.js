import { createControllerBuilder } from "./builder";
import { DisplayController } from "./display-controller";

export class SpriteController extends DisplayController {
  constructor(gui, getTreeHash, debugGraphics) {
    super(gui, getTreeHash, debugGraphics);

    [
      {prop: "frameName", defaults: ""},
    ].forEach(createControllerBuilder(this, this.generalFolder));
  }

  getSaveObject(object) {
    return {
      ...super.getSaveObject(object),
      type: "Sprite",
      frameName: object.frameName,
    };
  }
}
