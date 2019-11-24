const {debugPosition} = require('./common');

module.exports = class ContainerComponent {
  constructor() {
    this.type = 'Container';
  }

  createView() {
    return new PIXI.Container();
  }

  getInitialModel() {
    return {
      name: '',
      x: 0,
      y: 0,
      scale: {x: 1, y: 1},
      pivot: {x: 0, y: 0},
      angle: 0,
      alpha: 1,
      visible: true,
      parent: '',
    };
  }

  getControls() {
    return [
      {prop: 'name'},
      {prop: 'x', step: 1},
      {prop: 'y', step: 1},
      {prop: 'scale.x'},
      {prop: 'scale.y'},
      {prop: 'pivot.x', step: 1},
      {prop: 'pivot.y', step: 1},
      {prop: 'angle'},
      {prop: 'alpha', min: 0, max: 1},
      {prop: 'visible'},
    ];
  }

  render(view, model, prevModel = {}) {
    view.x = model.x;
    view.y = model.y;
    view.scale.x = model.scale.x;
    view.scale.y = model.scale.y;
    view.pivot.x = model.pivot.x;
    view.pivot.y = model.pivot.y;
    view.angle = model.angle;
    view.alpha = model.alpha;
    view.visible = model.visible;
  }

  debug(view, graphics) {
    debugPosition(view, graphics);
  }
};
