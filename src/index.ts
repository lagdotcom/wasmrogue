import { Display } from "./Display";
import getInterface from "./interface";

getInterface().then((i) => {
  (window as any).i = i;

  i.initialise(80, 50);

  const px = Math.floor(i.width / 2);
  const py = Math.floor(i.height / 2);
  i.draw(px, py, "@");

  (window as any).d = new Display(i);
});
