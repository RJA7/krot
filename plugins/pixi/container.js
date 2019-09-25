const { floatPrecision, getNameField, getClassField, getParentField, debugPosition } = require('./common');

module.exports = {
  getFields: (object) => {
    return [
      getNameField(object),
      getClassField(object),
      { prop: 'x', step: 1 },
      { prop: 'y', step: 1 },
      { prop: 'scale.x', step: floatPrecision },
      { prop: 'scale.y', step: floatPrecision },
      { prop: 'angle', step: floatPrecision },
      { prop: 'alpha', min: 0, max: 1, step: floatPrecision },
      { prop: 'visible' },
      getParentField(object),
    ];
  },

  debug: (object, graphics) => {
    debugPosition(object, graphics);
  },
};
