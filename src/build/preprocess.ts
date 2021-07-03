import { readFileSync, writeFileSync } from "fs";

function genExport(name?: string): string {
  if (!name) return "";
  return ` (export "${name}")`;
}

function consts(prefix: string, sstart: string, ...names: string[]) {
  const start = parseInt(sstart, 10);
  if (isNaN(start)) throw new Error(`consts: "${sstart}" isNaN`);

  return names
    .map((n, i) => `  (global $${prefix}${n} i32 (i32.const ${start + i}))`)
    .join("\n");
}

let memptr = 0;
function reserve(name: string, ssize: string, exportName?: string) {
  const size = parseInt(ssize, 10);
  if (isNaN(size)) throw new Error(`reserve: "${ssize}" isNaN`);

  const code = `  (global $mem${name}${genExport(
    exportName
  )} i32 (i32.const ${memptr})) ;; size=${size}`;
  memptr += size;

  return code;
}

const WASMPageSize = 0x10000;
function memory(exportName?: string) {
  const pages = Math.ceil(memptr / WASMPageSize);
  const max = pages * WASMPageSize;

  return `  (memory${genExport(
    exportName
  )} ${pages}) ;; ${memptr} / ${max} used`;
}

const processors: Record<string, (...args: string[]) => string> = {
  consts,
  reserve,
  memory,
};

function preprocess(src: string, dst: string) {
  console.log(`Preprocessing ${src}...`);

  let code = readFileSync(src, { encoding: "utf-8" });
  let st = 0;
  while (true) {
    const i = code.indexOf("[[", st);
    if (i < 0) break;

    const j = code.indexOf("]]", i);
    if (j < 0) break;

    const old = code.slice(i, j + 2);
    const command = old.slice(2, -2).trim();

    const [p, ...args] = command.split(" ");
    if (processors[p]) {
      const repl = processors[p](...args);
      code = code.slice(0, i) + repl + code.slice(j + 2);
    } else {
      console.warn(`ignored unknown processor: ${p}`);
      st = i + 1;
    }
  }

  writeFileSync(dst, code);
  console.log(`Wrote: ${dst}`);
}

const [source, destination] = process.argv.slice(2, 4);
if (!source || !destination) {
  console.error(`Syntax: preprocess <source> <destination>`);
  process.exit(-1);
}

preprocess(source, destination);
