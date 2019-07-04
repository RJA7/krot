const WebpackDevServer = require("webpack-dev-server");
const config = require("./webpack.config");
const webpack = require("webpack");
const path = require("path");

const host = "localhost";
const port = 3001;

config.mode = "development";
config.entry.main.unshift(`webpack-dev-server/client?http://${host}:${port}/`);
config.output.publicPath = `http://${host}:${port}`;

const compiler = webpack(config);
const server = new WebpackDevServer(compiler, {
    hot: false,
    contentBase: [
      path.resolve(__dirname, "out"),
      path.resolve(__dirname, "../cookie-crush-2/BuildSource/assets/images"),
      path.resolve(__dirname, "../cookie-crush-2/BuildSource/assets/img"),
      path.resolve(__dirname, "../cookie-crush-2/BuildSource/assets/spritesheets"),
    ],
  }
);

server.listen(port);
