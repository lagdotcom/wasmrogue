import { readFileSync, writeFileSync } from "fs";

import scopedEval from "./scoped-eval";

const WASMPageSize = 0x10000;

function genExport(name?: string): string {
  if (!name) return "";
  return ` (export "${name}")`;
}

type Processor = (...args: string[]) => string;

class Preprocessor {
  env: Record<string, any>;
  processors: Record<string, Processor>;
  ptr: number;

  constructor() {
    this.env = {};
    this.processors = {
      consts: this.consts.bind(this),
      memory: this.memory.bind(this),
      reserve: this.reserve.bind(this),
    };
  }

  private init() {
    this.env = {};
    this.ptr = 0;
  }

  private eval(code: string) {
    return scopedEval(code, this.env);
  }

  private evalNumber(code: string): number {
    const value = this.eval(code);
    if (typeof value !== "number" || isNaN(value))
      throw new Error(`isNaN: ${code}`);

    return value;
  }

  private define<T>(name: string, value: T): [string, T] {
    this.env[name] = value;
    return [name, value];
  }

  process(code: string) {
    this.init();

    let o = 0;
    while (true) {
      const i = code.indexOf("[[", o);
      if (i < 0) break;

      const j = code.indexOf("]]", i);
      if (j < 0) break;

      const old = code.slice(i, j + 2);
      const command = old.slice(2, -2).trim();

      const [p, ...args] = command.split(" ");
      if (this.processors[p]) {
        const repl = this.processors[p](...args);
        code = code.slice(0, i) + repl + code.slice(j + 2);
      } else {
        console.warn(`ignored unknown processor: ${p}`);
        o = i + 1;
      }
    }

    console.log("defines:", this.env);
    return code;
  }

  consts(prefix: string, sstart: string, ...names: string[]) {
    const start = this.evalNumber(sstart);

    return names
      .map((n, i) => {
        const [name, value] = this.define(prefix + n, start + i);
        return `  (global $${name} i32 (i32.const ${value}))`;
      })
      .join("\n");
  }

  reserve(section: string, ssize: string, exportName?: string) {
    const size = this.evalNumber(ssize);

    const [name, value] = this.define("mem" + section, this.ptr);
    const code = `  (global $${name}${genExport(
      exportName
    )} i32 (i32.const ${value})) ;; size=${size}`;
    this.ptr += size;

    return code;
  }

  memory(exportName?: string) {
    const pages = Math.ceil(this.ptr / WASMPageSize);
    const max = pages * WASMPageSize;

    return `  (memory${genExport(exportName)} ${pages}) ;; ${
      this.ptr
    } / ${max} used`;
  }
}

function preprocess(src: string, dst: string) {
  const original = readFileSync(src, { encoding: "utf-8" });
  const p = new Preprocessor();
  const transformed = p.process(original);

  writeFileSync(dst, transformed);
  console.log(`Wrote: ${dst}`);
}

const [source, destination] = process.argv.slice(2, 4);
if (!source || !destination) {
  console.error(`Syntax: preprocess <source> <destination>`);
  process.exit(-1);
}

preprocess(source, destination);
