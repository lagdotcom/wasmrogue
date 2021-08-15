import mainUrl from "../build/code.wasm";
import displayUrl from "../build/display.wasm";
import stdlibUrl from "../build/stdlib.wasm";
import { makeAllComponents } from "./components";
import Display from "./Display";
import Persistence from "./Persistence";
import { RComponent, REntity, RLogMessage, RTileType } from "./types";
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
  fadeOut(div: number): void;
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
  Mask_Level: WebAssembly.Global;
  gLevels: WebAssembly.Global;
  Mask_Fighter: WebAssembly.Global;
  gFighters: WebAssembly.Global;
  Mask_Position: WebAssembly.Global;
  gPositions: WebAssembly.Global;

  Mask_Item: WebAssembly.Global;
  Mask_Player: WebAssembly.Global;
  Mask_Solid: WebAssembly.Global;

  gGameMode: WebAssembly.Global;
  gRenderMode: WebAssembly.Global;

  gMap: WebAssembly.Global;
  gMapHeight: WebAssembly.Global;
  gMapWidth: WebAssembly.Global;
  gMapSize: WebAssembly.Global;

  gEntities: WebAssembly.Global;
  gEntitySize: WebAssembly.Global;
  gMaxEntities: WebAssembly.Global;
  gNextEntity: WebAssembly.Global;
  gLastEntity: WebAssembly.Global;

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

  initialise(w: number, h: number, sh: number): void;
  hover(x: number, y: number): void;
  input(code: number, mod: number): boolean;
  loadFailed(): void;
  loadSucceeded(): void;
  moveEntity(eid: number, mx: number, my: number): boolean;
}

export class WasmInterface {
  components: RComponent[];
  displayChars: DataView;
  displayFg: DataView;
  displayBg: DataView;
  entityView: DataView;
  maxEntities: number;
  map: DataView;
  output?: Display;
  raw: DataView;
  persistence?: Persistence;
  tileTypes: RTileType[];

  constructor(public display: DisplayModule, public main: MainModule) {
    const empty = new ArrayBuffer(0);
    this.components = [];
    this.displayChars = new DataView(empty);
    this.displayFg = new DataView(empty);
    this.displayBg = new DataView(empty);
    this.entityView = new DataView(empty);
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

  mainMem(start: number, length: number) {
    return new DataView(this.main.memory.buffer, start, length);
  }

  displayMem(start: number, length: number) {
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
    const mask = this.entityView.getBigUint64(
      id * this.main.gEntitySize.value,
      true
    );
    const e: REntity = { id };

    for (const component of this.components)
      if (mask & component.mask) component.add(e);

    return e;
  }

  entities(): REntity[] {
    return range(this.main.gLastEntity.value + 1)
      .map((id) => this.entity(id))
      .filter((e) => Object.keys(e).length > 1);
  }

  private tt(id: number): RTileType {
    const tSize = this.main.gTileTypeSize.value;
    const offset = this.main.gTileTypes.value + id * tSize;
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
    this.main.initialise(width, height, 5);
    this.maxEntities = this.main.gMaxEntities.value;
    this.entityView = this.mainMem(
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

    this.components = makeAllComponents(this);
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
  const load = () => iface?.persistence?.load();
  const refresh = () => iface?.refresh();
  const save = (offset: number, size: number) =>
    iface?.persistence?.save(iface.mainMem(offset, size));

  const display = await getWASM(displayUrl);
  const stdlib = await getWASM(stdlibUrl);
  const main = await getWASM(mainUrl, {
    display,
    stdlib,
    host: { debug, load, refresh, rng, save },
  });
  iface = new WasmInterface(
    display as unknown as DisplayModule,
    main as unknown as MainModule
  );
  return iface;
}

export default getInterface;
