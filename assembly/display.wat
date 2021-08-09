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

  (global $boxTL i32 (i32.const 218))
  (global $boxT  i32 (i32.const 196))
  (global $boxTR i32 (i32.const 191))
  (global $boxR  i32 (i32.const 179))
  (global $boxBR i32 (i32.const 217))
  (global $boxB  i32 (i32.const 196))
  (global $boxBL i32 (i32.const 192))
  (global $boxL  i32 (i32.const 179))
  (global $boxM  i32 (i32.const 32))

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

  (func $setFgBg (export "setFgBg") (param $x i32) (param $y i32) (param $fg i32) (param $bg i32)
    (i32.store
      (call $getFGXY (local.get $x) (local.get $y))
      (local.get $fg)
    )
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

  (func $drawBox (export "drawBox") (param $sx i32) (param $sy i32) (param $w i32) (param $h i32) (param $fg i32) (param $bg i32)
    (local $ex i32)
    (local $ey i32)
    (local $x i32)
    (local $y i32)
    (local $ch i32)

    (local.set $ex (i32.sub (i32.add (local.get $sx) (local.get $w)) (i32.const 1)))
    (local.set $ey (i32.sub (i32.add (local.get $sy) (local.get $h)) (i32.const 1)))

    (local.set $y (local.get $sy))
    (loop $rows
      (local.set $x (local.get $sx))
      (loop $cols
        (if (i32.eq (local.get $x) (local.get $sx)) (then
          (if (i32.eq (local.get $y) (local.get $sy)) (then
            (local.set $ch (global.get $boxTL))
          ) (else
            (if (i32.eq (local.get $y) (local.get $ey))
              (local.set $ch (global.get $boxBL))
              (local.set $ch (global.get $boxL))
            )
          ))
        ) (else
          (if (i32.eq (local.get $x) (local.get $ex)) (then
            (if (i32.eq (local.get $y) (local.get $sy)) (then
              (local.set $ch (global.get $boxTR))
            ) (else
              (if (i32.eq (local.get $y) (local.get $ey))
                (local.set $ch (global.get $boxBR))
                (local.set $ch (global.get $boxR))
              )
            ))
          ) (else
            (if (i32.eq (local.get $y) (local.get $sy)) (then
              (local.set $ch (global.get $boxT))
            ) (else
              (if (i32.eq (local.get $y) (local.get $ey))
                (local.set $ch (global.get $boxB))
                (local.set $ch (global.get $boxM))
              )
            ))
          ))
        ))

        (call $drawFgBg
          (local.get $x)
          (local.get $y)
          (local.get $ch)
          (local.get $fg)
          (local.get $bg)
        )

        (br_if $cols (i32.le_u
          (local.tee $x (i32.add (local.get $x) (i32.const 1)))
          (local.get $ex)
        ))
      )

      (br_if $rows (i32.le_u
        (local.tee $y (i32.add (local.get $y) (i32.const 1)))
        (local.get $ey)
      ))
    )
  )

  (func $fadeOut (export "fadeOut") (param $div i32)
    (local $i i32)
    (local $f i32)
    (local $b i32)

    (local.set $f (global.get $fg))
    (local.set $b (global.get $bg))
    (loop $colours
      (i32.store8 (local.get $f) (i32.div_u (i32.load8_u (local.get $f)) (local.get $div)))
      (i32.store8 (local.get $b) (i32.div_u (i32.load8_u (local.get $b)) (local.get $div)))

      (local.set $f (i32.add (local.get $f) (i32.const 1)))
      (local.set $b (i32.add (local.get $b) (i32.const 1)))

      (br_if $colours (i32.lt_u (local.tee $i (i32.add (local.get $i) (i32.const 1))) (global.get $colourSize)))
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
