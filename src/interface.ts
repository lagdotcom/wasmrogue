import module from "../build/manual.wasm";

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

  get tiles() {
    return new Uint8Array(
      this.i.memory.buffer.slice(this.i.gTiles.value, this.tileSize)
    );
  }

  draw(x: number, y: number, ch: string): void {
    return this.i.draw(x, y, ch.charCodeAt(0));
  }

  initialise(width: number, height: number): void {
    return this.i.initialise(width, height);
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
