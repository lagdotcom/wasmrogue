(module
  (global $width (export "width") (mut i32) (i32.const 0))
  (global $height (export "height") (mut i32) (i32.const 0))
  (global $size (mut i32) (i32.const 0))
  (global $colourSize (mut i32) (i32.const 0))
  (global $totalSize (mut i32) (i32.const 0))
  (global $minX (export "minX") (mut i32) (i32.const 0))
  (global $minY (export "minY") (mut i32) (i32.const 0))
  (global $maxX (export "maxX") (mut i32) (i32.const 0))
  (global $maxY (export "maxY") (mut i32) (i32.const 0))

  (memory (export "memory") 1)
  (global $chars (export "chars") (mut i32) (i32.const 0))
  (global $fg (export "fg") (mut i32) (i32.const 0))
  (global $bg (export "bg") (mut i32) (i32.const 0))
  ;; TODO remove the need for this???
  (global $layer (mut i32) (i32.const 0))

  (func $memset (param $addr i32) (param $ch i32) (param $size i32)
    (loop $set
      (i32.store8 (local.get $addr) (local.get $ch))
      (local.set $addr (i32.add (local.get $addr) (i32.const 1)))
      (br_if $set (i32.gt_u
        (local.tee $size (i32.sub (local.get $size) (i32.const 1)))
        (i32.const 0))
      )
    )
  )

  (func $resize (export "resize") (param $w i32) (param $h i32)
    (local $needed i32)
    (local $pages i32)

    (global.set $width (local.get $w))
    (global.set $height (local.get $h))
    (global.set $size (i32.mul (local.get $w) (local.get $h)))
    (global.set $colourSize (i32.mul (global.get $size) (i32.const 4)))
    (global.set $totalSize (i32.mul (global.get $size) (i32.const 10)))

    ;; expand memory to fit
    (if (i32.gt_s (local.tee $needed (i32.sub (global.get $totalSize) (i32.mul (memory.size) (i32.const 0x10000)))) (i32.const 0)) (then
      (local.set $pages (i32.div_u (local.get $needed) (i32.const 0x10000)))
      (if (i32.rem_u (local.get $needed) (i32.const 0x10000))
        (local.set $pages (i32.add (local.get $pages) (i32.const 1)))
      )
      (if (i32.lt_s (memory.grow (local.get $pages)) (i32.const 0))
        ;; TODO ran out of memory
        (unreachable)
      )
    ))

    ;; allocate buffers
    (global.set $chars          (i32.const 0))
    (global.set $fg             (global.get $size))
    (global.set $bg    (i32.add (global.get $fg) (global.get $colourSize)))
    (global.set $layer (i32.add (global.get $bg) (global.get $colourSize)))
  )

  (func $clear (export "clear")
    (call $memset (global.get $chars) (i32.const 0) (global.get $totalSize))
  )

  (func $centreOn (export "centreOn") (param $x i32) (param $y i32)
    (global.set $minX (i32.sub
      (local.get $x)
      (i32.div_u (global.get $width) (i32.const 2))
    ))
    (global.set $minY (i32.sub
      (local.get $y)
      (i32.div_u (global.get $height) (i32.const 2))
    ))
    (global.set $maxX (i32.add
      (global.get $minX)
      (global.get $width)
    ))
    (global.set $maxY (i32.add
      (global.get $minY)
      (global.get $height)
    ))
  )

  (func $drawFg (export "drawFg") (param $x i32) (param $y i32) (param $ch i32) (param $fg i32)
    (i32.store8
      (call $getXY (local.get $x) (local.get $y))
      (local.get $ch)
    )
    (i32.store
      (call $getFGXY (local.get $x) (local.get $y))
      (local.get $fg)
    )
  )

  (func $drawFgBg (export "drawFgBg") (param $x i32) (param $y i32) (param $ch i32) (param $fg i32) (param $bg i32)
    (call $drawFg (local.get $x) (local.get $y) (local.get $ch) (local.get $fg))
    (i32.store
      (call $getBGXY (local.get $x) (local.get $y))
      (local.get $bg)
    )
  )

  (func $getLayer (export "getLayer") (param $x i32) (param $y i32) (result i32)
    (i32.load8_s (call $getLayerXY (local.get $x) (local.get $y)))
  )

  (func $setLayer (export "setLayer") (param $x i32) (param $y i32) (param $value i32)
    (i32.store8 (call $getLayerXY (local.get $x) (local.get $y)) (local.get $value))
  )

  (func $contains (export "contains") (param $x i32) (param $y i32) (result i32)
    (i32.and
      (i32.and
        (i32.ge_s (local.get $x) (global.get $minX))
        (i32.lt_s (local.get $x) (global.get $maxX))
      )
      (i32.and
        (i32.ge_s (local.get $y) (global.get $minY))
        (i32.lt_s (local.get $y) (global.get $maxY))
      )
    )
  )

  (func $getXY (param $x i32) (param $y i32) (result i32)
    (i32.add
      (global.get $chars)
      (i32.add
        (i32.mul
          (global.get $width)
          (local.get $y)
        )
        (local.get $x)
      )
    )
  )

  (func $getFGXY (param $x i32) (param $y i32) (result i32)
    (i32.add
      (global.get $fg)
      (i32.mul
        (i32.add
          (i32.mul
            (global.get $width)
            (local.get $y)
          )
          (local.get $x)
        )
        (i32.const 4)
      )
    )
  )

  (func $getBGXY (param $x i32) (param $y i32) (result i32)
    (i32.add
      (global.get $bg)
      (i32.mul
        (i32.add
          (i32.mul
            (global.get $width)
            (local.get $y)
          )
          (local.get $x)
        )
        (i32.const 4)
      )
    )
  )

  (func $getLayerXY (param $x i32) (param $y i32) (result i32)
    (i32.add
      (global.get $layer)
      (i32.add
        (i32.mul
          (global.get $width)
          (local.get $y)
        )
        (local.get $x)
      )
    )
  )
)
