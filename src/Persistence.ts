import { WasmInterface } from "./interface";

const saveFilename = "save";

export default class Persistence {
  db!: IDBDatabase;

  constructor(private i: WasmInterface) {
    i.persistence = this;

    const req = indexedDB.open("wasmrogue", 1);
    req.addEventListener("error", () => {
      throw new Error("Couldn't load database");
    });
    req.addEventListener("success", () => (this.db = req.result));
    req.addEventListener("upgradeneeded", (e) => {
      const db = req.result;
      if (e.oldVersion < 1) {
        db.createObjectStore("files");
      }
    });
  }

  load() {
    const transaction = this.db.transaction(["files"], "readonly");
    const store = transaction.objectStore("files");
    const request = store.get(saveFilename) as IDBRequest<
      ArrayBuffer | undefined
    >;
    request.addEventListener("success", () => {
      if (!request.result) return this.i.main.loadFailed();

      const data = request.result;
      const source = new DataView(data);
      const destination = this.i.mainMem(0, data.byteLength);
      this.copy(destination, source);

      this.i.main.loadSucceeded();
    });
    request.addEventListener("error", () => this.i.main.loadFailed());
  }

  save(source: DataView) {
    const buffer = new ArrayBuffer(source.byteLength);
    const dest = new DataView(buffer);
    this.copy(dest, source);

    const transaction = this.db.transaction(["files"], "readwrite");
    transaction.addEventListener("complete", () => console.log("saved"));
    transaction.addEventListener("error", () => console.log("could not save"));

    const files = transaction.objectStore("files");
    files.put(buffer, saveFilename);
  }

  copy(destination: DataView, source: DataView) {
    for (let i = 0; i < source.byteLength; i++)
      destination.setUint8(i, source.getUint8(i));
  }
}
