import module from "../build/code.wasm";

interface ModuleInterface {
  gEntities: WebAssembly.Global;
  gEntitySize: WebAssembly.Global;
  gHeight: WebAssembly.Global;
  gMaxEntities: WebAssembly.Global;
  gPlayerID: WebAssembly.Global;
  gTiles: WebAssembly.Global;
  gWidth: WebAssembly.Global;

  memory: WebAssembly.Memory;

  draw(x: number, y: number, ch: number): void;
  initialise(w: number, h: number): void;
  input(code: number): boolean;
  playerMove(mx: number, my: number): void;
}

export interface REntity {
  exists: boolean;
  x: number;
  y: number;
  ch: number;
  colour: number;
}

export class WasmInterface {
  entities: DataView;
  maxEntities: number;
  tiles: DataView;

  constructor(private i: ModuleInterface) {}

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

  draw(x: number, y: number, ch: string): void {
    return this.i.draw(x, y, ch.charCodeAt(0));
  }

  entity(id: number): REntity {
    const eSize = this.i.gEntitySize.value;
    const offset = id * eSize;

    return {
      exists: this.entities.getUint8(offset) !== 0,
      x: this.entities.getUint8(offset + 1),
      y: this.entities.getUint8(offset + 2),
      ch: this.entities.getUint8(offset + 3),
      colour: this.entities.getUint32(offset + 4),
    };
  }

  initialise(width: number, height: number): void {
    this.i.initialise(width, height);
    this.maxEntities = this.i.gMaxEntities.value;
    this.entities = this.slice(
      this.i.gEntities.value,
      this.i.gEntitySize.value * this.maxEntities
    );
    this.tiles = this.slice(this.i.gTiles.value, this.tileSize);
  }

  input(id: number): boolean {
    return this.i.input(id);
  }
}

const getInterface = () =>
  WebAssembly.instantiateStreaming(fetch(module)).then(
    ({ instance }) =>
      new WasmInterface(instance.exports as unknown as ModuleInterface)
  );

export default getInterface;
