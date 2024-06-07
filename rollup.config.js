import ts from "rollup-plugin-typescript2";
import babel from "rollup-plugin-babel";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import path from "path";
import postcss from "rollup-plugin-postcss";
import image from "@rollup/plugin-image";

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
