export const range = (max: number) => Array.from(Array(max).keys());

export const rng = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1) + min);
