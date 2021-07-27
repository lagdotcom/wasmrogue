import { Keys, Terminal } from "wglt";

import { WasmInterface } from "./interface";

const keys = [
  // Arrows
  Keys.VK_LEFT,
  Keys.VK_UP,
  Keys.VK_RIGHT,
  Keys.VK_DOWN,
  Keys.VK_CLEAR,

  // Numpad
  Keys.VK_NUMPAD4,
  Keys.VK_NUMPAD8,
  Keys.VK_NUMPAD6,
  Keys.VK_NUMPAD2,
  Keys.VK_NUMPAD5,

  // VI keys
  Keys.VK_H,
  Keys.VK_K,
  Keys.VK_L,
  Keys.VK_J,
  Keys.VK_PERIOD,

  // other stuff
  Keys.VK_ESCAPE,
  Keys.VK_G,
];

export default class Display {
  e: HTMLCanvasElement;
  w: number;
  h: number;
  term: Terminal;

  constructor(private i: WasmInterface, private container: HTMLElement) {
    this.e = document.createElement("canvas");
    this.w = i.displayWidth;
    this.h = i.displayHeight;

    this.term = new Terminal(this.e, this.w, this.h);

    container.append(this.e);
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

  refresh() {
    const { term } = this;
    const { display, displayFg, displayBg } = this.i;

    let i = 0;
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        const ch = display.getUint8(i);
        const fg = displayFg.getUint32(i * 4, true);
        const bg = displayBg.getUint32(i * 4, true);

        term.drawChar(x, y, ch, fg, bg);
        i++;
      }
    }
  }
}
