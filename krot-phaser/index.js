require("./nine-slice");
require("./sprite");
require("./text");

const utils = require("./utils");
const populate = require("./populate");
const textIcon = require("./text-icon");

module.exports = Object.assign({}, utils, populate, textIcon);
