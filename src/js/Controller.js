const _ = require('lodash');
const path = require('path');
const { GUI } = require('dat.gui');
const configMap = require(path.resolve(process.cwd(), 'js'));

class Controller {
  constructor(object) {
    const config = configMap[object.constructor.name];
    this.gui = new GUI();
    this.object = object;

    config.getFields(object).forEach((field) => {
      const descriptor = field.descriptor || {
        set: (value) => {
          _.set(object, field.prop, value);
          this.gui.updateDisplay();
        },
        get: () => {
          return _.get(object, field.prop);
        },
      };

      const context = {};
      Object.defineProperty(context, field.prop, descriptor);

      const controller = field.color ? this.gui.addColor(context, field.prop) : this.gui.add(context, field.prop, field.list);
      ['name', 'min', 'max', 'step'].forEach((v) => v in field && controller[v](field[v]));
    });
  }

  destroy() {
    this.gui.destroy();
  }
}

module.exports = { Controller };
