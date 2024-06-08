import path from "path";
import babel from "@rollup/plugin-babel";
import image from "@rollup/plugin-image";
import ts from "rollup-plugin-typescript2";
import postcss from "rollup-plugin-postcss";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";

export default async () => {
  const external = Object.keys(require("./package.json").dependencies || {});

  const entries = {
    "index": "src/index.ts",
    "utils/svg": "src/utils/svg.ts",
    "utils/xml": "src/utils/xml.ts",
    "event/index": "src/event/index.ts",
    "event/basic": "src/event/basic.ts",
    "utils/convert": "src/utils/convert.ts",
    "core/diagram-editor": "src/core/diagram-editor.ts",
    "core/diagram-viewer": "src/core/diagram-viewer.ts",
  };

  /**
   * @typedef { import("rollup").RollupOptions } RollupConfig
   * @type { RollupConfig }
   * */
  const config = {
    input: entries,
    output: {
      dir: "./dist",
      format: "es",
    },
    plugins: [
      resolve(),
      commonjs({ include: "node_modules/**" }),
      babel({
        exclude: "node_modules/**",
        presets: [["@babel/preset-env", { modules: false, targets: { chrome: "70" } }]],
        babelHelpers: "bundled",
      }),
      image(),
      postcss({
        extract: path.resolve("./dist/index.css"),
        minimize: true,
        extensions: [".css", ".scss"],
      }),
      ts({
        tsconfig: path.resolve(__dirname, "./tsconfig.dist.json"),
        extensions: [".ts", ".tsx"],
      }),
    ],
    external: external,
  };

  return config;
};
