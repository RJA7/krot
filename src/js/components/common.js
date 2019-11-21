const floatPrecision = 0.001;

const debugPosition = (view, graphics) => {
  const position = graphics.toLocal(view, view.parent);
  graphics.beginFill(0xA9B7C6, 1);
  graphics.drawCircle(position.x, position.y, 4);
  graphics.endFill();
};

const addRegularDescriptor = (control) => {
  control.descriptor = control.descriptor || {
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
};

module.exports = {
  floatPrecision,
  debugPosition,
  addRegularDescriptor,
};
