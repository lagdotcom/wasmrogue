import { WasmInterface } from "./interface";
import { RComponentName, REntity } from "./types";

export default class DataComponent<N extends RComponentName> {
  hasData: true;

  constructor(
    private i: WasmInterface,
    public name: N,
    public mask: bigint,
    private base: number,
    private size: number,
    private construct: (mem: DataView) => REntity[N]
  ) {
    this.hasData = true;
  }

  add(e: REntity): void {
    e[this.name] = this.at(e.id);
  }

  at(index: number): REntity[N] {
    const offset = index * this.size + this.base;
    return this.construct(this.i.mainMem(offset, this.size));
  }

  all(count: number): DataView {
    return this.i.mainMem(this.base, this.size * count);
  }
}
