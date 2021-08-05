const { desc, file, task } = require("jake");
const glob = require("glob");
const { execSync } = require("child_process");

const toWasm = (fn) => fn.split(".").slice(0, -1).join(".") + ".wasm";

const src = (fn) => "assembly/" + fn;
const processed = (fn) => "build/" + fn;
const compiled = (fn) => "build/" + toWasm(fn);

const wat = glob
  .sync("assembly/*.wat", { nodir: true, nomount: true })
  .map((fn) => fn.split("/").slice(1).join("/"));

task("default", ["build"]);

desc("Build WASM");
task("build", wat.map(compiled));

// define compilation tasks
wat.forEach((fn) =>
  file(compiled(fn), [processed(fn)], () =>
    execSync(`wat2wasm ${processed(fn)} -f mutable_globals -o ${compiled(fn)}`)
  )
);

// define preprocess tasks
wat.forEach((fn) =>
  file(processed(fn), [src(fn)], () =>
    execSync(`npm run wasm:pp -- ${src(fn)} ${processed(fn)}`)
  )
);
