import { WasmInterface } from "./interface";

const conversion = {
  ArrowUp: 1000,
  ArrowRight: 1001,
  ArrowDown: 1002,
  ArrowLeft: 1003,

  Backspace: 8,
  Tab: 9,
  Enter: 13,
  Escape: 27,
  Delete: 127,

  Alt: -1,
  AltGraph: -1,
  AudioVolumeDown: -1,
  AudioVolumeMute: -1,
  AudioVolumeUp: -1,
  CapsLock: -1,
  Clear: -1,
  ContextMenu: -1,
  Control: -1,
  End: -1,
  F1: -1,
  F10: -1,
  F11: -1,
  F12: -1,
  F2: -1,
  F3: -1,
  F4: -1,
  F5: -1,
  F6: -1,
  F7: -1,
  F8: -1,
  F9: -1,
  Home: -1,
  Insert: -1,
  LaunchApplication2: -1,
  MediaPlayPause: -1,
  NumLock: -1,
  PageDown: -1,
  PageUp: -1,
  Pause: -1,
  ScrollLock: -1,
  Shift: -1,
};

export default class Inputs {
  constructor(private i: WasmInterface, cb: (key: string, id: number) => void) {
    window.addEventListener("keydown", (e) => {
      const id = conversion[e.key] ?? e.key.charCodeAt(0);
      if (id < 0) return;

      if (i.input(id)) {
        e.preventDefault();
        cb(e.key, id);
      }
    });
  }
}
