const {DisplayController} = require('./display-controller');
const {createControllerBuilder} = require('./builder');
const PIXI = require('pixi.js');

const fontWeights = [
  'normal', 'bold', 'bolder', 'lighter', '100', '200', '300', '400', '500', '600', '700', '800', '900',
];

const baseLines = ['top', 'hanging', 'middle', 'alphabetic', 'ideographic', 'bottom'];

class TextController extends DisplayController {
  constructor(gui, getTreeHash, debugGraphics) {
    super(gui, getTreeHash, debugGraphics);

    this.styleFolder = gui.addFolder('Style');
    this.folders.push(this.styleFolder);
    this.object.text = '';

    this.object.style = new PIXI.TextStyle();

    [
      {prop: 'text', defaults: ''},
    ].forEach(createControllerBuilder(this, this.generalFolder));

    [
      {prop: 'align', defaults: 'left', list: ['left', 'center', 'right']},
      {prop: 'breakWords', defaults: false},
      {prop: 'dropShadow', defaults: false},
      {prop: 'dropShadowAlpha', defaults: false, min: 0, max: 1},
      {prop: 'dropShadowAngle', defaults: Number((Math.PI / 6).toFixed(2))},
      {prop: 'dropShadowBlur', defaults: 0, round: true},
      {prop: 'dropShadowColor', defaults: 'black'},
      {prop: 'dropShadowDistance', defaults: 5, round: true},
      {prop: 'fill', defaults: 'black'},
      {prop: 'fontFamily', defaults: 'Arial'},
      {prop: 'fontSize', defaults: 26, round: true},
      {prop: 'fontStyle', defaults: 'normal', list: ['normal', 'italic', 'oblique']},
      {prop: 'fontVariant', defaults: 'normal', list: ['normal', 'small-caps']},
      {prop: 'fontWeight', defaults: 'normal', list: fontWeights},
      {prop: 'leading', defaults: 0, round: true},
      {prop: 'letterSpacing', defaults: 0, round: true},
      {prop: 'lineHeight', round: true},
      {prop: 'lineJoin', defaults: 'miter', list: ['miter', 'round', 'bevel']},
      {prop: 'miterLimit', defaults: 10, round: true},
      {prop: 'padding', defaults: 0, round: true},
      {prop: 'stroke', defaults: 'black'},
      {prop: 'strokeThickness', defaults: 0, round: true},
      {prop: 'trim', defaults: false},
      {prop: 'textBaseline', defaults: 'alphabetic', list: baseLines},
      {prop: 'whiteSpace', defaults: 'pre', list: ['normal', 'pre', 'pre-line']},
      {prop: 'wordWrap', defaults: false},
      {prop: 'wordWrapWidth', defaults: 100, round: true},
    ].forEach(createControllerBuilder(this, this.styleFolder, 'style.'));
  }

  setObject(object) {
    super.setObject(object);
    this.styleFolder.updateDisplay();
  }

  set text(v) {
    this.object.text = v.replace(/\\n/g, '\n');
  }

  get text() {
    return this.object.text.replace(/\n/g, '\\n');
  }

  getSaveObject(object) {
    return Object.assign(
      {},
      super.getSaveObject(object),
      {
        type: 'Text',
        text: object.text,

        style: {
          align: object.style.align,
          breakWords: object.style.breakWords,
          dropShadow: object.style.dropShadow,
          dropShadowAlpha: object.style.dropShadowAlpha,
          dropShadowAngle: object.style.dropShadowAngle,
          dropShadowBlur: object.style.dropShadowBlur,
          dropShadowColor: object.style.dropShadowColor,
          dropShadowDistance: object.style.dropShadowDistance,
          fill: object.style.fill,
          fontFamily: object.style.fontFamily,
          fontSize: object.style.fontSize,
          fontStyle: object.style.fontStyle,
          fontVariant: object.style.fontVariant,
          fontWeight: object.style.fontWeight,
          leading: object.style.leading,
          letterSpacing: object.style.letterSpacing,
          lineHeight: object.style.lineHeight,
          lineJoin: object.style.lineJoin,
          miterLimit: object.style.miterLimit,
          padding: object.style.padding,
          stroke: object.style.stroke,
          strokeThickness: object.style.strokeThickness,
          trim: object.style.trim,
          textBaseline: object.style.textBaseline,
          whiteSpace: object.style.whiteSpace,
          wordWrap: object.style.wordWrap,
          wordWrapWidth: object.style.wordWrapWidth,
        },
      },
    );
  }

  update() {
    super.update();

    if (!this.__visible) return;

    const object = this.object;
    this.debugGraphics.beginFill(0, 0);

    // Bounds
    {
      const localLT = new PIXI.Point(-object.anchor.x * object.canvas.width, -object.anchor.y * object.canvas.height);
      const localRB = new PIXI.Point((1 - object.anchor.x) * object.canvas.width, (1 - object.anchor.y) * object.canvas.height);
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

module.exports = {TextController};
