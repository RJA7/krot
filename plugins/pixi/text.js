const { floatPrecision, getNameField, getParentField, debugPosition } = require('./common');

module.exports = {
  getFields: (object) => {
    return [
      getNameField(object),
      { prop: 'x', step: 1 },
      { prop: 'y', step: 1 },
      { prop: 'anchor.x', step: floatPrecision },
      { prop: 'anchor.y', step: floatPrecision },
      { prop: 'scale.x', step: floatPrecision },
      { prop: 'scale.y', step: floatPrecision },
      { prop: 'angle', step: floatPrecision },
      { prop: 'alpha', min: 0, max: 1, step: floatPrecision },
      { prop: 'visible' },
      { prop: 'blendMode', list: PIXI.BLEND_MODES },
      { prop: 'interactive' },
      { prop: 'buttonMode' },
      getParentField(object),
      {
        prop: 'text',
        descriptor: {
          set: (v) => {
            object.text = v.replace(/\\n/g, '\n');
          },

          get: () => {
            return object.text.replace(/\n/g, '\\n');
          },
        },
      },
      { prop: 'style.fontSize', name: 'fontSize', step: 1 },
      { prop: 'style.fontWeight', name: 'fontWeight', list: ['normal', 'bold', 'bolder', 'lighter'] },
      { prop: 'style.fontFamily', name: 'fontFamily', list: app.fonts },
      { prop: 'style.fill', name: 'fill' },
      { prop: 'style.stroke', name: 'stroke' },
      { prop: 'style.strokeThickness', name: 'strokeThickness', step: 1 },
      { prop: 'style.align', name: 'align', list: ['left', 'center', 'right'] },
      { prop: 'style.wordWrap', name: 'wrap' },
      { prop: 'style.wordWrapWidth', name: 'wrapWidth', step: 1 },
      { prop: 'style.breakWords', name: 'breakWords' },
      { prop: 'style.lineHeight', name: 'lineHeight', step: 1 },
      { prop: 'style.padding', name: 'padding', step: 1 },
      { prop: 'style.fontStyle', name: 'fontStyle', list: ['normal', 'italic', 'oblique'] },
      { prop: 'style.dropShadow', name: 'shadow' },
      { prop: 'style.dropShadowAlpha', name: 'shadowAlpha', min: 0, max: 1, step: floatPrecision },
      { prop: 'style.dropShadowAngle', name: 'shadowAngle', step: floatPrecision },
      { prop: 'style.dropShadowBlur', name: 'shadowBlur', step: 1 },
      { prop: 'style.dropShadowColor', name: 'shadowColor' },
      { prop: 'style.dropShadowDistance', name: 'shadowDistance', step: 1 },
      { prop: 'style.leading', name: 'leading', step: 1 },
      { prop: 'style.lineJoin', name: 'lineJoin', list: ['miter', 'round', 'bevel'] },
      { prop: 'style.miterLimit', name: 'miterLimit', step: 1 },
      { prop: 'style.trim', name: 'trim' },
      {
        prop: 'style.textBaseline',
        name: 'baseline',
        list: ['top', 'hanging', 'middle', 'alphabetic', 'ideographic', 'bottom'],
      },
      { prop: 'style.whiteSpace', name: 'whiteSpace', list: ['normal', 'pre', 'pre-line'] },
      { prop: 'style.fontVariant', name: 'fontVariant', list: ['normal', 'small-caps'] },
      { prop: 'style.letterSpacing', name: 'letterSpacing', step: 1 },
    ];
  },

  debug: (object, graphics) => {
    const localLT = new PIXI.Point(-object.anchor.x * object.canvas.width, -object.anchor.y * object.canvas.height);
    const localRB = new PIXI.Point((1 - object.anchor.x) * object.canvas.width, (1 - object.anchor.y) * object.canvas.height);
    const lt = graphics.toLocal(new PIXI.Point(localLT.x, localLT.y), object);
    const rt = graphics.toLocal(new PIXI.Point(localRB.x, localLT.y), object);
    const rb = graphics.toLocal(new PIXI.Point(localRB.x, localRB.y), object);
    const lb = graphics.toLocal(new PIXI.Point(localLT.x, localRB.y), object);

    graphics.lineStyle(1, 0xA9B7C6, 1);
    graphics.moveTo(lb.x, lb.y);
    [lt, rt, rb, lb].forEach((pos) => graphics.lineTo(pos.x, pos.y));

    debugPosition(object, graphics);
  },
};
