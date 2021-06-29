import { nodeResolve } from "@rollup/plugin-node-resolve";
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
    url({ fileName:'[name][extname]', include: ["**/*.wasm"], limit: 1 }),
    typescript(),
    nodeResolve(),
  ],
};
