const path = require("path");
const { override, disableEsLint, babelInclude } = require("customize-cra");
// https://github.com/arackaf/customize-cra

const configWebpackPlugins = () => config => {
  // 太卡关闭一些插件
  // 关闭`ESLINT`的插件 -> 在`VSCode`校验
  // 关闭`CaseSensitivePathsPlugin`插件
  // 关闭`IgnorePlugin`插件
  config.plugins = config.plugins.filter(
    plugin =>
      plugin.constructor.name !== "ESLintWebpackPlugin" &&
      plugin.constructor.name !== "CaseSensitivePathsPlugin" &&
      plugin.constructor.name !== "IgnorePlugin"
  );
  config.resolve.plugins = config.resolve.plugins.filter(
    plugin => plugin.constructor.name !== "ModuleScopePlugin"
  );
  return config;
};

const example = path.resolve(__dirname, "example");
const src = path.resolve(__dirname, "src");

module.exports = {
  paths: function (paths) {
    paths.appIndexJs = example;
    paths.appSrc = example;
    return paths;
  },
  webpack: override(babelInclude([src, example]), disableEsLint(), configWebpackPlugins()),
};
