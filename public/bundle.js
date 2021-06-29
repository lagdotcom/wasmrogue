(function () {
    'use strict';

    class Display {
        i;
        e;
        constructor(i) {
            this.i = i;
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

    var module = "63ad89014d9b6c49.wasm";

    class WasmInterface {
        i;
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
        get tiles() {
            return new Uint8Array(this.i.memory.buffer.slice(this.i.gTiles.value, this.tileSize));
        }
        draw(x, y, ch) {
            return this.i.draw(x, y, ch.charCodeAt(0));
        }
        initialise(width, height) {
            return this.i.initialise(width, height);
        }
    }
    const getInterface = () => WebAssembly.instantiateStreaming(fetch(module)).then(({ instance }) => new WasmInterface(instance.exports));

    getInterface().then((i) => {
        window.i = i;
        i.initialise(80, 50);
        const px = Math.floor(i.width / 2);
        const py = Math.floor(i.height / 2);
        i.draw(px, py, "@");
        window.d = new Display(i);
    });

}());
//# sourceMappingURL=bundle.js.map
