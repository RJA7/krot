const _ = require('lodash');
const {GUI} = require('dat.gui');

class Controller {
  constructor(component) {
    this.gui = new GUI();
    this.gui.width = 300;

    component
      .getControls()
      .forEach((field) => {
        const descriptor = field.descriptor || {
          set: (value) => {
            const index = krot.getModelIndex();
            const data = {...krot.data};
            _.setWith(data, ['list', index, field.prop], value, _.clone);
            krot.setData(data);
          },
          get: () => {
            return _.get(krot.getModel(), field.prop);
          },
        };

        const context = {};
        Object.defineProperty(context, field.prop, descriptor);

        const controller = field.color ? this.gui.addColor(context, field.prop) : this.gui.add(context, field.prop, field.list);
        ['name', 'min', 'max', 'step'].forEach((v) => v in field && controller[v](field[v]));
      });
  }

  destroy() {
    this.destroy = () => void 0;
    this.gui.destroy();
  }
}

module.exports = {Controller};
