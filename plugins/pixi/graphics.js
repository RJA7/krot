const { floatPrecision, getNameField, getParentField, debugPosition } = require('./common');

module.exports = {
  getFields: (object) => {
    const redraw = () => {
      const overlay = object.raw.overlay;
      object.clear();
      overlay.fill && object.beginFill(overlay.color, overlay.alpha);
      overlay.strokeWidth && object.lineStyle(overlay.strokeWidth, overlay.color, overlay.alpha);
      object.drawRect(overlay.x, overlay.y, overlay.width, overlay.height);
    };

    if (!object.raw.overlay) {
      object.raw.overlay = {
        x: 0, y: 0, width: 640, height: 960, color: 0x000000, alpha: 1, fill: false, strokeWidth: 4,
      };
    }

    redraw();

    const createOverlayDescriptor = (prop) => ({
      set: (value) => {
        object.raw.overlay[prop] = value;
        redraw();
      },
      get: () => object.raw.overlay[prop],
    });

    return [
      getNameField(object),
      { prop: 'x', step: 1 },
      { prop: 'y', step: 1 },
      { prop: 'scale.x', step: floatPrecision },
      { prop: 'scale.y', step: floatPrecision },
      { prop: 'angle', step: floatPrecision },
      { prop: 'alpha', min: 0, max: 1, step: floatPrecision },
      { prop: 'visible' },
      { prop: 'tint', color: true },
      { prop: 'blendMode', list: PIXI.BLEND_MODES },
      { prop: 'interactive' },
      { prop: 'buttonMode' },
      getParentField(object),
      { prop: 'overlay.x', step: 1, descriptor: createOverlayDescriptor('x') },
      { prop: 'overlay.y', step: 1, descriptor: createOverlayDescriptor('y') },
      { prop: 'overlay.width', step: 1, min: 0, descriptor: createOverlayDescriptor('width') },
      { prop: 'overlay.height', step: 1, min: 0, descriptor: createOverlayDescriptor('height') },
      { prop: 'overlay.color', color: true, descriptor: createOverlayDescriptor('color') },
      { prop: 'overlay.alpha', min: 0, max: 1, step: floatPrecision, descriptor: createOverlayDescriptor('alpha') },
      { prop: 'overlay.fill', descriptor: createOverlayDescriptor('fill') },
      { prop: 'overlay.strokeWidth', step: 1, descriptor: createOverlayDescriptor('strokeWidth') },
    ];
  },

  debug: (object, graphics) => {
    debugPosition(object, graphics);
  },
};
