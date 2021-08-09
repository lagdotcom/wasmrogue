import Display from "./Display";
import getInterface from "./interface";
import Persistence from "./Persistence";

getInterface().then((i) => {
  const container = document.getElementById("container") || document.body;
  (window as any).i = i;

  i.initialise(80, 40);

  const d = new Display(i, container);
  (window as any).d = d;

  const p = new Persistence(i);
});
