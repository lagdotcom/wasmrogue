import { WasmInterface } from "./interface";

export default class Display {
  e: HTMLTextAreaElement;
  w: number;
  h: number;

  constructor(private i: WasmInterface) {
    this.e = document.createElement("textarea");
    this.e.cols = i.width + 2;
    this.e.rows = i.height;
    this.e.readOnly = true;

    this.w = i.width;
    this.h = i.height;

    document.body.append(this.e);
    this.refresh();
  }

  tile(x: number, y: number) {
    if (x === this.i.px && y === this.i.py) return "@";
    return String.fromCharCode(this.i.tiles[y * this.w + x]);
  }

  refresh() {
    let s = "";
    for (let y = 0; y < this.h; y++) {
      s += "\n";
      for (let x = 0; x < this.w; x++) {
        const ch = this.tile(x, y);

        s += ch;
      }
    }

    this.e.value = s.substr(1);
  }
}
