const {GUI} = require('dat.gui');

module.exports = class MetaController {
  constructor() {
    this.gui = new GUI();

    this.gui.add(this, 'step', [10, 1, 0.1, 0.01, 0.001]);
    this.gui.add(this, 'debug');
    this.gui.add(this, 'align');

    const widthControl = this.gui.add(this, 'width');
    const heightControl = this.gui.add(this, 'height');

    widthControl.min(0);
    heightControl.min(0);
    widthControl.step(1);
    heightControl.step(1);
  }

  get debug() {
    return app.data.debug;
  }

  set debug(value) {
    app.setData({debug: value});
  }

  align() {
    app.renderer.align();
  }

  get step() {
    return app.data.controlStep;
  }

  set step(value) {
    app.setData({controlStep: value});
  }

  get width() {
    return app.data.width;
  }

  set width(value) {
    app.setData({width: value});
  }

  get height() {
    return app.data.height;
  }

  set height(value) {
    app.setData({height: value});
  }
};
