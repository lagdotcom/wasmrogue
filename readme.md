# WASMRogue

It's a roguelike (made during [r/roguelikedev does the complete roguelike tutorial 2021](https://www.reddit.com/r/roguelikedev/comments/oa2g5r/roguelikedev_does_the_complete_roguelike_tutorial/))! It's written in WASM, with a TypeScript embedder!

## Notes

- Input has to be grabbed by TypeScript (WASM has no DOM access) and there's no easy way to pass strings between the two execution contexts, so the key code is transmitted as an integer. I'm using the VK constants that `wglt` thoughtfully provides.
- Pandepic dared me to write an ECS. That will give me some memory layout things to think about.

## Technical Stuff

### Preprocessor

The preprocessor (`src/build/preprocess.ts`) tries to be reasonably intelligent about how it transforms and understands the underlying WASM:

- `(global)` either defines a constant or a global variable.
- `(local)` and `(param)` define local variables.
- `(func)` forgets all defined local variables.

Preprocessor commands:

- `[[eval expression]]` runs `expression` in JavaScript and returns the result as `(i32.const whatever)`. Also aliased as `[[= ]]`.
- `[[consts prefix start names...]]` defines an enumerated set of `(global)`s. It also defines `_Next` as one higher than the largest defined constant.
- `[[struct name field:type...]]` defines a memory structure. It also defines `sizeof_name`.
- `[[reserve name amount export]]` saves the position of the data pointer in a `(global)` then moves the data pointer `amount` ahead. `export` is optional.
- `[[align size]]` aligns the data pointer with the given size, or 4.
- `[[data struct field=value...]]` constructs a string representing the given `struct` with its values filled in. Useful in `(data)`s.
- `[[memory export]]` defines a `(memory)` big enough to fit all reserved space. `export` is optional.
- `[[load pointer struct.field]]` reads a structure field using `pointer` as the start of the structure.
- `[[store pointer struct.field value]]` writes a structure field using `pointer` as the start of the structure.

The preprocessor's parsing mechanism is custom and weird. It shouldn't get in the way. It's okay to put commands inside other commands. It's also okay to put WASM code as command arguments, at least sometimes.

### Memory Layout

My memory layout is dynamic because my preprocessor handles most of it. Here's what is in the current build:

| Start | Size     | Description    |
| ----- | -------- | -------------- |
| 0     | 11\*2    | Tile types     |
| 24    | 1..3     | Current action |
| 32    | 256\*8   | Entity data    |
| 2080  | 32\*4    | Room data      |
| 2208  | 100\*100 | Tilemap        |

This will probably change a fair bit when the ECS appears.

### Actions

The equivalent of the tutorial's Action subclasses are stored like this:

| ID  | Arguments       | Type |
| --- | --------------- | ---- |
| 00  |                 | None |
| 01  | `s8` dx `s8` dy | Move |

## Log

### 2021-07-09

Done with part 2 and part 3 now. For speed, I'm passing in a wrapper of JavaScript's `Math.random` call for the RNG, but I should probably replace that with a pure WASM solution at some point. Still no signs of an ECS!

### 2021-07-07

Fixed my parser but I'm not using it yet. Instead, looked at part 2 of the tutorial and implemented a few things. I also saw [this post](https://old.reddit.com/r/roguelikedev/comments/odulc3/update_wglt_is_blazing_fast_for_drawing_ascii_in/) and decided to use it. Might even be able to give the engine a direct memory access somehow! Anyway, I don't have an ECS yet. Will have to fix before I get too far into the tutorial.

### 2021-07-06

Spent hours today trying to write my own programming language parser and failing.

### 2021-06-30

Decided to start writing a readme and this log. I wrote the rest of this repo yesterday. Initially, I was using AssemblyScript but I decided that was just too easy considering I've already made a roguelike in pure TypeScript. The only tools I'm using are [rollup](rollupjs.org) to bundle my modules (though redblobgames said they use `esbuild` recently) and [wat2wasm](https://webassembly.github.io/wabt/demo/wat2wasm/) to compile my text-format WASM into the binary format that browsers use. Completing parts 0 and 1 of the tutorial was fairly simple after I wrote my embedder (check `src/interface.ts`). I expect this interface to change dramatically over time, especially as I'm pretty new to WASM, though I have written Z80 ASM and Forth code before (relevant as a stack machine).

Later, I refactored the code to separate input and actions, much in the tutorial style. However, I'm doing it by manually poking bytes. :)
