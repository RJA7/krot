import { createControllerBuilder } from "./builder";
import { DisplayController } from "./display-controller";
import { TextIconController } from "./text-icon-controller";
import { TextIcon } from "../../../cookie-crush-2/lib/krot/text-icon";
import { fonts } from "../config";

export class TextController extends DisplayController {
  constructor(gui, getTreeHash, debugGraphics) {
    super(gui, getTreeHash, debugGraphics);

    this.textFolder = gui.addFolder("Text");
    this.iconFolder = null;
    this.styleFolder = gui.addFolder("Style");
    this.folders.push(this.textFolder, this.styleFolder);
    this.object.fontSize = 60;
    this.object.text = "";
    this.object.icon = {};
    this.object.padding = {x: 0, y: 0};

    this.iconController = new TextIconController(() => this.refreshIconsFolder());

    this.object.style = {
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      shadowColor: "#000000",
      shadowBlur: 0,
      shadowStroke: true,
      shadowFill: true,
    };

    [
      {prop: "text", defaults: ""},
      {prop: "maxWidth", min: 10, step: 1, defaults: 100, round: true},
      {prop: "maxHeight", min: 10, step: 1, defaults: 100, round: true},
      {prop: "paddingX", defaults: 0, round: true},
      {prop: "paddingY", defaults: 0, round: true},
    ].forEach(createControllerBuilder(this, this.textFolder));

    [
      {prop: "align", defaults: "left", list: ["left", "center", "right"]},
      {prop: "lineSpacing", defaults: 0, round: true},
      {prop: "fill", defaults: "#000000"},
      {prop: "stroke", defaults: "#000000"},
      {prop: "strokeThickness", min: 0, defaults: 0, round: true},
      {prop: "wordWrap", defaults: false},
      {prop: "maxFontSize", min: 1, max: 200, step: 1, defaults: 60, round: true},
      {prop: "font", defaults: "Arial", list: fonts.map(font => `'${font}'`)},
      {prop: "fontWeight", defaults: "normal", list: ["normal", "bold", "bolder", "lighter"]},
      {prop: "fontStyle", defaults: "normal", list: ["normal", "italic", "oblique"]},

      {prop: "shadowOffsetX", defaults: 0, round: true},
      {prop: "shadowOffsetY", defaults: 0, round: true},
      {prop: "shadowBlur", min: 0, defaults: 0, round: true},
      {prop: "shadowColor", defaults: "#ffffff"},
      {prop: "shadowStroke", defaults: true},
      {prop: "shadowFill", defaults: true},
    ].forEach(createControllerBuilder(this, this.styleFolder));
  }

  setObject(object) {
    super.setObject(object);
    this.styleFolder.updateDisplay();
    this.textFolder.updateDisplay();
    this.refreshIconsFolder();
  }

  hide() {
    super.hide();
    this.iconController.hide();
  }

  refreshIconsFolder() {
    this.iconFolder && this.generalFolder.removeFolder(this.iconFolder);
    this.iconFolder = this.generalFolder.addFolder("Icons");
    this.iconFolder.open();

    const addNewKey = "+ Add New Icon +";

    this.iconFolder.add({
      [addNewKey]: () => {
        let i = 0;
        let iconKey = `icon_${i}`;

        while (this.object.icon[iconKey]) {
          iconKey = `icon_${++i}`;
        }

        this.object.icon[iconKey] = new TextIcon("__missing");

        this.refreshIconsFolder();
        this.iconController.setObject(this.object, iconKey);
      }
    }, addNewKey);

    Object.keys(this.object.icon).forEach(key => {
      this.iconFolder.add({
        [key]: () => {
          this.iconController.setObject(this.object, key);
        }
      }, key);
    });
  }

  set text(v) {
    this.object.text = v.replace(/\\n/g, "\n");
  }

  get text() {
    return this.object.text;
  }

  iconToJSON(icon) {
    return JSON.stringify(
      Object.keys(icon).reduce((acc, key) => {
        const value = icon[key];
        acc[key] = {texture: value.texture};
        value.x ? acc[key].x = value.x : "";
        value.y ? acc[key].y = value.y : "";
        value.scaleX !== 1 ? acc[key].scaleX = value.scaleX : "";
        value.scaleY !== 1 ? acc[key].scaleY = value.scaleY : "";

        return acc;
      }, {}),
    );
  }

  get paddingX() {
    return this.object.padding.x;
  }

  set paddingX(v) {
    this.object.padding.x = Math.round(v);
    this.object.dirty = true;
  }

  get paddingY() {
    return this.object.padding.y;
  }

  set paddingY(v) {
    this.object.padding.y = Math.round(v);
    this.object.dirty = true;
  }

  get shadowOffsetX() {
    return this.object.style.shadowOffsetX;
  }

  set shadowOffsetX(v) {
    this.object.style.shadowOffsetX = Math.round(v);
    this.object.dirty = true;
  }

  get shadowOffsetX() {
    return this.object.style.shadowOffsetX;
  }

  set shadowOffsetY(v) {
    this.object.style.shadowOffsetY = Math.round(v);
    this.object.dirty = true;
  }

  get shadowOffsetY() {
    return this.object.style.shadowOffsetY;
  }

  set shadowColor(v) {
    this.object.style.shadowColor = v;
    this.object.dirty = true;
  }

  get shadowColor() {
    return this.object.style.shadowColor;
  }

  set shadowBlur(v) {
    this.object.style.shadowBlur = Math.round(v);
    this.object.dirty = true;
  }

  get shadowBlur() {
    return this.object.style.shadowBlur;
  }

  set shadowStroke(v) {
    this.object.style.shadowStroke = v;
    this.object.dirty = true;
  }

  get shadowStroke() {
    return this.object.style.shadowStroke;
  }

  set shadowFill(v) {
    this.object.style.shadowFill = v;
    this.object.dirty = true;
  }

  get shadowFill() {
    return this.object.style.shadowFill;
  }

  getSaveObject(object) {
    return {
      ...super.getSaveObject(object),
      type: "Text",
      text: object.text,
      maxWidth: object.maxWidth,
      maxHeight: object.maxHeight,
      maxFontSize: object.maxFontSize,
      padding: {x: object.padding.x, y: object.padding.y},
      align: object.align,
      lineSpacing: object.lineSpacing,
      fill: object.fill,
      stroke: object.stroke,
      strokeThickness: object.strokeThickness,
      wordWrap: object.wordWrap,
      wordWrapWidth: object.maxWidth,
      font: object.font,
      fontWeight: object.fontWeight,
      fontStyle: object.fontStyle,
      icon: this.iconToJSON(object.icon),

      style: {
        shadowOffsetX: object.style.shadowOffsetX,
        shadowOffsetY: object.style.shadowOffsetY,
        shadowColor: object.style.shadowColor,
        shadowBlur: object.style.shadowBlur,
        shadowStroke: object.style.shadowStroke || false,
        shadowFill: object.style.shadowFill || false,
      },
    };
  }

  update() {
    super.update();

    if (!this.__visible || !this.object.alive) return;

    const object = this.object;
    this.debugGraphics.beginFill(0, 0);

    // Bounds
    {
      const localLT = new Phaser.Point(-object.anchor.x * object.canvas.width, -object.anchor.y * object.canvas.height);
      const localRB = new Phaser.Point((1 - object.anchor.x) * object.canvas.width, (1 - object.anchor.y) * object.canvas.height);
      const lt = this.debugGraphics.toLocal(new PIXI.Point(localLT.x, localLT.y), object);
      const rt = this.debugGraphics.toLocal(new PIXI.Point(localRB.x, localLT.y), object);
      const rb = this.debugGraphics.toLocal(new PIXI.Point(localRB.x, localRB.y), object);
      const lb = this.debugGraphics.toLocal(new PIXI.Point(localLT.x, localRB.y), object);

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

    // Max width, height
    {
      const localLT = new Phaser.Point(-object.anchor.x * object.maxWidth, -object.anchor.y * object.maxHeight);
      const localRB = new Phaser.Point((1 - object.anchor.x) * object.maxWidth, (1 - object.anchor.y) * object.maxHeight);
      const lt = this.debugGraphics.toLocal(new PIXI.Point(localLT.x, localLT.y), object);
      const rt = this.debugGraphics.toLocal(new PIXI.Point(localRB.x, localLT.y), object);
      const rb = this.debugGraphics.toLocal(new PIXI.Point(localRB.x, localRB.y), object);
      const lb = this.debugGraphics.toLocal(new PIXI.Point(localLT.x, localRB.y), object);

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
}
