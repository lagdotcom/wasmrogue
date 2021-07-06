import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import serve from "rollup-plugin-serve";
import typescript from "@rollup/plugin-typescript";
import url from "@rollup/plugin-url";

export default {
  input: "src/index.ts",
  output: {
    sourcemap: true,
    file: "public/bundle.js",
    format: "iife",
  },
  plugins: [
    commonjs(),
    url({ fileName: "[name][extname]", include: ["**/*.wasm"], limit: 1 }),
    typescript(),
    nodeResolve(),
    serve({ contentBase: "public", open: true }),
  ],
};
