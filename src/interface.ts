import mainUrl from "../build/code.wasm";
import stdlibUrl from "../build/stdlib.wasm";
import { range, rng } from "./utils";

interface ModuleInterface {
  Mask_Appearance: WebAssembly.Global;
  gAppearances: WebAssembly.Global;
  Mask_AI: WebAssembly.Global;
  gAIs: WebAssembly.Global;
  Mask_Fighter: WebAssembly.Global;
  gFighters: WebAssembly.Global;
  Mask_Position: WebAssembly.Global;
  gPositions: WebAssembly.Global;

  Mask_Player: WebAssembly.Global;
  Mask_Solid: WebAssembly.Global;

  gGameMode: WebAssembly.Global;

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

  gStrings: WebAssembly.Global;
  gStringsSize: WebAssembly.Global;

  gMessageLog: WebAssembly.Global;
  gMessageSize: WebAssembly.Global;
  gMessageCount: WebAssembly.Global;

  memory: WebAssembly.Memory;

  initialise(w: number, h: number): void;
  hover(x: number, y: number): void;
  input(code: number): boolean;
  moveEntity(eid: number, mx: number, my: number): void;
}

interface RLogMessage {
  fg: number;
  count: number;
  message: string;
}

export interface RAppearance {
  ch: number;
  layer: number;
  fg: number;
  name: string;
}

export interface RAI {
  fn: number;
}

export interface RFighter {
  maxHp: number;
  hp: number;
  defence: number;
  power: number;
}

export interface RPosition {
  x: number;
  y: number;
}

export interface REntity {
  id: number;
  Appearance?: RAppearance;
  AI?: RAI;
  Fighter?: RFighter;
  Position?: RPosition;
  Player?: boolean;
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
  raw: DataView;
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
    this.raw = new DataView(empty);
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

  log() {
    const messages: RLogMessage[] = [];
    let o = this.i.gMessageLog.value;

    for (let i = 0; i < this.i.gMessageCount.value; i++) {
      const count = this.raw.getUint8(o + 4);
      if (count)
        messages.push({
          count,
          fg: this.raw.getUint32(o, true),
          message: this.string(o + 5),
        });

      o += this.i.gMessageSize;
    }

    return messages;
  }

  string(offset: number) {
    const bytes: number[] = [];
    for (; ; offset++) {
      const ch = this.raw.getUint8(offset);

      if (ch === 0) return String.fromCharCode(...bytes);
      bytes.push(ch);
    }
  }

  entity(id: number): REntity {
    const mask = this.entities.getBigUint64(
      id * this.i.gEntitySize.value,
      true
    );
    const e: REntity = { id };

    if (mask & this.bits.Appearance) e.Appearance = this.appearance(id);
    if (mask & this.bits.AI) e.AI = this.ai(id);
    if (mask & this.bits.Fighter) e.Fighter = this.fighter(id);
    if (mask & this.bits.Position) e.Position = this.position(id);

    if (mask & this.bits.Player) e.Player = true;
    if (mask & this.bits.Solid) e.Solid = true;

    return e;
  }

  appearance(id: number): RAppearance {
    const size = 10;
    const offset = id * size + this.i.gAppearances.value;
    const mem = this.slice(offset, size);

    return {
      ch: mem.getUint8(0),
      layer: mem.getUint8(1),
      fg: mem.getUint32(2, true),
      name: this.string(mem.getUint32(6, true)),
    };
  }

  ai(id: number): RAI {
    const size = 1;
    const offset = id * size + this.i.gAIs.value;
    const mem = this.slice(offset, size);

    return {
      fn: mem.getUint8(0),
    };
  }

  fighter(id: number): RFighter {
    const size = 16;
    const offset = id * size + this.i.gFighters.value;
    const mem = this.slice(offset, size);

    return {
      maxHp: mem.getUint32(0, true),
      hp: mem.getInt32(4, true),
      defence: mem.getUint32(8, true),
      power: mem.getUint32(12, true),
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
    this.raw = new DataView(this.i.memory.buffer);
    this.tileTypes = range(this.i.gTileTypeCount.value).map((id) =>
      this.tt(id)
    );

    this.bits = {
      Appearance: this.i.Mask_Appearance.value,
      AI: this.i.Mask_AI.value,
      Fighter: this.i.Mask_Fighter.value,
      Position: this.i.Mask_Position.value,
      Player: this.i.Mask_Player.value,
      Solid: this.i.Mask_Solid.value,
    };
  }

  input(id: number): boolean {
    return this.i.input(id);
  }

  hover(x: number, y: number): void {
    this.i.hover(x, y);
  }
}

const getWASM = (url: string, imports?: WebAssembly.Imports) =>
  new Promise<WebAssembly.Exports>((resolve, reject) => {
    WebAssembly.instantiateStreaming(fetch(url), imports)
      .then(({ instance }) => resolve(instance.exports))
      .catch(reject);
  });

async function getInterface() {
  let iface: WasmInterface | undefined = undefined;
  const debug = (offset: number) => {
    if (!iface || iface.raw.byteLength === 0) return;

    const message = iface.string(offset);
    console.log(message);
  };

  const stdlib = await getWASM(stdlibUrl);
  const main = await getWASM(mainUrl, { stdlib, host: { debug, rng } });
  iface = new WasmInterface(main as unknown as ModuleInterface);
  return iface;
}

export default getInterface;
