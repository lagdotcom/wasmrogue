# WASMRogue

It's a roguelike (made during [r/roguelikedev does the complete roguelike tutorial 2021](https://www.reddit.com/r/roguelikedev/comments/oa2g5r/roguelikedev_does_the_complete_roguelike_tutorial/))! It's written in WASM, with a TypeScript embedder!

## Notes

- Input has to be grabbed by TypeScript (WASM has no DOM access) and there's no easy way to pass strings between the two execution contexts, so the key code is transmitted as an integer. I'm using the VK constants that `wglt` thoughtfully provides.
- Pandepic dared me to write an ECS. That will give me some memory layout things to think about.

## Technical Stuff

### Memory Layout

My memory layout is dynamic because my preprocessor handles most of it. Here's what is in the current build:

| Start | Size     | Description    |
| ----- | -------- | -------------- |
| 0     | 11\*2    | Tile types     |
| 24    | 1..3     | Current action |
| 32    | 32\*8    | Entity data    |
| 2080  | 100\*100 | Tilemap        |

This will probably change a fair bit when the ECS appears.

### Actions

The equivalent of the tutorial's Action subclasses are stored like this:

| ID  | Arguments       | Type |
| --- | --------------- | ---- |
| 00  |                 | None |
| 01  | `s8` dx `s8` dy | Move |

## Log

### 2021-06-07

Fixed my parser but I'm not using it yet. Instead, looked at part 2 of the tutorial and implemented a few things. I also saw [this post](https://old.reddit.com/r/roguelikedev/comments/odulc3/update_wglt_is_blazing_fast_for_drawing_ascii_in/) and decided to use it. Might even be able to give the engine a direct memory access somehow! Anyway, I don't have an ECS yet. Will have to fix before I get too far into the tutorial.

### 2021-06-06

Spent hours today trying to write my own programming language parser and failing.

### 2021-06-30

Decided to start writing a readme and this log. I wrote the rest of this repo yesterday. Initially, I was using AssemblyScript but I decided that was just too easy considering I've already made a roguelike in pure TypeScript. The only tools I'm using are [rollup](rollupjs.org) to bundle my modules (though redblobgames said they use `esbuild` recently) and [wat2wasm](https://webassembly.github.io/wabt/demo/wat2wasm/) to compile my text-format WASM into the binary format that browsers use. Completing parts 0 and 1 of the tutorial was fairly simple after I wrote my embedder (check `src/interface.ts`). I expect this interface to change dramatically over time, especially as I'm pretty new to WASM, though I have written Z80 ASM and Forth code before (relevant as a stack machine).

Later, I refactored the code to separate input and actions, much in the tutorial style. However, I'm doing it by manually poking bytes. :)
