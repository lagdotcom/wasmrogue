import { readFileSync, writeFileSync } from "fs";

import scopedEval from "./scoped-eval";

const WASMPageSize = 0x10000;

function genExport(name?: string) {
  if (!name) return "";
  return ` (export "${name}")`;
}

function getTypeSize(type: string) {
  if (type.endsWith("8")) return 1;
  if (type.endsWith("16")) return 2;
  if (type.endsWith("32")) return 4;
  if (type.endsWith("64")) return 8;
  throw new Error(`Unknown field type: ${type}`);
}

function getStore(type: string) {
  if (["i32", "f32", "i64", "f64"].includes(type)) return [type, "store"];
  if (["u8", "s8"].includes(type)) return ["i32", "store8"];
  throw new Error(`Unknown field type: ${type}`);
}

function getLoad(type: string) {
  if (["i32", "f32", "i64", "f64"].includes(type)) return [type, "load"];
  if (type === "u8") return ["i32", "load8_u"];
  if (type === "s8") return ["i32", "load8_s"];
  throw new Error(`Unknown field type: ${type}`);
}

type Processor = (...args: string[]) => string;
interface StructureField {
  name: string;
  type: string;
  offset: number;
  size: number;
}
interface Structure {
  name: string;
  size: number;
  fields: Record<string, StructureField>;
}

class Preprocessor {
  env: Record<string, any>;
  processors: Record<string, Processor>;
  ptr: number;
  structures: Record<string, Structure>;

  constructor() {
    this.env = {};
    this.processors = {
      consts: this.consts.bind(this),
      eval: this.evaluate.bind(this),
      load: this.load.bind(this),
      memory: this.memory.bind(this),
      reserve: this.reserve.bind(this),
      store: this.store.bind(this),
      struct: this.struct.bind(this),
    };
  }

  private init() {
    this.env = {};
    this.ptr = 0;
    this.structures = {};
  }

  private eval(code: string) {
    return scopedEval(code, this.env);
  }

  private evalNumber(code: string) {
    const value = this.eval(code);
    // evaluate single chars as their key code
    if (typeof value === "string" && value.length === 1)
      return value.charCodeAt(0);

    if (typeof value !== "number" || isNaN(value))
      throw new Error(`isNaN: ${code} = ${value}`);

    return value;
  }

  private evalConst(code: string, type: string) {
    if (code[0] === "$") return `(global.get ${code})`;
    return `(${type}.const ${this.evalNumber(code)})`;
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

    // console.log("defines:", this.env);
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

    this.define("sizeof_" + section, size);
    return code;
  }

  memory(exportName?: string) {
    const pages = Math.ceil(this.ptr / WASMPageSize);
    const max = pages * WASMPageSize;

    return `  (memory${genExport(exportName)} ${pages}) ;; ${
      this.ptr
    } / ${max} used`;
  }

  struct(name: string, ...fields: string[]) {
    const s: Structure = { name, size: 0, fields: {} };
    fields.forEach((f) => {
      const [name, type] = f.split(":");
      const size = getTypeSize(type);

      s.fields[name] = { name, type, offset: s.size, size };
      s.size += size;
    });

    this.structures[name] = s;
    this.define("sizeof_" + name, s.size);
    return "";
  }

  store(sstart: string, path: string, svalue: string) {
    const [sname, fname] = path.split(".");
    const s = this.structures[sname];
    if (!s) throw new Error(`Unknown structure: ${sname}`);
    const f = s.fields[fname];
    if (!f) throw new Error(`Unknown field: ${sname}.${fname}`);

    const [type, store] = getStore(f.type);
    const offset = f.offset > 0 ? ` offset=${f.offset}` : "";

    const start = this.evalConst(sstart, type);
    const value = this.evalConst(svalue, type);

    return `(${type}.${store}${offset} ${start} ${value})`;
  }

  load(sstart: string, path: string) {
    const [sname, fname] = path.split(".");
    const s = this.structures[sname];
    if (!s) throw new Error(`Unknown structure: ${sname}`);
    const f = s.fields[fname];
    if (!f) throw new Error(`Unknown field: ${sname}.${fname}`);

    const [type, load] = getLoad(f.type);
    const offset = f.offset > 0 ? ` offset=${f.offset}` : "";

    const start = this.evalConst(sstart, type);

    return `(${type}.${load}${offset} ${start})`;
  }

  evaluate(...parts: string[]) {
    const code = parts.join(" ");
    return this.evalConst(code, "i32");
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
