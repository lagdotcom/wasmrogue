(function () {
    'use strict';

    class Display {
        i;
        e;
        w;
        h;
        constructor(i) {
            this.i = i;
            this.e = document.createElement("textarea");
            this.e.cols = i.width + 2;
            this.e.rows = i.height;
            this.e.readOnly = true;
            this.w = i.width;
            this.h = i.height;
            document.body.append(this.e);
            this.refresh();
        }
        tile(x, y) {
            if (x === this.i.px && y === this.i.py)
                return "@";
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
    class Inputs {
        i;
        constructor(i, cb) {
            this.i = i;
            window.addEventListener("keydown", (e) => {
                const id = conversion[e.key] ?? e.key.charCodeAt(0);
                if (id < 0)
                    return;
                if (i.input(id)) {
                    e.preventDefault();
                    cb(e.key, id);
                }
            });
        }
    }

    var module = "code.wasm";

    class WasmInterface {
        i;
        tiles;
        constructor(i) {
            this.i = i;
        }
        get width() {
            return this.i.gWidth.value;
        }
        get height() {
            return this.i.gHeight.value;
        }
        get tileSize() {
            return this.width * this.height;
        }
        get px() {
            return this.i.gPX.value;
        }
        get py() {
            return this.i.gPY.value;
        }
        draw(x, y, ch) {
            return this.i.draw(x, y, ch.charCodeAt(0));
        }
        initialise(width, height) {
            this.i.initialise(width, height);
            this.tiles = new Uint8Array(this.i.memory.buffer.slice(this.i.gTiles.value, this.tileSize));
        }
        input(id) {
            return this.i.input(id);
        }
    }
    const getInterface = () => WebAssembly.instantiateStreaming(fetch(module)).then(({ instance }) => new WasmInterface(instance.exports));

    getInterface().then((i) => {
        window.i = i;
        i.initialise(80, 50);
        const d = new Display(i);
        const n = new Inputs(i, (key, id) => {
            console.log("key", key, id);
            d.refresh();
        });
        window.d = d;
        window.n = n;
    });

}());
//# sourceMappingURL=bundle.js.map
