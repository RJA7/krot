const {floatPrecision, getNameField, getParentField, debugPosition} = require('./common');

module.exports = {
  getControls(model) {
    return [
      getNameField(model),
      {prop: 'x', step: 1},
      {prop: 'y', step: 1},
      {prop: 'scale.x', step: floatPrecision},
      {prop: 'scale.y', step: floatPrecision},
      {prop: 'angle', step: floatPrecision},
      {prop: 'alpha', min: 0, max: 1, step: floatPrecision},
      {prop: 'visible'},
      getParentField(model),
    ];
  },

  render(view, model, prevModel) {
    view.x = model.x;
    view.y = model.y;
    view.scale.x = model.scale.x;
    view.scale.y = model.scale.y;
    view.angle = model.angle;
    view.alpha = model.alpha;
    view.visible = model.visible;

    if (model.texture !== prevModel.texture) {
      view.texture = PIXI.Texture.from(model.texture);
    }

    if (model.parent !== prevModel.parent) {
      const parent = krot.data.list.find((m) => m.id === model.parent);
      parent.addChild(view);
    }
  },

  debug: (object, graphics) => {
    debugPosition(object, graphics);
  },
};
