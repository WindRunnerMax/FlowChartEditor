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
    index: "src/index.ts",
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
      preserveModules: true,
      preserveModulesRoot: "src",
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
