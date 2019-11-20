const floatPrecision = 0.001;

const getParentField = () => ({
  prop: 'parent',

  list: (() => {
    const filterHash = {[krot.data.modelId]: true};

    return krot.data.list
      .filter((model) => {
        if (filterHash[model.parent]) {
          filterHash[model.id] = true;
          return false;
        }

        return true;
      })
      .map((model) => model.name);
  })(),

  descriptor: {
    set: (parentName) => {
      const parentModel = krot.data.list.find((m) => m.name === parentName);
      krot.updateItem({parent: parentModel.id});
    },
    get: () => {
      const model = krot.getModel();
      const parentModel = krot.getModel(model.parent);
      return parentModel.name;
    },
  },
});

const debugPosition = (view, graphics) => {
  const position = graphics.toLocal(view, view.parent);
  graphics.beginFill(0xA9B7C6, 1);
  graphics.drawCircle(position.x, position.y, 4);
  graphics.endFill();
};

module.exports = {
  floatPrecision,
  getParentField,
  debugPosition,
};
