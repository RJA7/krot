const floatPrecision = 0.001;

const getNameField = (object) => ({
  prop: 'name',
  descriptor: {
    set: (value) => {
      if (!value || krot.hash[value]) return;
      object.name = value;
      krot.refreshTreeAndHash();
    },
    get: () => object.name,
  },
});

const getParentField = (model) => ({
  prop: 'parent',

  list: (() => {
    const filterHash = {[model.id]: true};

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
      const parentModel = krot.data.list.find((model) => model.name === parentName);
      krot.updateItem(model, {parent: parentModel.name});
    },

    get: () => model.parent,
  },
});

const debugPosition = (object, graphics) => {
  const position = graphics.toLocal(object, object.parent);
  graphics.beginFill(0xA9B7C6, 1);
  graphics.drawCircle(position.x, position.y, 4);
  graphics.endFill();
};

module.exports = {
  floatPrecision,
  getNameField,
  getParentField,
  debugPosition,
};
