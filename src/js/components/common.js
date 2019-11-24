const debugPosition = (view, graphics) => {
  const position = graphics.toLocal(view, view.parent);
  graphics.beginFill(0xA9B7C6, 1);
  graphics.drawCircle(position.x, position.y, 4);
  graphics.endFill();
};

module.exports = {
  debugPosition,
};
