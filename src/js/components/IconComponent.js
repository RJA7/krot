const {floatPrecision} = require('./common');
const uuid = require('uuid/v4');

module.exports = class IconComponent {
  getInitialModel() {
    return {
      id: uuid(),
      name: '',
      x: '',
      y: '',
      scale: {x: 0, y: 0},
      texture: '',
    };
  }

  addDescriptors(control, iconId) {
    if (control.descriptor) return;

    control.descriptor = {
      set(value) {
        const model = krot.getModel();
        const iconIndex = model.icons.find((ic) => ic.id === iconId);
        const icons = [...model.icons];

        _.setWith(icons, `[${iconIndex}].${control.prop}`, value);
        krot.updateItem({icons});
      },
      get() {
        const model = krot.getModel();
        const iconIndex = model.icons.find((ic) => ic.id === iconId);

        return _.get(model, `icons[${iconIndex}].${control.prop}`);
      },
    };
  }

  getControls(iconId) {
    return [
      {prop: 'key'},
      {prop: 'x'},
      {prop: 'y'},
      {prop: 'scale.x', floatPrecision},
      {prop: 'scale.y', floatPrecision},
      {
        prop: 'texture',
        descriptor: {
          set(texture) {
            if (!PIXI.utils.TextureCache[texture]) return;

            const model = krot.getModel();
            krot.updateItem({icons: model.icons.map((ic) => ic.id === iconId ? {...ic, texture} : ic)});
          },
          get() {
            const model = krot.getModel();
            const icon = model.icons.find((ic) => ic.id === iconId);

            return icon.texture;
          },
        },
      },
      {
        prop: 'remove', descriptor: {
          value() {
            const model = krot.getModel();
            krot.updateItem({icons: model.icons.filter((ic) => ic.id !== iconId)});
          },
        },
      },
    ].map((control) => this.addDescriptors(control, iconId));
  }
};
