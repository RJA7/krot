const stringifyObject = require('stringify-object');

const template = ({ data, fields }) => `const { populate } = require('krot-pixi');

const raw = ${stringifyObject(data)};

class Layout {
  constructor(filter) {
${fields.map(name => `    this.${name} = null;`).join('\n')}

    populate(this, raw, filter);
  }
}

module.exports = { Layout, raw };
`;

module.exports = { template };
