const defaultRaw = {
  width: 640,
  height: 960,
  list: [
    {
      Create: (PIXI) => new PIXI.Container(),
      name: 'root',
      class: '',
    },
  ],
};

module.exports = { defaultRaw };
