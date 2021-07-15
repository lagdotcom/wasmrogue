import { execSync } from "child_process";
import { watchTree } from "watch";

import { scripts } from "../../package.json";

watchTree(
  "assembly",
  {
    filter: (path) => path.toLowerCase().endsWith(".wat"),
    interval: 1,
  },
  (f) => {
    if (typeof f === "object") {
      console.log("watching:", Object.keys(f));
      return;
    }

    try {
      console.log(execSync(scripts["wasm:pp"], { encoding: "utf-8" }));
      console.log(execSync(scripts["wasm:build"], { encoding: "utf-8" }));
      console.log("ok");
    } catch {}
  }
);
