import module from "../build/code.wasm";
import { range, rng } from "./utils";

interface ModuleInterface {
  gEntities: WebAssembly.Global;
  gEntitySize: WebAssembly.Global;
  gHeight: WebAssembly.Global;
  gMap: WebAssembly.Global;
  gMaxEntities: WebAssembly.Global;
  gPlayerID: WebAssembly.Global;
  gTileTypeCount: WebAssembly.Global;
  gTileTypes: WebAssembly.Global;
  gTileTypeSize: WebAssembly.Global;
  gWidth: WebAssembly.Global;

  memory: WebAssembly.Memory;

  initialise(w: number, h: number): void;
  input(code: number): boolean;
  moveEntity(eid: number, mx: number, my: number): void;
}

export interface REntity {
  exists: boolean;
  x: number;
  y: number;
  ch: number;
  colour: number;
}

export interface RTileType {
  walkable: boolean;
  transparent: boolean;
  ch: number;
  fg: number;
  bg: number;
}

export class WasmInterface {
  entities: DataView;
  maxEntities: number;
  map: DataView;
  tileTypes: RTileType[];

  constructor(private i: ModuleInterface) {
    const empty = new ArrayBuffer(0);
    this.entities = new DataView(empty);
    this.maxEntities = 0;
    this.map = new DataView(empty);
    this.tileTypes = [];
  }

  get width(): number {
    return this.i.gWidth.value;
  }
  get height(): number {
    return this.i.gHeight.value;
  }
  get tileSize(): number {
    return this.width * this.height;
  }

  private slice(start: number, length: number) {
    return new DataView(this.i.memory.buffer, start, length);
  }

  entity(id: number): REntity {
    const eSize = this.i.gEntitySize.value;
    const offset = id * eSize;

    return {
      exists: this.entities.getUint8(offset) !== 0,
      x: this.entities.getUint8(offset + 1),
      y: this.entities.getUint8(offset + 2),
      ch: this.entities.getUint8(offset + 3),
      colour: this.entities.getUint32(offset + 4, true),
    };
  }

  private tt(id: number): RTileType {
    const tSize = this.i.gTileTypeSize.value;
    const offset = id * tSize;
    const mem = this.slice(offset, tSize);

    return {
      walkable: mem.getUint8(0) !== 0,
      transparent: mem.getUint8(1) !== 0,
      ch: mem.getUint8(2),
      fg: mem.getUint32(3, true),
      bg: mem.getUint32(7, true),
    };
  }

  initialise(width: number, height: number): void {
    this.i.initialise(width, height);
    this.maxEntities = this.i.gMaxEntities.value;
    this.entities = this.slice(
      this.i.gEntities.value,
      this.i.gEntitySize.value * this.maxEntities
    );
    this.map = this.slice(this.i.gMap.value, this.tileSize);
    this.tileTypes = range(this.i.gTileTypeCount.value).map((id) =>
      this.tt(id)
    );
  }

  input(id: number): boolean {
    return this.i.input(id);
  }
}

const getInterface = () =>
  WebAssembly.instantiateStreaming(fetch(module), {
    host: { rng },
  }).then(
    ({ instance }) =>
      new WasmInterface(instance.exports as unknown as ModuleInterface)
  );

export default getInterface;
