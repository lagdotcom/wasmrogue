import Display from "./Display";
import Inputs from "./Inputs";
import getInterface from "./interface";

getInterface().then((i) => {
  (window as any).i = i;

  i.initialise(80, 50);

  const d = new Display(i);
  const n = new Inputs(i, (key, id) => {
    console.log("key", key, id);
    d.refresh();
  });

  (window as any).d = d;
  (window as any).n = n;
});
