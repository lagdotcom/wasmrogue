import mainUrl from "../build/code.wasm";
import displayUrl from "../build/display.wasm";
import stdlibUrl from "../build/stdlib.wasm";
import Display from "./Display";
import { range, rng } from "./utils";

interface DisplayModule {
  width: WebAssembly.Global;
  height: WebAssembly.Global;

  minX: WebAssembly.Global;
  minY: WebAssembly.Global;
  maxX: WebAssembly.Global;
  maxY: WebAssembly.Global;

  chars: WebAssembly.Global;
  fg: WebAssembly.Global;
  bg: WebAssembly.Global;

  memory: WebAssembly.Memory;

  centreOn(x: number, y: number): void;
  clear(): void;
  contains(x: number, y: number): boolean;
  drawFg(x: number, y: number, ch: number, fg: number): void;
  drawFgBg(x: number, y: number, ch: number, fg: number, bg: number): void;
  getLayer(x: number, y: number): number;
  resize(w: number, h: number): void;
  setFgBg(x: number, y: number, fg: number, bg: number): void;
  setLayer(x: number, y: number, value: number): void;
}

interface MainModule {
  Mask_Appearance: WebAssembly.Global;
  gAppearances: WebAssembly.Global;
  Mask_AI: WebAssembly.Global;
  gAIs: WebAssembly.Global;
  Mask_Carried: WebAssembly.Global;
  gCarrieds: WebAssembly.Global;
  Mask_Consumable: WebAssembly.Global;
  gConsumables: WebAssembly.Global;
  Mask_Inventory: WebAssembly.Global;
  gInventories: WebAssembly.Global;
  Mask_Fighter: WebAssembly.Global;
  gFighters: WebAssembly.Global;
  Mask_Position: WebAssembly.Global;
  gPositions: WebAssembly.Global;

  Mask_Item: WebAssembly.Global;
  Mask_Player: WebAssembly.Global;
  Mask_Solid: WebAssembly.Global;

  gGameMode: WebAssembly.Global;

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
  input(code: number, mod: number): boolean;
  moveEntity(eid: number, mx: number, my: number): boolean;
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
  chain: number;
  duration: number;
}

export interface RCarried {
  carrier: number;
}

export interface RConsumable {
  fn: number;
  power: number;
  range: number;
}

export interface RFighter {
  maxHp: number;
  hp: number;
  defence: number;
  power: number;
}

export interface RInventory {
  size: number;
}

export interface RPosition {
  x: number;
  y: number;
}

export interface REntity {
  id: number;
  Appearance?: RAppearance;
  AI?: RAI;
  Carried?: RCarried;
  Consumable?: RConsumable;
  Fighter?: RFighter;
  Inventory?: RInventory;
  Item?: boolean;
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
  displayChars: DataView;
  displayFg: DataView;
  displayBg: DataView;
  entities: DataView;
  maxEntities: number;
  map: DataView;
  output?: Display;
  raw: DataView;
  tileTypes: RTileType[];

  constructor(private display: DisplayModule, private main: MainModule) {
    const empty = new ArrayBuffer(0);
    this.bits = {};
    this.displayChars = new DataView(empty);
    this.displayFg = new DataView(empty);
    this.displayBg = new DataView(empty);
    this.entities = new DataView(empty);
    this.maxEntities = 0;
    this.map = new DataView(empty);
    this.raw = new DataView(empty);
    this.tileTypes = [];
  }

  get mapWidth(): number {
    return this.main.gMapWidth.value;
  }
  get mapHeight(): number {
    return this.main.gMapHeight.value;
  }
  get mapSize(): number {
    return this.mapWidth * this.mapHeight;
  }

  get displayWidth(): number {
    return this.display.width.value;
  }
  get displayHeight(): number {
    return this.display.height.value;
  }
  get displaySize(): number {
    return this.displayWidth * this.displayHeight;
  }

  private mainMem(start: number, length: number) {
    return new DataView(this.main.memory.buffer, start, length);
  }

  private displayMem(start: number, length: number) {
    return new DataView(this.display.memory.buffer, start, length);
  }

  log() {
    const messages: RLogMessage[] = [];
    let o = this.main.gMessageLog.value;

    for (let i = 0; i < this.main.gMessageCount.value; i++) {
      const count = this.raw.getUint8(o + 4);
      if (count)
        messages.push({
          count,
          fg: this.raw.getUint32(o, true),
          message: this.string(o + 5),
        });

      o += this.main.gMessageSize;
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
      id * this.main.gEntitySize.value,
      true
    );
    const e: REntity = { id };

    if (mask & this.bits.Appearance) e.Appearance = this.appearance(id);
    if (mask & this.bits.AI) e.AI = this.ai(id);
    if (mask & this.bits.Carried) e.Carried = this.carried(id);
    if (mask & this.bits.Consumable) e.Consumable = this.consumable(id);
    if (mask & this.bits.Fighter) e.Fighter = this.fighter(id);
    if (mask & this.bits.Inventory) e.Inventory = this.inventory(id);
    if (mask & this.bits.Position) e.Position = this.position(id);

    if (mask & this.bits.Item) e.Item = true;
    if (mask & this.bits.Player) e.Player = true;
    if (mask & this.bits.Solid) e.Solid = true;

    return e;
  }

  appearance(id: number): RAppearance {
    const size = 10;
    const offset = id * size + this.main.gAppearances.value;
    const mem = this.mainMem(offset, size);

    return {
      ch: mem.getUint8(0),
      layer: mem.getUint8(1),
      fg: mem.getUint32(2, true),
      name: this.string(mem.getUint32(6, true)),
    };
  }

  ai(id: number): RAI {
    const size = 3;
    const offset = id * size + this.main.gAIs.value;
    const mem = this.mainMem(offset, size);

    return {
      fn: mem.getUint8(0),
      chain: mem.getUint8(1),
      duration: mem.getUint8(2),
    };
  }

  carried(id: number): RCarried {
    const size = 1;
    const offset = id * size + this.main.gCarrieds.value;
    const mem = this.mainMem(offset, size);

    return {
      carrier: mem.getUint8(0),
    };
  }

  consumable(id: number): RConsumable {
    const size = 3;
    const offset = id * size + this.main.gConsumables.value;
    const mem = this.mainMem(offset, size);

    return {
      fn: mem.getUint8(0),
      power: mem.getUint8(1),
      range: mem.getUint8(2),
    };
  }

  fighter(id: number): RFighter {
    const size = 16;
    const offset = id * size + this.main.gFighters.value;
    const mem = this.mainMem(offset, size);

    return {
      maxHp: mem.getUint32(0, true),
      hp: mem.getInt32(4, true),
      defence: mem.getUint32(8, true),
      power: mem.getUint32(12, true),
    };
  }

  inventory(id: number): RInventory {
    const size = 1;
    const offset = id * size + this.main.gInventories.value;
    const mem = this.mainMem(offset, size);

    return {
      size: mem.getUint8(0),
    };
  }

  position(id: number): RPosition {
    const size = 2;
    const offset = id * size + this.main.gPositions.value;
    const mem = this.mainMem(offset, size);

    return {
      x: mem.getUint8(0),
      y: mem.getUint8(1),
    };
  }

  private tt(id: number): RTileType {
    const tSize = this.main.gTileTypeSize.value;
    const offset = id * tSize;
    const mem = this.mainMem(offset, tSize);

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
    this.main.initialise(width, height);
    this.maxEntities = this.main.gMaxEntities.value;
    this.entities = this.mainMem(
      this.main.gEntities.value,
      this.main.gEntitySize.value * this.maxEntities
    );
    this.map = this.mainMem(this.main.gMap.value, this.mapSize);
    this.displayChars = this.displayMem(
      this.display.chars.value,
      this.displaySize
    );
    this.displayFg = this.displayMem(
      this.display.fg.value,
      this.displaySize * 4
    );
    this.displayBg = this.displayMem(
      this.display.bg.value,
      this.displaySize * 4
    );
    this.raw = new DataView(this.main.memory.buffer);
    this.tileTypes = range(this.main.gTileTypeCount.value).map((id) =>
      this.tt(id)
    );

    this.bits = {
      Appearance: this.main.Mask_Appearance.value,
      AI: this.main.Mask_AI.value,
      Carried: this.main.Mask_Carried.value,
      Consumable: this.main.Mask_Consumable.value,
      Fighter: this.main.Mask_Fighter.value,
      Inventory: this.main.Mask_Inventory.value,
      Item: this.main.Mask_Item.value,
      Position: this.main.Mask_Position.value,
      Player: this.main.Mask_Player.value,
      Solid: this.main.Mask_Solid.value,
    };
  }

  refresh(): void {
    if (this.output) this.output.refresh();
  }

  input(id: number, mod: number): boolean {
    return this.main.input(id, mod);
  }

  hover(x: number, y: number): void {
    this.main.hover(x, y);
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
  const refresh = () => iface?.refresh();

  const display = await getWASM(displayUrl);
  const stdlib = await getWASM(stdlibUrl);
  const main = await getWASM(mainUrl, {
    display,
    stdlib,
    host: { debug, refresh, rng },
  });
  iface = new WasmInterface(
    display as unknown as DisplayModule,
    main as unknown as MainModule
  );
  return iface;
}

export default getInterface;
