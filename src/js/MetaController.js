const {GUI} = require('dat.gui');

module.exports = class MetaController {
  constructor() {
    this.gui = new GUI();

    this.gui.add(this, 'step', [10, 1, 0.1, 0.01, 0.001]);
    this.gui.add(this, 'debug');
    this.gui.add(this, 'align');

    ['width', 'height'].forEach((prop) => {
      const control = this.gui.add(this, prop);
      control.min(0);
      control.step(1);
      control.onFinishChange(() => app.putHistoryIfChanged());
    });

    app.onDataChange.add(() => this.gui.updateDisplay());
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
    app.setData({controlStep: Number(value)});
  }

  get width() {
    return app.data.width;
  }

  set width(value) {
    app.setData({width: value}, true);
  }

  get height() {
    return app.data.height;
  }

  set height(value) {
    app.setData({height: value}, true);
  }
};
