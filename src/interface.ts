import module from "../build/code.wasm";
import { range, rng } from "./utils";

interface ModuleInterface {
  Mask_Appearance: WebAssembly.Global;
  gAppearances: WebAssembly.Global;
  Mask_Position: WebAssembly.Global;
  gPositions: WebAssembly.Global;

  Mask_Solid: WebAssembly.Global;

  gDisplay: WebAssembly.Global;
  gDisplayFG: WebAssembly.Global;
  gDisplayBG: WebAssembly.Global;
  gDisplayMinX: WebAssembly.Global;
  gDisplayMinY: WebAssembly.Global;
  gDisplayMaxX: WebAssembly.Global;
  gDisplayMaxY: WebAssembly.Global;
  gDisplayHeight: WebAssembly.Global;
  gDisplayWidth: WebAssembly.Global;
  gDisplaySize: WebAssembly.Global;

  gMap: WebAssembly.Global;
  gMapHeight: WebAssembly.Global;
  gMapWidth: WebAssembly.Global;
  gMapSize: WebAssembly.Global;

  gEntities: WebAssembly.Global;
  gEntitySize: WebAssembly.Global;
  gMaxEntities: WebAssembly.Global;

  gPlayerID: WebAssembly.Global;
  gTileTypeCount: WebAssembly.Global;
  gTileTypes: WebAssembly.Global;
  gTileTypeSize: WebAssembly.Global;

  memory: WebAssembly.Memory;

  initialise(w: number, h: number): void;
  input(code: number): boolean;
  moveEntity(eid: number, mx: number, my: number): void;
}

export interface RAppearance {
  ch: number;
  fg: number;
}

export interface RPosition {
  x: number;
  y: number;
}

export interface REntity {
  id: number;
  Appearance?: RAppearance;
  Position?: RPosition;
  Solid?: boolean;
}

export interface RTileType {
  walkable: boolean;
  transparent: boolean;
  ch: number;
  fg: number;
  bg: number;
  fgLight: number;
  bgLight: number;
}

export class WasmInterface {
  bits: Record<string, bigint>;
  display: DataView;
  displayFg: DataView;
  displayBg: DataView;
  entities: DataView;
  maxEntities: number;
  map: DataView;
  tileTypes: RTileType[];

  constructor(private i: ModuleInterface) {
    const empty = new ArrayBuffer(0);
    this.bits = {};
    this.display = new DataView(empty);
    this.displayFg = new DataView(empty);
    this.displayBg = new DataView(empty);
    this.entities = new DataView(empty);
    this.maxEntities = 0;
    this.map = new DataView(empty);
    this.tileTypes = [];
  }

  get mapWidth(): number {
    return this.i.gMapWidth.value;
  }
  get mapHeight(): number {
    return this.i.gMapHeight.value;
  }
  get mapSize(): number {
    return this.mapWidth * this.mapHeight;
  }

  get displayWidth(): number {
    return this.i.gDisplayWidth.value;
  }
  get displayHeight(): number {
    return this.i.gDisplayHeight.value;
  }
  get displaySize(): number {
    return this.displayWidth * this.displayHeight;
  }

  private slice(start: number, length: number) {
    return new DataView(this.i.memory.buffer, start, length);
  }

  entity(id: number): REntity {
    const mask = this.entities.getBigUint64(
      id * this.i.gEntitySize.value,
      true
    );
    const e: REntity = { id };

    if (mask & this.bits.Appearance) e.Appearance = this.appearance(id);
    if (mask & this.bits.Position) e.Position = this.position(id);
    if (mask & this.bits.Solid) e.Solid = true;

    return e;
  }

  appearance(id: number): RAppearance {
    const size = 5;
    const offset = id * size + this.i.gAppearances.value;
    const mem = this.slice(offset, size);

    return {
      ch: mem.getUint8(0),
      fg: mem.getUint32(1, true),
    };
  }

  position(id: number): RPosition {
    const size = 2;
    const offset = id * size + this.i.gPositions.value;
    const mem = this.slice(offset, size);

    return {
      x: mem.getUint8(0),
      y: mem.getUint8(1),
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
      fgLight: mem.getUint32(11, true),
      bgLight: mem.getUint32(15, true),
    };
  }

  initialise(width: number, height: number): void {
    this.i.initialise(width, height);
    this.maxEntities = this.i.gMaxEntities.value;
    this.entities = this.slice(
      this.i.gEntities.value,
      this.i.gEntitySize.value * this.maxEntities
    );
    this.map = this.slice(this.i.gMap.value, this.mapSize);
    this.display = this.slice(this.i.gDisplay.value, this.displaySize);
    this.displayFg = this.slice(this.i.gDisplayFG.value, this.displaySize * 4);
    this.displayBg = this.slice(this.i.gDisplayBG.value, this.displaySize * 4);
    this.tileTypes = range(this.i.gTileTypeCount.value).map((id) =>
      this.tt(id)
    );

    this.bits = {
      Appearance: this.i.Mask_Appearance.value,
      Position: this.i.Mask_Position.value,
      Solid: this.i.Mask_Solid.value,
    };
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
