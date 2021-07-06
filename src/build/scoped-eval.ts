import { Context, Script, ScriptOptions } from "vm";

export default function scopedEval(
  content: string | Buffer | Script,
  scope: Record<string, unknown> = {},
  filename: string = "unknown"
): any {
  const sandbox: Context = {};
  const exports = {};

  Object.assign(sandbox, scope);
  sandbox.exports = exports;
  sandbox.module = { exports, filename, id: filename };
  sandbox.global = sandbox;

  const options: ScriptOptions = { filename, displayErrors: false };

  if (Buffer.isBuffer(content)) {
    content = content.toString();
  }

  // Evaluate the content with the given scope
  let result: any = undefined;

  if (typeof content === "string") {
    const stringScript = content.replace(/^\#\!.*/, "");
    const script = new Script(stringScript, options);
    result = script.runInNewContext(sandbox, options);
  } else {
    result = content.runInNewContext(sandbox, options);
  }

  return result;
}
