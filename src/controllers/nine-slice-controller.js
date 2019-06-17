import { getImageByKeyOrFrameName } from "../../../cookie-crush-2/lib/krot/utils";
import { DisplayController } from "./display-controller";
import { createControllerBuilder } from "./builder";

export class NineSliceController extends DisplayController {
  constructor(gui, getTreeHash, debugGraphics) {
    super(gui, getTreeHash, debugGraphics);

    [
      {prop: "frameName", defaults: ""},
      {prop: "x0", defaults: 0},
      {prop: "y0", defaults: 0},
      {prop: "x1", defaults: 0},
      {prop: "y1", defaults: 0},
    ].forEach(createControllerBuilder(this, this.generalFolder));
  }

  getSaveObject(object) {
    return {
      ...super.getSaveObject(object),
      type: "NineSlice",
      frameName: object.frameName,
      x0: object.x0,
      x1: object.x1,
      y0: object.y0,
      y1: object.y1,
    };
  }

  update() {
    super.update();

    if (!this.__visible || !this.object.alive) return;

    const object = this.object;
    const frameName = object.originFrameName;
    const image = getImageByKeyOrFrameName(frameName);

    if (!image) return;

    const frame = image.frameData.getFrameByName(frameName) || image.frameData.getFrame(0);
    const lw = frame.sourceSizeW;
    const lh = frame.sourceSizeH;
    const w = object.width / object.scale.x;
    const h = object.height / object.scale.y;
    this.debugGraphics.beginFill(0, 0);

    const [lt, rt, rb, lb] = [
      [object.x0, object.y0], // x0 y0
      [w - (lw - object.x1), object.y0], // x1 y0
      [w - (lw - object.x1), h - (lh - object.y1)], // x1 y1
      [object.x0, h - (lh - object.y1)], // x0 y1
    ].map(([x, y]) => {
      x -= object.anchor.x * w;
      y -= object.anchor.y * h;

      return this.debugGraphics.toLocal(new PIXI.Point(x, y), object);
    });

    [
      [3, 0x000000, 1],
      [1, 0xffffff, 1],
    ].forEach(style => {
      this.debugGraphics.lineStyle(...style);
      this.debugGraphics.moveTo(lt.x, lt.y);
      this.debugGraphics.lineTo(rt.x, rt.y);
      this.debugGraphics.lineTo(rb.x, rb.y);
      this.debugGraphics.lineTo(lb.x, lb.y);
      this.debugGraphics.lineTo(lt.x, lt.y);
    });
  }
}
