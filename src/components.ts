import DataComponent from "./DataComponent";
import { WasmInterface } from "./interface";
import TagComponent from "./TagComponent";

export const makeAppearanceComponent = (i: WasmInterface) =>
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

export const makeAIComponent = (i: WasmInterface) =>
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

export const makeCarriedComponent = (i: WasmInterface) =>
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

export const makeConsumableComponent = (i: WasmInterface) =>
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

export const makeFighterComponent = (i: WasmInterface) =>
  new DataComponent(
    i,
    "Fighter",
    i.main.Mask_Fighter.value,
    i.main.gFighters.value,
    16,
    (mem) => ({
      maxHp: mem.getUint32(0, true),
      hp: mem.getInt32(4, true),
      defence: mem.getUint32(8, true),
      power: mem.getUint32(12, true),
    })
  );

export const makeInventoryComponent = (i: WasmInterface) =>
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

export const makePositionComponent = (i: WasmInterface) =>
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

export const makeItemComponent = (i: WasmInterface) =>
  new TagComponent(i, "Item", i.main.Mask_Item.value);

export const makePlayerComponent = (i: WasmInterface) =>
  new TagComponent(i, "Player", i.main.Mask_Player.value);

export const makeSolidComponent = (i: WasmInterface) =>
  new TagComponent(i, "Solid", i.main.Mask_Solid.value);
