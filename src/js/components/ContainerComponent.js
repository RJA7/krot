const {floatPrecision, getParentField, debugPosition} = require('./common');

module.exports = class ContainerComponent {
  constructor() {
    this.type = 'Container';
  }

  getInitialModel() {
    return {
      x: 0,
      y: 0,
      scale: {x: 0, y: 0},
      angle: 0,
      alpha: 1,
      visible: true,
    };
  }

  getControls() {
    return [
      {prop: 'name'},
      {prop: 'x', step: 1},
      {prop: 'y', step: 1},
      {prop: 'scale.x', step: floatPrecision},
      {prop: 'scale.y', step: floatPrecision},
      {prop: 'angle', step: floatPrecision},
      {prop: 'alpha', min: 0, max: 1, step: floatPrecision},
      {prop: 'visible'},
      getParentField(),
    ];
  }

  render(view, model, prevModel) {
    view.x = model.x;
    view.y = model.y;
    view.scale.x = model.scale.x;
    view.scale.y = model.scale.y;
    view.angle = model.angle;
    view.alpha = model.alpha;
    view.visible = model.visible;

    if (model.parent !== prevModel.parent) {
      const parent = krot.getModel(model.parent);
      parent.addChild(view);
    }
  }

  debug(object, graphics) {
    debugPosition(object, graphics);
  }
};
