import { GroupController } from "./group-controller";
import { createControllerBuilder } from "./builder";

export class DisplayController extends GroupController {
  constructor(gui, getTreeHash, debugGraphics) {
    super(gui, getTreeHash, debugGraphics);

    [
      {prop: "anchor.x", defaults: 0, step: 0.01},
      {prop: "anchor.y", defaults: 0, step: 0.01},
      {prop: "inputEnabled", defaults: false},
      {prop: "scaleOnClick", defaults: false},
    ].forEach(createControllerBuilder(this, this.generalFolder));
  }

  getSaveObject(object) {
    return {
      ...super.getSaveObject(object),
      anchor: {x: object.anchor.x, y: object.anchor.y},
      inputEnabled: object.inputEnabled || false,
      scaleOnClick: object.scaleOnClick || false,
    };
  }
}
