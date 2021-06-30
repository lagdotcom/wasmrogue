import module from "../build/code.wasm";

interface ModuleInterface {
  gHeight: WebAssembly.Global;
  gWidth: WebAssembly.Global;
  gTiles: WebAssembly.Global;
  gPX: WebAssembly.Global;
  gPY: WebAssembly.Global;

  memory: WebAssembly.Memory;

  draw(x: number, y: number, ch: number): void;
  initialise(w: number, h: number): void;
  input(code: number): boolean;
  playerMove(mx: number, my: number): void;
}

export class WasmInterface {
  tiles: Uint8Array;

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
  get px(): number {
    return this.i.gPX.value;
  }
  get py(): number {
    return this.i.gPY.value;
  }

  draw(x: number, y: number, ch: string): void {
    return this.i.draw(x, y, ch.charCodeAt(0));
  }

  initialise(width: number, height: number): void {
    this.i.initialise(width, height);
    this.tiles = new Uint8Array(
      this.i.memory.buffer.slice(this.i.gTiles.value, this.tileSize)
    );
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
