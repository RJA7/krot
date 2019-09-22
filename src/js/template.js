const stringifyObject = require('stringify-object');

const template = ({ data, fields, classFields }) => `const { populate } = require('krot-pixi');

const rawUi = ${stringifyObject(data)};

class Layout {
  constructor(filter) {
${fields.map(name => `    this.${name} = null;`).join('\n')}`
  + (classFields.length ? '\n\n' : '') +
  `${classFields.map(name => `    this.${name} = [];`).join('\n')}

    populate(this, rawUi, filter);
  }
}

module.exports = { Layout, rawUi };
`;

module.exports = { template };
