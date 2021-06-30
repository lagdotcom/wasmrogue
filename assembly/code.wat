(module
  (global $chSpace i32 (i32.const 32))
  (global $chWall i32 (i32.const 35))
  (global $chDot i32 (i32.const 46))

  (global $kUp i32 (i32.const 1000))
  (global $kRight i32 (i32.const 1001))
  (global $kDown i32 (i32.const 1002))
  (global $kLeft i32 (i32.const 1003))

  (global $gWidth (export "gWidth") (mut i32) (i32.const 0))
  (global $gHeight (export "gHeight") (mut i32) (i32.const 0))
  (global $gTiles (export "gTiles") (mut i32) (i32.const 0))

  (global $px (export "gPX") (mut i32) (i32.const 0))
  (global $py (export "gPY") (mut i32) (i32.const 0))

  (memory (export "memory") 1) ;; 64kB should be enough for anyone

  (func $initialise (export "initialise") (param $w i32) (param $h i32)
    (local $count i32)
    (local $x i32)
    (local $y i32)
    (local $i i32)
    (local $last-x i32)
    (local $last-y i32)

    (global.set $gWidth (local.get $w))
    (global.set $gHeight (local.get $h))

    (global.set $px (i32.div_u (local.get $w) (i32.const 2)))
    (global.set $py (i32.div_u (local.get $h) (i32.const 2)))

    (local.set $count (i32.mul
      (local.get $w)
      (local.get $h)
    ))

    (local.set $last-x (i32.sub (local.get $w) (i32.const 1)))
    (local.set $last-y (i32.sub (local.get $h) (i32.const 1)))

    (local.set $i (i32.const 0))
    (local.set $y (i32.const 0))
    (loop $y-loop
      (local.set $x (i32.const 0))
      (loop $x-loop
        (if (i32.or
          (i32.or
            (i32.eq (local.get $x) (i32.const 0))
            (i32.eq (local.get $y) (i32.const 0))
          )
          (i32.or
            (i32.eq (local.get $x) (local.get $last-x))
            (i32.eq (local.get $y) (local.get $last-y))
          )
        )
          (then (i32.store8 (local.get $i) (global.get $chWall)))
          (else (i32.store8 (local.get $i) (global.get $chDot)))
        )

        (local.set $i (i32.add (local.get $i) (i32.const 1)))
        (br_if $x-loop (i32.ne
          (local.tee $x (i32.add (local.get $x) (i32.const 1)))
          (local.get $w))
        )
      )

      (br_if $y-loop (i32.ne
        (local.tee $y (i32.add (local.get $y) (i32.const 1)))
        (local.get $h))
      )
    )
  )

  (func $getXY (param $x i32) (param $y i32) (result i32)
    (i32.add
      (i32.mul
        (global.get $gWidth)
        (local.get $y)
      )
      (i32.mul
        (i32.const 1)
        (local.get $x)
      )
    )
  )

  (func $draw (export "draw") (param $x i32) (param $y i32) (param $ch i32)
    (i32.store8 (call $getXY (local.get $x) (local.get $y)) (local.get $ch))
  )

  (func $playerMove (export "playerMove") (param $mx i32) (param $my i32) (result i32)
    ;; TODO - walls etc.
    (global.set $px (i32.add (global.get $px) (local.get $mx)))
    (global.set $py (i32.add (global.get $py) (local.get $my)))
    (i32.const 1)
  )

  (func $input (export "input") (param $ch i32) (result i32)
    ;; TODO - convert to use tables?
    (if (i32.eq (local.get $ch) (global.get $kUp))
      (then (block
        (call $playerMove (i32.const 0) (i32.const -1))
        (return)
      ))
    )
    (if (i32.eq (local.get $ch) (global.get $kRight))
      (then (block
        (call $playerMove (i32.const 1) (i32.const 0))
        (return)
      ))
    )
    (if (i32.eq (local.get $ch) (global.get $kDown))
      (then (block
        (call $playerMove (i32.const 0) (i32.const 1))
        (return)
      ))
    )
    (if (i32.eq (local.get $ch) (global.get $kLeft))
      (then (block
        (call $playerMove (i32.const -1) (i32.const 0))
        (return)
      ))
    )

    (i32.const 0)
  )
)
