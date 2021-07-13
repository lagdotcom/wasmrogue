import Display from "./Display";
import getInterface from "./interface";

getInterface().then((i) => {
  const container = document.getElementById("container") || document.body;
  (window as any).i = i;

  i.initialise(60, 40);

  const d = new Display(i, container);
  (window as any).d = d;
});
