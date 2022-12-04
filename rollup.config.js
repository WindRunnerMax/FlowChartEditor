import ts from "rollup-plugin-typescript2";
import babel from "rollup-plugin-babel";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import path from "path";
import { terser } from "rollup-plugin-terser";
import postcss from "rollup-plugin-postcss";

export default async () => {
  const external = Object.keys(require("./package.json").dependencies || {});

  return {
    input: { "package/index": "src/package/index.ts" },
    output: {
      dir: "./dist",
      format: "es",
    },
    plugins: [
      resolve(),
      postcss({ minimize: true, extensions: [".css", ".scss"] }),
      commonjs({ include: "node_modules/**" }),
      babel({
        exclude: "node_modules/**",
        presets: [["@babel/preset-env", { module: false, targets: { chrome: ">= 70" } }]],
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
