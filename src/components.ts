import DataComponent from "./DataComponent";
import { WasmInterface } from "./interface";
import TagComponent from "./TagComponent";

const appearance = (i: WasmInterface) =>
  new DataComponent(
    i,
    "Appearance",
    i.main.Mask_Appearance.value,
    i.main.gAppearances.value,
    10,
    (mem) => ({
      ch: mem.getUint8(0),
      layer: mem.getUint8(1),
      fg: mem.getUint32(2, true),
      name: i.string(mem.getUint32(6, true)),
    })
  );

const ai = (i: WasmInterface) =>
  new DataComponent(
    i,
    "AI",
    i.main.Mask_AI.value,
    i.main.gAIs.value,
    3,
    (mem) => ({
      fn: mem.getUint8(0),
      chain: mem.getUint8(1),
      duration: mem.getUint8(2),
    })
  );

const carried = (i: WasmInterface) =>
  new DataComponent(
    i,
    "Carried",
    i.main.Mask_Carried.value,
    i.main.gCarrieds.value,
    1,
    (mem) => ({
      carrier: mem.getUint8(0),
    })
  );

const consumable = (i: WasmInterface) =>
  new DataComponent(
    i,
    "Consumable",
    i.main.Mask_Consumable.value,
    i.main.gConsumables.value,
    4,
    (mem) => ({
      fn: mem.getUint8(0),
      power: mem.getUint8(1),
      range: mem.getUint8(2),
      radius: mem.getUint8(3),
    })
  );

const fighter = (i: WasmInterface) =>
  new DataComponent(
    i,
    "Fighter",
    i.main.Mask_Fighter.value,
    i.main.gFighters.value,
    8,
    (mem) => ({
      maxHp: mem.getUint8(0),
      hp: mem.getInt8(1),
      defence: mem.getUint8(2),
      power: mem.getUint8(3),
      xp: mem.getUint32(4),
    })
  );

const inventory = (i: WasmInterface) =>
  new DataComponent(
    i,
    "Inventory",
    i.main.Mask_Inventory.value,
    i.main.gInventories.value,
    1,
    (mem) => ({
      size: mem.getUint8(0),
    })
  );

const level = (i: WasmInterface) =>
  new DataComponent(
    i,
    "Level",
    i.main.Mask_Level.value,
    i.main.gLevels.value,
    7,
    (mem) => ({
      level: mem.getUint8(0),
      formulaBase: mem.getUint8(1),
      formulaFactor: mem.getUint8(2),
      xp: mem.getUint32(3, true),
    })
  );

const position = (i: WasmInterface) =>
  new DataComponent(
    i,
    "Position",
    i.main.Mask_Position.value,
    i.main.gPositions.value,
    2,
    (mem) => ({
      x: mem.getUint8(0),
      y: mem.getUint8(1),
    })
  );

const item = (i: WasmInterface) =>
  new TagComponent(i, "Item", i.main.Mask_Item.value);

const player = (i: WasmInterface) =>
  new TagComponent(i, "Player", i.main.Mask_Player.value);

const solid = (i: WasmInterface) =>
  new TagComponent(i, "Solid", i.main.Mask_Solid.value);

const allComponents = [
  ai,
  appearance,
  carried,
  consumable,
  fighter,
  inventory,
  item,
  level,
  player,
  position,
  solid,
];
export const makeAllComponents = (i: WasmInterface) =>
  allComponents.map((fn) => fn(i));
