import { Keys, Terminal } from "wglt";

import { WasmInterface } from "./interface";
import { range } from "./utils";

const keys = [
  // grab all letters (inventory, etc.)
  ...range(Keys.VK_Z + 1, Keys.VK_A),

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
  // Keys.VK_H,
  // Keys.VK_K,
  // Keys.VK_L,
  // Keys.VK_J,
  Keys.VK_PERIOD,

  // other stuff
  Keys.VK_ENTER,
  Keys.VK_ESCAPE,
  Keys.VK_PAGE_UP,
  Keys.VK_PAGE_DOWN,
  Keys.VK_END,
  Keys.VK_HOME,
  Keys.VK_F5,
  Keys.VK_SLASH,
];

export default class Display {
  e: HTMLCanvasElement;
  w: number;
  h: number;
  mx: number;
  my: number;
  term: Terminal;

  constructor(private i: WasmInterface, private container: HTMLElement) {
    this.e = document.createElement("canvas");
    this.w = i.displayWidth;
    this.h = i.displayHeight;

    this.term = new Terminal(this.e, this.w, this.h);
    this.mx = 0;
    this.my = 0;

    container.append(this.e);
    i.output = this;
    this.refresh();

    this.term.update = this.update.bind(this);
    this.e.focus();
  }

  update() {
    let k = 0;

    for (const vk of keys) {
      if (this.term.isKeyPressed(vk)) {
        k = vk;
        break;
      }
    }

    if (k) {
      let mod = 0;
      if (this.term.isKeyDown(Keys.VK_SHIFT)) mod |= 1;
      if (this.term.isKeyDown(Keys.VK_CONTROL)) mod |= 2;
      if (this.term.isKeyDown(Keys.VK_ALT)) mod |= 4;
      this.i.input(k, mod);
    }

    if (this.term.mouse.x !== this.mx || this.term.mouse.y !== this.my) {
      this.mx = this.term.mouse.x;
      this.my = this.term.mouse.y;
      this.i.hover(this.mx, this.my);
    }
  }

  refresh() {
    const { term } = this;
    const { displayChars, displayFg, displayBg } = this.i;

    let i = 0,
      j = 0;
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        const ch = displayChars.getUint8(i);
        const fg = displayFg.getUint32(j, true);
        const bg = displayBg.getUint32(j, true);

        term.drawChar(x, y, ch, fg, bg);
        i++;
        j += 4;
      }
    }
  }
}
