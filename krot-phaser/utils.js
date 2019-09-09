let frameNameKeyMap = {};

const refreshFrameNameKeyMap = () => {
  const keys = game.cache.getKeys(Phaser.Cache.IMAGE);
  frameNameKeyMap = {};

  for (let i = 0, iLen = keys.length; i < iLen; i++) {
    const frameData = game.cache.getFrameData(keys[i]);
    const frames = frameData.getFrames();

    for (let j = 0, jLen = frames.length; j < jLen; j++) {
      frameNameKeyMap[frames[j].name] = keys[i];
    }
  }
};

const getKeyAndFrameName = (keyOrFrameName) => {
  const keys = game.cache.getKeys(Phaser.Cache.IMAGE);

  if (keyOrFrameName === "__missing") {
    return [keyOrFrameName, "null"];
  }

  if (keys.includes(keyOrFrameName)) {
    const image = game.cache.getImage(keyOrFrameName, Phaser.Cache.IMAGE);
    return [keyOrFrameName, image.frameData.getFrame(0).name];
  }

  if (!frameNameKeyMap[keyOrFrameName]) {
    refreshFrameNameKeyMap();
  }

  if (frameNameKeyMap[keyOrFrameName]) {
    return [frameNameKeyMap[keyOrFrameName], keyOrFrameName];
  }

  return null;
};

const getImageByTextureName = (textureName) => {
  const keys = game.cache.getKeys(Phaser.Cache.IMAGE);

  if (textureName === "__missing" || keys.includes(textureName)) {
    return game.cache.getImage(textureName, Phaser.Cache.IMAGE);
  }

  for (let i = 0, l = keys.length; i < l; i++) {
    const image = game.cache.getImage(keys[i], Phaser.Cache.IMAGE);
    const frame = image.frameData.getFrameByName(textureName);

    if (frame) {
      return image;
    }
  }

  return null;
};

module.exports = {getKeyAndFrameName, getImageByTextureName};
