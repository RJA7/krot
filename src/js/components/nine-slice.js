const {floatPrecision, getParentField, debugPosition} = require('./common');

module.exports = {
  getControls: (object) => {
    return [
      {prop: 'name'},
      {prop: 'x', step: 1},
      {prop: 'y', step: 1},
      {prop: 'scale.x', step: floatPrecision},
      {prop: 'scale.y', step: floatPrecision},
      {prop: 'width', step: 1},
      {prop: 'height', step: 1},
      {prop: 'leftWidth', step: 1},
      {prop: 'topHeight', step: 1},
      {prop: 'rightWidth', step: 1},
      {prop: 'bottomHeight', step: 1},
      {prop: 'angle', step: floatPrecision},
      {prop: 'alpha', min: 0, max: 1, step: floatPrecision},
      {prop: 'visible'},
      {prop: 'tint', color: true},
      {prop: 'blendMode', list: PIXI.BLEND_MODES},
      {prop: 'interactive'},
      {prop: 'buttonMode'},
      getParentField(object),
      {
        prop: 'texture',
        descriptor: {
          set: (v) => {
            object.texture = new PIXI.Texture.from(v);
            object.width = object.texture.width;
            object.height = object.texture.height;
            krot.controller.gui.updateDisplay();
          },

          get: () => {
            return object.texture.textureCacheIds[0];
          },
        },
      },
    ];
  },

  debug: (object, graphics) => {
    const lt = new PIXI.Point(object.leftWidth, object.topHeight);
    const rt = new PIXI.Point(object.width - object.rightWidth, object.topHeight);
    const rb = new PIXI.Point(object.width - object.rightWidth, object.height - object.bottomHeight);
    const lb = new PIXI.Point(object.leftWidth, object.height - object.bottomHeight);

    graphics.lineStyle(1, 0xA9B7C6, 1);
    graphics.beginFill(0, 0);

    const start = graphics.toLocal(lb, object);
    graphics.moveTo(start.x, start.y);

    [lt, rt, rb, lb].forEach((local) => {
      const pos = graphics.toLocal(local, object);
      graphics.lineTo(pos.x, pos.y);
    });

    debugPosition(object, graphics);
  },
};
