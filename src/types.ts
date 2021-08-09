import DataComponent from "./DataComponent";
import TagComponent from "./TagComponent";

import type { KeysMatching } from "./utils";

export interface RLogMessage {
  fg: number;
  count: number;
  message: string;
}

export interface RAppearance {
  ch: number;
  layer: number;
  fg: number;
  name: string;
}

export interface RAI {
  fn: number;
  chain: number;
  duration: number;
}

export interface RCarried {
  carrier: number;
}

export interface RConsumable {
  fn: number;
  power: number;
  range: number;
  radius: number;
}

export interface RFighter {
  maxHp: number;
  hp: number;
  defence: number;
  power: number;
}

export interface RInventory {
  size: number;
}

export interface RPosition {
  x: number;
  y: number;
}

export interface REntity {
  id: number;
  Appearance?: RAppearance;
  AI?: RAI;
  Carried?: RCarried;
  Consumable?: RConsumable;
  Fighter?: RFighter;
  Inventory?: RInventory;
  Item?: boolean;
  Position?: RPosition;
  Player?: boolean;
  Solid?: boolean;
}

export type RTagComponentName = KeysMatching<REntity, boolean | undefined>;
export type RComponentName = keyof Omit<REntity, "id" | RTagComponentName>;

export interface RTileType {
  walkable: boolean;
  transparent: boolean;
  ch: number;
  fg: number;
  bg: number;
  fgLight: number;
  bgLight: number;
}

export type RComponent = DataComponent<any> | TagComponent<any>;
