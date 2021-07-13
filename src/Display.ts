import { Keys, Terminal } from "wglt";

import { RAppearance, REntity, RPosition, WasmInterface } from "./interface";
import { range } from "./utils";

const keys = [Keys.VK_LEFT, Keys.VK_UP, Keys.VK_RIGHT, Keys.VK_DOWN, Keys.VK_G];

type RVisibleEntity = REntity & {
  Appearance: RAppearance;
  Position: RPosition;
};
const isVisible = (e: REntity): e is RVisibleEntity =>
  Boolean(e.Appearance && e.Position);

export default class Display {
  e: HTMLCanvasElement;
  w: number;
  h: number;
  entityIDs: number[];
  entities!: RVisibleEntity[];
  term: Terminal;
  tiles!: Uint8Array;

  constructor(private i: WasmInterface, private container: HTMLElement) {
    this.e = document.createElement("canvas");
    this.w = i.mapWidth;
    this.h = i.mapHeight;

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

    const [e] = this.getEntitiesAt(x, y);
    if (e) return [e.Appearance.ch, e.Appearance.fg, tt.bg];

    return [tt.ch, tt.fg, tt.bg];
  }

  getEntitiesAt(x: number, y: number) {
    return this.entities.filter(
      (e) => e.Position.x === x && e.Position.y === y
    );
  }

  updateEntityList() {
    // TODO is this good? lol
    this.entities = this.entityIDs
      .map((id) => this.i.entity(id))
      .filter(isVisible);
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
