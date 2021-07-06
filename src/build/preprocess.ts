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

type WatThing = string | string[];
function watItem(code: string, s: number): [WatThing, number] {
  const parts = [];
  let current = "";

  for (let i = s; i < code.length; i++) {
    const ch = code[i];

    if (ch === "(") {
      const [item, ln] = watItem(code, i + 1);
      parts.push(item);
      i += ln + 1;
      continue;
    }

    if (ch === ")") {
      if (current) parts.push(current);
      return [parts, i - s];
    }

    if (ch === " ") {
      if (current) parts.push(current);
      current = "";
      continue;
    }

    current += ch;
  }

  return [parts, code.length - s];
}

function watSplit(code: string): WatThing[] {
  const [result] = watItem(code, 1);
  return Array.isArray(result) ? result : [result];
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
  global: string[];
  local: string[];
  processors: Record<string, Processor>;
  ptr: number;
  structures: Record<string, Structure>;

  constructor() {
    this.env = {};
    this.processors = {
      "=": this.evaluate.bind(this),
      align: this.align.bind(this),
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
    this.global = [];
    this.local = [];
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
    if (code[0] === "$") {
      if (this.local.includes(code)) return `(local.get ${code})`;
      return `(global.get ${code})`;
    }

    try {
      const number = this.evalNumber(code);
      return `(${type}.const ${number})`;
    } catch {
      return code;
    }
  }

  private define<T>(name: string, value: T): [string, T] {
    // TODO: this defines [[consts]] stuff twice
    // console.log("define:", name, value);
    this.env[name] = value;
    return [name, value];
  }

  process(code: string) {
    this.init();
    const processed = [];

    code.split("\n").forEach((line, ln) => {
      while (true) {
        const i = line.lastIndexOf("[[");
        if (i < 0) break;

        const j = line.indexOf("]]", i);
        if (j < 0) throw new Error(`Line ${ln}: [[ without ]]`);

        const old = line.slice(i, j + 2);
        const command = old.slice(2, -2).trim();

        const [p, ...args] = command.split(" ");
        if (this.processors[p]) {
          const repl = this.processors[p](...args) || "";
          line = line.slice(0, i) + repl + line.slice(j + 2);
        } else {
          console.warn(`ignored unknown processor: ${p}`);
        }
      }

      this.scanAll(line);
      processed.push(line);
    });

    // console.log("defines:", this.env);
    return processed.join("\n");
  }

  scanAll(line: string) {
    this.scan(line, "(func ", "parseFunc");
    this.scan(line, "(global ", "parseGlobal");
    this.scan(line, "(local ", "parseLocal");
    this.scan(line, "(param ", "parseLocal");
  }

  scan(line: string, pattern: string, fn: string) {
    let s = 0;
    while (true) {
      const i = line.indexOf(pattern, s);
      if (i < 0) return;

      this[fn](line.substr(i));
      s = i + 1;
    }
  }

  parseFunc() {
    if (this.local.length) {
      // console.log("locals fall out of scope:", this.local);
      this.local = [];
    }
  }

  parseLocal(line: string) {
    const [, name, type] = watSplit(line);

    if (Array.isArray(name)) return;

    // console.log("known local:", name);
    this.local.push(name);
  }

  parseGlobal(line: string) {
    const [, name, type, initialiser] = watSplit(line).filter(
      (p) => typeof p === "string" || p[0] !== "export"
    );

    // invalid?
    if (Array.isArray(name) || !Array.isArray(initialiser)) return;

    // mutable global
    if (Array.isArray(type) && type[0] === "mut") {
      // console.log("known global:", name);
      this.global.push(name);
      return;
    }

    // const
    const [itype, value] = initialiser;
    if (itype.endsWith(".const")) {
      this.define(name.substr(1), Number(value));
    }
  }

  consts(prefix: string, sstart: string, ...names: string[]) {
    const start = this.evalNumber(sstart);

    return names
      .map((n, i) => {
        const [name, value] = this.define(prefix + n, start + i);
        return ` (global $${name} i32 (i32.const ${value}))`;
      })
      .join("\n");
  }

  reserve(section: string, ssize: string, exportName?: string) {
    const size = this.evalNumber(ssize);

    const [name, value] = this.define("mem" + section, this.ptr);
    const code = `(global $${name}${genExport(
      exportName
    )} i32 (i32.const ${value})) ;; size=${size}`;
    this.ptr += size;

    this.define("sizeof_" + section, size);
    return code;
  }

  memory(exportName?: string) {
    const pages = Math.ceil(this.ptr / WASMPageSize);
    const max = pages * WASMPageSize;

    return `(memory${genExport(exportName)} ${pages}) ;; ${
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
  }

  store(sstart: string, path: string, ...code: string[]) {
    const [sname, fname] = path.split(".");
    const s = this.structures[sname];
    if (!s) throw new Error(`Unknown structure: ${sname}`);
    const f = s.fields[fname];
    if (!f) throw new Error(`Unknown field: ${sname}.${fname}`);

    const [type, store] = getStore(f.type);
    const offset = f.offset > 0 ? ` offset=${f.offset}` : "";

    const start = this.evalConst(sstart, type);
    const value = this.evalConst(code.join(" "), type);

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

  align(...parts: string[]) {
    const code = parts.join(" ");
    const size = this.evalNumber(code || "4");
    const offset = this.ptr % size;
    if (offset) {
      this.ptr += size - offset;
      return `;; aligned to ${size} bytes`;
    }
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
