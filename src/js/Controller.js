const {GUI} = require('dat.gui');

class Controller {
  constructor(component) {
    this.gui = new GUI();
    this.gui.width = 300;

    const context = {};

    component
      .getControls()
      .forEach((control) => {
        const descriptor = control.descriptor || this.createRegularDescriptor(control);
        Object.defineProperty(context, control.prop, descriptor);

        const controller = control.color ?
          this.gui.addColor(context, control.prop) :
          this.gui.add(context, control.prop, control.list);

        ['name', 'min', 'max'].forEach((v) => v in control && controller[v](control[v]));

        if (typeof controller.step === 'function') {
          controller.step(control.step || app.data.controlStep);
        }
      });
  }

  createRegularDescriptor(control) {
    return {
      set: (value) => {
        const index = app.getModelIndex();
        const data = {...app.data};
        _.setWith(data, `list[${index}].${control.prop}`, value, _.clone);
        app.setData(data);
      },
      get: () => {
        return _.get(app.getModel(), control.prop);
      },
    };
  }

  destroy() {
    this.gui && this.gui.destroy();
    this.gui = null;
  }
}

module.exports = {Controller};
