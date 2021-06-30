# WASMRogue

It's a roguelike (made during [r/roguelikedev does the complete roguelike tutorial 2021](https://www.reddit.com/r/roguelikedev/comments/oa2g5r/roguelikedev_does_the_complete_roguelike_tutorial/))! It's written in WASM, with a TypeScript embedder!

## Notes

- Input has to be grabbed by TypeScript (WASM has no DOM access) and there's no easy way to pass strings between the two execution contexts, so the key code is transmitted as an integer. In general the ASCII value of the key is used for this, but arrow keys are converted into the 1000-1003 range (this should probably change someday).
- Pandepic dared me to write an ECS. That will give me some memory layout things to think about.

## Technical Stuff

### Memory Layout

As WASM (currently) forces you into using one linear memory space, here's the layout:

| Start | Size   | Description   |
| ----- | ------ | ------------- |
| 0     | 1..3   | Player Action |
| 16    | (w\*h) | Map tiles     |

### Actions

The equivalent of the tutorial's Action subclasses are stored like this:

| ID  | Arguments       | Type |
| --- | --------------- | ---- |
| 00  |                 | None |
| 01  | `s8` dx `s8` dy | Move |

## Log

### 2021-06-30

Decided to start writing a readme and this log. I wrote the rest of this repo yesterday. Initially, I was using AssemblyScript but I decided that was just too easy considering I've already made a roguelike in pure TypeScript. The only tools I'm using are [rollup](rollupjs.org) to bundle my modules (though redblobgames said they use `esbuild` recently) and [wat2wasm](https://webassembly.github.io/wabt/demo/wat2wasm/) to compile my text-format WASM into the binary format that browsers use. Completing parts 0 and 1 of the tutorial was fairly simple after I wrote my embedder (check `src/interface.ts`). I expect this interface to change dramatically over time, especially as I'm pretty new to WASM, though I have written Z80 ASM and Forth code before (relevant as a stack machine).

Later, I refactored the code to separate input and actions, much in the tutorial style. However, I'm doing it by manually poking bytes. :)
