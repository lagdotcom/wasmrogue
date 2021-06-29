import { WasmInterface } from "./interface";

export class Display {
  e: HTMLTextAreaElement;

  constructor(private i: WasmInterface) {
    this.e = document.createElement("textarea");
    this.e.cols = i.width + 2;
    this.e.rows = i.height;
    this.e.readOnly = true;

    document.body.append(this.e);
    this.refresh();
  }

  refresh() {
    let s = "";
    let i = 0;
    for (let y = 0; y < this.i.height; y++) {
      s += "\n";
      for (let x = 0; x < this.i.width; x++) {
        const ch = String.fromCharCode(this.i.tiles[i]);
        i++;

        s += ch;
      }
    }

    this.e.value = s.substr(1);
  }
}
