const path = require("path");
const { merge } = require("webpack-merge");
const base = require("./webpack.base.config");

module.exports = env => {
  return merge(base(env), {
    entry: {
        main: "./src/main.js",
        app: "./src/app.js",
        splash: "./src/splash.js",
        login: "./src/login.js",
        setGuest: "./src/setGuest.js"
    },
    output: {
      filename: "[name].js",
      path: path.resolve(__dirname, "../app")
    }
  });
};
