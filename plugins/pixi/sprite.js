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
      { prop: 'width', step: 1 },
      { prop: 'height', step: 1 },
      { prop: 'angle', step: floatPrecision },
      { prop: 'alpha', min: 0, max: 1, step: floatPrecision },
      { prop: 'visible' },
      { prop: 'tint', color: true },
      { prop: 'blendMode', list: PIXI.BLEND_MODES },
      { prop: 'interactive' },
      { prop: 'buttonMode' },
      getParentField(object),
      {
        prop: 'texture',
        descriptor: {
          set: (v) => {
            object.texture = new PIXI.Texture.from(v);
            krot.controller.gui.updateDisplay();
          },

          get: () => {
            return object.texture.textureCacheIds[0] || '';
          },
        },
      },
    ];
  },

  debug: (object, graphics) => {
    debugPosition(object, graphics);
  },
};
