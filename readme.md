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
- `[[eval64 expression]]` is the same thing but results in an `i64`. Also aliased as `[[=64 ]]`. Thinking of refactoring this (maybe `[[= type ...]]`?)
- `[[string expression]]` is similar but it expects the result to be a string. It stores it in the string table and returns an offset to the data.
- `[[strings]]` returns the content of the string table for filling a `(data)`.
- `[[consts prefix start names...]]` defines an enumerated set of `(global)`s. It also defines `_Next` as one higher than the largest defined constant.
- `[[struct name field:type...]]` defines a memory structure. It also defines `sizeof_name`.
- `[[reserve name amount export]]` saves the position of the data pointer in a `(global)` then moves the data pointer `amount` ahead. `export` is optional.
- `[[align size]]` aligns the data pointer with the given size, or 4.
- `[[data struct field=value...]]` constructs a string representing the given `struct` with its values filled in. Useful in `(data)`s.
- `[[memory export]]` defines a `(memory)` big enough to fit all reserved space. `export` is optional.
- `[[load pointer struct.field]]` reads a structure field using `pointer` as the start of the structure.
- `[[store pointer struct.field value]]` writes a structure field using `pointer` as the start of the structure.
- `[[component name field:type...]]` is like `[[struct]]` but it also defines a mask constant and functions to check presence, get, attach and detach components from entities.
- `[[attach entity struct field=value...]]` attaches a component to a given entity (saves you having to remember the field order).
- `[[system Name component...]]` generates two functions:

  - `sysName()` which runs the system on all matching entities
  - `doName(id, component...)` which runs the system on one entity

  It is ended by `[[/system]]`, which closes the function body for `doName`.

`[[string]]` relies on the following environment:

- `$Strings: i32`

`[[component]]` and `[[system]]` rely on the following environment:

- `[[struct Entity mask:i64 ...]]`
- `$getEntity(eid:i32): i32`
- `$maxEntities: i32`

The preprocessor's parsing mechanism is custom and weird. It shouldn't get in the way. It's okay to put commands inside other commands. It's also okay to put WASM code as command arguments, at least sometimes.

### ECS

- Entity: `i64` mask (bit mask of component presence, so up to 64 components possible)

  Might extend this with another `i64` later if I need more components. Maybe for Tag components?

- Component: array of data specific to component
- System: `sys*` functions

### Memory Layout

My memory layout is dynamic because my preprocessor handles it. Here's what is in the current build:

| Start  | Size        | Description     |
| ------ | ----------- | --------------- |
| 0      | 19\*2       | Tile types      |
| 40     | 1..3        | Current action  |
| 48     | 256\*8      | Entity data     |
| 2096   | 256\*10     | Appearance data |
| 4656   | 256\*1      | AI data         |
| 4912   | 256\*16     | Fighter data    |
| 9008   | 256\*2      | Position data   |
| 9520   | 32\*4       | Room data       |
| 9648   | 100\*100    | TileMap         |
| 19648  | 100\*100    | VisibleMap      |
| 29648  | 100\*100    | KnownMap        |
| 39648  | 100\*100    | PathMap         |
| 49648  | 100\*100    | Display (chars) |
| 59648  | 100\*100\*4 | Display (fg)    |
| 99648  | 100\*100\*4 | Display (bg)    |
| 139648 | 100\*100\   | Display (layer) |
| 149648 | 1000        | Strings         |
| 150648 | 100         | temp string     |
| 150748 | 20          | temp (itoa)     |
| 150768 | 100\*100\*2 | dijkstra queue  |
| 170768 | 105\*5      | message log     |
| 171293 | -           | -               |

So, my data currently fits in three WebAssembly memory pages (64kB each).

## Log

### 2021-07-31

Added message count tracking and the cursor hover thing.

### 2021-07-30

Thought about implementing a proper allocator but put it off in favour of statically allocating enough room for messages (hopefully). Finished message log.

### 2021-07-27

Finally done with part 6! There were a lot of technical things to do here and I'm almost certain I solved them in the worst possible way.

### 2021-07-26

Only slightly late, started on combat (part 6). Refactored action code a bit because it was annoying me.

### 2021-07-19

Forgot to write yesterday, but I added FOV (tutorial part 4) and started doing monster spawning (part 5). Today I finished that off and added a Solid "tag" component that prevents movement. Also, now it will clear the visible/explored/entity memory when generating a new dungeon.

### 2021-07-15

I finished writing the ECS! I also moved rendering into the WASM, so now the interface doesn't have to give any info except for the display memory and the input function. It still does though, useful for debugging.

### 2021-07-13

Week 3 has started but I'm not quite ready for it yet. I want to start using an ECS now so that later changes will be easier. In preparation, I... turned on TypeScript strict mode to give me something else to do.

### 2021-07-09

Done with part 2 and part 3 now. For speed, I'm passing in a wrapper of JavaScript's `Math.random` call for the RNG, but I should probably replace that with a pure WASM solution at some point. Still no signs of an ECS!

### 2021-07-07

Fixed my parser but I'm not using it yet. Instead, looked at part 2 of the tutorial and implemented a few things. I also saw [this post](https://old.reddit.com/r/roguelikedev/comments/odulc3/update_wglt_is_blazing_fast_for_drawing_ascii_in/) and decided to use it. Might even be able to give the engine a direct memory access somehow! Anyway, I don't have an ECS yet. Will have to fix before I get too far into the tutorial.

### 2021-07-06

Spent hours today trying to write my own programming language parser and failing.

### 2021-06-30

Decided to start writing a readme and this log. I wrote the rest of this repo yesterday. Initially, I was using AssemblyScript but I decided that was just too easy considering I've already made a roguelike in pure TypeScript. The only tools I'm using are [rollup](rollupjs.org) to bundle my modules (though redblobgames said they use `esbuild` recently) and [wat2wasm](https://webassembly.github.io/wabt/demo/wat2wasm/) to compile my text-format WASM into the binary format that browsers use. Completing parts 0 and 1 of the tutorial was fairly simple after I wrote my embedder (check `src/interface.ts`). I expect this interface to change dramatically over time, especially as I'm pretty new to WASM, though I have written Z80 ASM and Forth code before (relevant as a stack machine).

Later, I refactored the code to separate input and actions, much in the tutorial style. However, I'm doing it by manually poking bytes. :)
