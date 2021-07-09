import { Keys, Terminal } from "wglt";

import { REntity, WasmInterface } from "./interface";
import { range } from "./utils";

const keys = [Keys.VK_LEFT, Keys.VK_UP, Keys.VK_RIGHT, Keys.VK_DOWN, Keys.VK_G];

export default class Display {
  e: HTMLCanvasElement;
  w: number;
  h: number;
  entityIDs: number[];
  entities: REntity[];
  term: Terminal;
  tiles: Uint8Array;

  constructor(private i: WasmInterface, private container: HTMLElement) {
    this.e = document.createElement("canvas");
    this.w = i.width;
    this.h = i.height;

    this.term = new Terminal(this.e, this.w, this.h);

    container.append(this.e);
    this.entityIDs = range(i.maxEntities);
    this.refresh();

    this.term.update = this.update.bind(this);
    this.e.focus();
  }

  update() {
    let k = 0;

    for (let i = 0; i < keys.length; i++) {
      const vk = keys[i];
      if (this.term.isKeyPressed(vk)) {
        k = vk;
        break;
      }
    }

    if (k && this.i.input(k)) this.refresh();
  }

  tile(x: number, y: number): [number, number, number] {
    const id = this.tiles[y * this.w + x];
    const tt = this.i.tileTypes[id];

    const [e] = this.entities.filter((e) => e.x === x && e.y === y);
    if (e) return [e.ch, e.colour, tt.bg];

    return [tt.ch, tt.fg, tt.bg];
  }

  updateEntityList() {
    // TODO is this good? lol
    this.entities = this.entityIDs
      .map((id) => this.i.entity(id))
      .filter((e) => e.exists);
  }

  updateTiles() {
    this.tiles = new Uint8Array(this.i.map.buffer, this.i.map.byteOffset);
  }

  refresh() {
    this.updateEntityList();
    this.updateTiles();
    this.render();
  }

  private render() {
    const { term } = this;

    // term.clear();

    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        const [ch, fg, bg] = this.tile(x, y);

        term.drawChar(x, y, ch, fg, bg);
      }
    }
  }
}
