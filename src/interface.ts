import { instantiate } from "@assemblyscript/loader";

import { add, fib } from "../build/interface";
import module from "../build/optimized.wasm";

interface ModuleInterface {
  add: typeof add;
  fib: typeof fib;
}

const getInterface = () =>
  instantiate(fetch(module)).then(
    ({ exports }) => exports as unknown as ModuleInterface
  );

export default getInterface;
