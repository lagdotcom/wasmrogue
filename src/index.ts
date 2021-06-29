import getInterface from "./interface";

getInterface().then((ex) => {
  const { add, fib } = ex;
  console.log(add(3, 4));
  console.log(fib(18));

  console.log(ex);
});
