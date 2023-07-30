import ts from "rollup-plugin-typescript2";
import babel from "rollup-plugin-babel";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import path from "path";
import { terser } from "rollup-plugin-terser";
import postcss from "rollup-plugin-postcss";
import image from "@rollup/plugin-image";

export default async () => {
  const external = Object.keys(require("./package.json").dependencies || {});

  const entries = {
    "packages/index": "src/packages/index.ts",
    "packages/events/bus": "src/packages/events/bus.ts",
    "packages/events/event": "src/packages/events/event.ts",
    "packages/core/diagram-editor": "src/packages/core/diagram-editor.ts",
    "packages/core/diagram-viewer": "src/packages/core/diagram-viewer.ts",
  };

  return {
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
      terser(),
    ],
    external: external,
  };
};
