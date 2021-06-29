(module
  (global $chSpace i32 (i32.const 32))
  (global $chWall i32 (i32.const 35))
  (global $chDot i32 (i32.const 46))
  (global $gWidth (export "gWidth") (mut i32) (i32.const 0))
  (global $gHeight (export "gHeight") (mut i32) (i32.const 0))
  (global $gTiles (export "gTiles") (mut i32) (i32.const 0))
  (memory (export "memory") 1) ;; 64kB should be enough for anyone

  (func $initialise (export "initialise") (param $w i32) (param $h i32)
    (local $count i32)
    (local $x i32)
    (local $y i32)
    (local $i i32)

    (global.set $gWidth (local.get $w))
    (global.set $gHeight (local.get $h))

    (local.set $count (i32.mul
      (local.get $w)
      (local.get $h)
    ))

    (local.set $i (i32.const 0))
    (local.set $y (i32.const 0))
    (block (loop
      (local.set $x (i32.const 0))
      (block (loop
        (if (i32.or
          (i32.or
            (i32.eq (local.get $x) (i32.const 0))
            (i32.eq (local.get $y) (i32.const 0))
          )
          (i32.or
            (i32.eq (local.get $x) (i32.sub (local.get $w) (i32.const 1)))
            (i32.eq (local.get $y) (i32.sub (local.get $h) (i32.const 1)))
          )
        )
          (then (i32.store8 (local.get $i) (global.get $chWall)))
          (else (i32.store8 (local.get $i) (global.get $chDot)))
        )

        (local.set $i (i32.add (local.get $i) (i32.const 1)))
        (local.set $x (i32.add (local.get $x) (i32.const 1)))
        (br_if 1 (i32.eq (local.get $x) (local.get $w)))
        (br 0)
      ))

      (local.set $y (i32.add (local.get $y) (i32.const 1)))
      (br_if 1 (i32.eq (local.get $y) (local.get $h)))
      (br 0)
    ))
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
)
