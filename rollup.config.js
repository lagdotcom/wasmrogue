import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import url from "@rollup/plugin-url";

export default {
  input: "src/index.ts",
  output: {
    file: "public/bundle.js",
    format: "cjs",
  },
  plugins: [url({ include: ["**/*.wasm"] }), typescript(), nodeResolve()],
};
