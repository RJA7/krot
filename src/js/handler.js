const stringifyObject = require('stringify-object');

class Handler {
  constructor(setRawUi, ground) {
    this.setRawUi = setRawUi;
    this.ground = ground;
  }

  open() {
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.setAttribute('type', 'file');

    input.addEventListener('change', () => {
      document.body.removeChild(input);

      if (input.files.length === 0) return;

      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = () => {
        const result = reader.result;
        let rawUi = null;

        eval(`rawUi ${result.slice(result.indexOf('='), result.indexOf('import {'))}`);
        this.setRawUi(rawUi);
      };

      reader.readAsText(file, 'utf8');
    });

    input.click();
  }

  save() {
    const classHash = {};
    const hash = {};

    const writeClasses = (classes, name) => classes.forEach(className => {
      classHash[className] = classHash[className] || [];
      classHash[className].push(name);
    });

    const data = this.getRawUi(writeClasses, hash);
    const list = data.list;

    const getClassType = (className) => {
      const namesList = classHash[className];
      const hasContainer = namesList.find(name => hash[name].type === 'Container');
      const hasSprite = namesList.find(name => hash[name].type === 'Sprite');
      const hasText = namesList.find(name => hash[name].type === 'Text');

      return hasContainer || hasSprite && hasText ? 'Container' : hasSprite ? 'Sprite' : 'Text';
    };

    const fields = list.map(raw => raw.name);
    const classFields = Object.keys(classHash).filter(name => classHash[name].length !== 0);

    const encodedData = encodeURIComponent(
      `import { populate } from 'krot';

const rawUi = ${stringifyObject(data)};

export default class {
  constructor(filter) {
${fields.map(name => `    this.${name} = null;`).join('\n')}`
      + (classFields.length ? '\n\n' : '') +
      `${classFields.map(name => `    this.${name} = [];`).join('\n')}

    populate(this, rawUi, filter);
  }
}
`);

    const link = document.createElement('a');
    link.setAttribute('href', `data:text/js;charset=utf-8,${encodedData}`);
    link.setAttribute('download', `Layout.js`);
    link.click();
  }

  getRawUi(writeClasses = () => '', hash = {}) {
    const data = {
      width: this.ground.width,
      height: this.ground.height,
      list: [],
    };

    const stack = [this.ground.tree];

    while (stack.length) {
      const object = stack.shift();
      hash[object.name] = object.controller.getSaveObject(object);
      data.list.push(hash[object.name]);
      stack.push(...object.children);

      const classes = object.class.split(/\s+/).filter(v => v);
      writeClasses(classes, object.name);
    }

    return data;
  }
}

module.exports = {Handler};
