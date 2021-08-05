export const range = (max: number, min: number = 0) =>
  Array.from(Array(max - min).keys(), (i) => i + min);

export const rng = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1) + min);
