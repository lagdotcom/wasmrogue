import { REntity, WasmInterface } from "./interface";

export default class Display {
  e: HTMLTextAreaElement;
  w: number;
  h: number;
  entityIDs: number[];
  entities: REntity[];
  tiles: Uint8Array;

  constructor(private i: WasmInterface) {
    this.e = document.createElement("textarea");
    this.e.cols = i.width + 2;
    this.e.rows = i.height;
    this.e.readOnly = true;

    this.w = i.width;
    this.h = i.height;

    document.body.append(this.e);
    this.entityIDs = Array.from(Array(i.maxEntities).keys());
    this.refresh();
  }

  tile(x: number, y: number) {
    const e = this.entities.filter((e) => e.x === x && e.y === y);
    if (e.length) return String.fromCharCode(e[0].ch);

    return String.fromCharCode(this.tiles[y * this.w + x]);
  }

  updateEntityList() {
    // TODO: is this good? lol
    this.entities = this.entityIDs
      .map((id) => this.i.entity(id))
      .filter((e) => e.exists);
  }

  updateTiles() {
    this.tiles = new Uint8Array(this.i.tiles.buffer, this.i.tiles.byteOffset);
  }

  refresh() {
    this.updateEntityList();
    this.updateTiles();
    this.e.value = this.render();
  }

  private render() {
    let s = "";
    for (let y = 0; y < this.h; y++) {
      s += "\n";
      for (let x = 0; x < this.w; x++) {
        const ch = this.tile(x, y);

        s += ch;
      }
    }

    return s.substr(1);
  }
}
