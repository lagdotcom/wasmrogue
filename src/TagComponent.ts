import { WasmInterface } from "./interface";
import { REntity, RTagComponentName } from "./types";

export default class TagComponent<N extends RTagComponentName> {
  hasData: false;

  constructor(private i: WasmInterface, public name: N, public mask: bigint) {
    this.hasData = false;
  }

  add(e: REntity): void {
    e[this.name] = true;
  }
}
