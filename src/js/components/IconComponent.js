const {floatPrecision} = require('./common');

module.exports = class IconComponent {
  getInitialModel() {
    return {
      key: '',
      x: '',
      y: '',
      scale: {x: 1, y: 1},
      texture: '',
    };
  }

  addDescriptor(control, iconIndex) {
    control.descriptor = control.descriptor || {
      set(value) {
        const model = app.getModel();
        const iconIndex = model.icons.find((ic, i) => i === iconIndex);
        const icons = [...model.icons];

        _.setWith(icons, `[${iconIndex}].${control.prop}`, value);
        app.updateItem({icons});
      },
      get() {
        const model = app.getModel();
        return _.get(model, `icons[${iconIndex}].${control.prop}`);
      },
    };
  }

  getControls() {
    const iconIndex = app.data.minorComponentData;

    const controls = [
      {prop: 'key'},
      {prop: 'x'},
      {prop: 'y'},
      {prop: 'scale.x', floatPrecision},
      {prop: 'scale.y', floatPrecision},
      {
        prop: 'texture',
        descriptor: {
          set(texture) {
            const model = app.getModel();

            app.updateItem({
              icons: model.icons.map((ic, i) => i === iconIndex ? {...ic, texture} : ic),
            });
          },
          get() {
            const model = app.getModel();
            const icon = model.icons[iconIndex];

            return icon.texture;
          },
        },
      },
      {
        prop: 'remove', descriptor: {
          value() {
            const model = app.getModel();
            app.setData({minorComponent: null}, true);
            app.updateItem({icons: model.icons.filter((ic, i) => i !== iconIndex)});
          },
        },
      },
    ];

    controls.forEach((control) => this.addDescriptor(control, iconIndex));

    return controls;
  }
};
