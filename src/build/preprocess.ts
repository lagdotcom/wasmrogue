import { readFileSync, writeFileSync } from "fs";

import scopedEval from "./scoped-eval";

const WASMPageSize = 0x10000;
const EntityIDType = "i32";
const EntityMaskType = "i64";

function hex2(n: number) {
  const h = n.toString(16);
  return h.length < 2 ? "0" + h : h;
}

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

function genGlobal(name: string, type: string, value: number, extern?: string) {
  return `(global $${name}${genExport(
    extern
  )} ${type} (${type}.const ${value}))`;
}

type WatThing = string | WatThing[];
function watItem(code: string, s: number): [WatThing, number] {
  const parts: WatThing = [];
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

function ppSplit(code: string): string[] {
  const parts: string[] = [];
  let current = "";
  let depth = 0;

  for (let i = 0; i < code.length; i++) {
    const ch = code[i];

    if (depth) {
      if (ch === "(") depth++;
      else if (ch === ")") depth--;
    } else {
      if (ch === "(") depth++;
      else if (ch === " ") {
        if (current) parts.push(current);
        current = "";
        continue;
      }
    }

    current += ch;
  }

  if (current) parts.push(current);
  return parts;
}

type Processor = (...args: string[]) => string | void;
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
  components!: string[];
  global!: string[];
  local!: string[];
  ln!: number;
  processors: Record<string, Processor>;
  ptr!: number;
  structures!: Record<string, Structure>;

  constructor(public verbose: boolean = false) {
    this.env = {};
    this.processors = {
      "=": this.evaluate.bind(this),
      "=64": this.evaluate64.bind(this),
      align: this.align.bind(this),
      component: this.component.bind(this),
      consts: this.consts.bind(this),
      data: this.data.bind(this),
      eval: this.evaluate.bind(this),
      eval64: this.evaluate64.bind(this),
      load: this.load.bind(this),
      memory: this.memory.bind(this),
      reserve: this.reserve.bind(this),
      store: this.store.bind(this),
      struct: this.struct.bind(this),
      system: this.system.bind(this),
      "/system": this.systemEnd.bind(this),
    };

    this.parseFunc = this.parseFunc.bind(this);
    this.parseGlobal = this.parseGlobal.bind(this);
    this.parseLocal = this.parseLocal.bind(this);
  }

  private log(...params: any[]) {
    if (this.verbose) console.log(...params);
  }

  private init() {
    this.env = {};
    this.components = [];
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
      throw this.error(`isNaN: ${code} = ${value}`);

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
    // TODO this defines [[consts]] stuff twice
    this.log("define:", name, value);
    this.env[name] = value;
    return [name, value];
  }

  private error(message: string) {
    return new Error(`[${this.ln + 1}] ${message}`);
  }

  process(code: string) {
    this.init();
    const processed: string[] = [];

    code.split("\n").forEach((line, ln) => {
      this.ln = ln;

      let e = undefined;
      while (true) {
        const i = line.lastIndexOf("[[", e);
        if (i < 0) break;

        const j = line.indexOf("]]", i);
        if (j < 0) throw this.error("[[ without ]]");

        const old = line.slice(i, j + 2);
        const command = old.slice(2, -2).trim();

        const [p, ...args] = ppSplit(command);
        if (this.processors[p]) {
          const repl = this.processors[p](...args) || "";
          line = line.slice(0, i) + repl + line.slice(j + 2);
        } else {
          console.warn(`[${ln + 1}] ignored unknown processor: ${p}`);
          e = i - 1;
        }
      }

      this.scanAll(line);
      processed.push(line);
    });

    this.log("defines:", this.env);
    return processed.join("\n");
  }

  scanAll(line: string) {
    this.scan(line, "(func ", this.parseFunc);
    this.scan(line, "(global ", this.parseGlobal);
    this.scan(line, "(local ", this.parseLocal);
    this.scan(line, "(param ", this.parseLocal);
  }

  scan(line: string, pattern: string, fn: (line: string) => void) {
    let s = 0;
    while (true) {
      const i = line.indexOf(pattern, s);
      if (i < 0) return;

      fn(line.substr(i));
      s = i + 1;
    }
  }

  parseFunc() {
    if (this.local.length) {
      this.log("locals fall out of scope:", this.local);
      this.local = [];
    }
  }

  parseLocal(line: string) {
    const [, name, type] = watSplit(line);

    if (Array.isArray(name) || !type) return;

    this.log("known local:", name);
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
      this.log("known global:", name);
      this.global.push(name);
      return;
    }

    // const
    const [itype, value] = initialiser;
    if (typeof itype === "string" && itype.endsWith(".const")) {
      this.define(name.substr(1), Number(value));
    }
  }

  consts(prefix: string, sstart: string, ...names: string[]) {
    const start = this.evalNumber(sstart);

    return names
      .map((n, i) => {
        const [name, value] = this.define(prefix + n, start + i);
        this.define("_Next", value + 1);
        return genGlobal(name, "i32", value);
      })
      .join("\n");
  }

  reserve(section: string, ssize: string, exportName?: string) {
    const size = this.evalNumber(ssize);

    const [name, value] = this.define(section, this.ptr);
    const code = genGlobal(name, "i32", value, exportName) + ` ;; size=${size}`;
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
    if (!s) throw this.error(`Unknown structure: ${sname}`);
    const f = s.fields[fname];
    if (!f) throw this.error(`Unknown field: ${sname}.${fname}`);

    const [type, store] = getStore(f.type);
    const offset = f.offset > 0 ? ` offset=${f.offset}` : "";

    const start = this.evalConst(sstart, type);
    const value = this.evalConst(code.join(" "), type);

    return `(${type}.${store}${offset} ${start} ${value})`;
  }

  load(sstart: string, path: string) {
    const [sname, fname] = path.split(".");
    const s = this.structures[sname];
    if (!s) throw this.error(`Unknown structure: ${sname}`);
    const f = s.fields[fname];
    if (!f) throw this.error(`Unknown field: ${sname}.${fname}`);

    const [type, load] = getLoad(f.type);
    const offset = f.offset > 0 ? ` offset=${f.offset}` : "";

    const start = this.evalConst(sstart, type);

    return `(${type}.${load}${offset} ${start})`;
  }

  evaluate(...parts: string[]) {
    const code = parts.join(" ");
    return this.evalConst(code, "i32");
  }

  evaluate64(...parts: string[]) {
    const code = parts.join(" ");
    return this.evalConst(code, "i64");
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

  data(name: string, ...fields: string[]) {
    const s = this.structures[name];
    if (!s) throw this.error(`Unknown structure: ${name}`);

    const fieldNames = Object.keys(s.fields);
    const data: Record<string, number> = Object.fromEntries(
      fieldNames.map((name) => [name, 0])
    );
    fields.forEach((fstring) => {
      const [fname, fvalue] = fstring.split("=");
      const f = s.fields[fname];
      if (!f) throw this.error(`Unknown structure field: ${name}.${fname}`);

      const value = this.evalNumber(fvalue);
      data[fname] = value;
    });

    this.log(data);
    const size = this.env["sizeof_" + name] as number;
    const buffer = new ArrayBuffer(size);
    const view = new DataView(buffer);
    let offset = 0;
    fieldNames.forEach((fname) => {
      const f = s.fields[fname];
      const value = data[fname];

      switch (f.type) {
        case "u8":
        case "i8":
          view.setUint8(offset, value);
          offset++;
          break;

        case "i32":
          view.setInt32(offset, value, true);
          offset += 4;
          break;

        default:
          throw this.error(`Don't know how to write ${f.type}`);
      }
    });

    let dataString = "";
    for (let i = 0; i < size; i++) {
      const b = view.getUint8(i);
      dataString += `\\${hex2(b)}`;
    }
    return '"' + dataString + '"';
  }

  component(name: string, ...fields: string[]) {
    this.struct(name, ...fields);

    const id = this.components.length;
    const mask = 2 ** id;

    const [maskName] = this.define(`Mask_${name}`, mask);
    this.components.push(name);

    return [
      genGlobal(maskName, EntityMaskType, mask, maskName),
      this.genGetComponent(name),
      this.genAttachComponent(name),
      this.genDetachComponent(name),
    ].join("\n");
  }

  private genGetComponent(name: string) {
    const struct = this.structures[name];

    return `(func $get${name} (param $eid ${EntityIDType}) (result i32)
  (i32.add
    (global.get $${name}s)
    (i32.mul (local.get $eid) (i32.const ${struct.size}))
  )
)`;
  }

  private genAttachComponent(name: string) {
    const struct = this.structures[name];
    const fields = Object.values(struct.fields);

    return `(func $attach${name} (param $eid ${EntityIDType}) ${fields
      .map((f) => `(param $${f.name} ${getStore(f.type)[0]})`)
      .join(" ")}
  (local $entity i32)
  (local $mem i32)
  (local.set $entity (call $getEntity (local.get $eid)))
  (local.set $mem (call $get${name} (local.get $eid)))

  [[store (local.get $entity) Entity.mask (${EntityMaskType}.or [[load (local.get $entity) Entity.mask]] [[= $Mask_${name}]])]]
  ${fields
    .map(
      (f) =>
        `[[store (local.get $mem) ${name}.${f.name} (local.get $${f.name})]]`
    )
    .join("\n")}
)`;
  }

  private genDetachComponent(name: string) {
    return `(func $detach${name} (param $eid ${EntityIDType})
  (local $entity i32)
  (local.set $entity (call $getEntity (local.get $eid)))

  [[store (local.get $entity) Entity.mask (${EntityMaskType}.xor [[load (local.get $entity) Entity.mask]] [[= $Mask_${name}]])]]
)`;
  }

  system(name: string, ...components: string[]) {
    for (let i = 0; i < components.length; i++) {
      const cname = components[i];
      if (!this.structures[cname])
        throw this.error(`Unknown component: ${cname}`);
    }

    return [
      this.genSystemFunction(name, components),
      this.genDoFunction(name, components),
    ].join("\n");
  }

  genSystemFunction(name: string, components: string[]) {
    const mask = components
      .map((cname) => this.env["Mask_" + cname] as number)
      .reduce((a, b) => a | b);

    return `(func $sys${name}
    (local $eid i32)
    (local.set $eid (i32.const 0))
    (loop $entities
      (if (${EntityMaskType}.eq (${EntityMaskType}.and
        [[load (call $getEntity (local.get $eid)) Entity.mask]]
        (${EntityMaskType}.const ${mask})
      ) (${EntityMaskType}.const ${mask})) (then
        (call $do${name} (local.get $eid)
          ${components
            .map((cname) => `(call $get${cname} (local.get $eid))`)
            .join("\n          ")}
        )
      ))

      (br_if $entities (i32.ne
        (local.tee $eid (i32.add (local.get $eid) (i32.const 1)))
        (global.get $maxEntities)
      ))
    )
  )`;
  }

  genDoFunction(name: string, components: string[]) {
    return `(func $do${name} (param $eid i32) ${components
      .map((c) => `(param $${c} i32)`)
      .join(" ")}`;
  }

  systemEnd() {
    return ")";
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
