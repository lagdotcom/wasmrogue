(module
  (global $chSpace i32 (i32.const 32))
  (global $chWall i32 (i32.const 35))
  (global $chDot i32 (i32.const 46))

[[consts k 1000 Up Right Down Left]]

[[consts act 0 None Move]]

  (global $width (export "gWidth") (mut i32) (i32.const 0))
  (global $height (export "gHeight") (mut i32) (i32.const 0))

[[reserve Action 16]]
[[reserve Tiles 100*100 gTiles]]

  (global $px (export "gPX") (mut i32) (i32.const 0))
  (global $py (export "gPY") (mut i32) (i32.const 0))

[[memory memory]]

  (func $initialise (export "initialise") (param $w i32) (param $h i32)
    ;; (local $count i32)
    (local $x i32)
    (local $y i32)
    (local $i i32)
    (local $lastX i32)
    (local $lastY i32)

    (global.set $width (local.get $w))
    (global.set $height (local.get $h))

    (global.set $px (i32.div_u (local.get $w) (i32.const 2)))
    (global.set $py (i32.div_u (local.get $h) (i32.const 2)))

    ;; (local.set $count (i32.mul
    ;;   (local.get $w)
    ;;   (local.get $h)
    ;; ))

    (local.set $lastX (i32.sub (local.get $w) (i32.const 1)))
    (local.set $lastY (i32.sub (local.get $h) (i32.const 1)))

    (local.set $i (global.get $memTiles))
    (local.set $y (i32.const 0))
    (loop $loopY
      (local.set $x (i32.const 0))
      (loop $loopX
        (if (i32.or
          (i32.or
            (i32.eq (local.get $x) (i32.const 0))
            (i32.eq (local.get $y) (i32.const 0))
          )
          (i32.or
            (i32.eq (local.get $x) (local.get $lastX))
            (i32.eq (local.get $y) (local.get $lastY))
          )
        )
          (then (i32.store8 (local.get $i) (global.get $chWall)))
          (else (i32.store8 (local.get $i) (global.get $chDot)))
        )

        (local.set $i (i32.add (local.get $i) (i32.const 1)))
        (br_if $loopX (i32.ne
          (local.tee $x (i32.add (local.get $x) (i32.const 1)))
          (local.get $w))
        )
      )

      (br_if $loopY (i32.ne
        (local.tee $y (i32.add (local.get $y) (i32.const 1)))
        (local.get $h))
      )
    )
  )

  (func $getTileXY (param $x i32) (param $y i32) (result i32)
    (i32.add
      (i32.add
        (i32.mul
          (global.get $width)
          (local.get $y)
        )
        (i32.mul
          (i32.const 1)
          (local.get $x)
        )
      )
      (global.get $memTiles)
    )
  )

  (func $draw (export "draw") (param $x i32) (param $y i32) (param $ch i32)
    (i32.store8 (call $getTileXY (local.get $x) (local.get $y)) (local.get $ch))
  )

  (func $playerMove (export "playerMove") (param $mx i32) (param $my i32)
    ;; TODO walls etc.
    (global.set $px (i32.add (global.get $px) (local.get $mx)))
    (global.set $py (i32.add (global.get $py) (local.get $my)))
  )

  (func $input (export "input") (param $ch i32) (result i32)
    (call $convertToAction (local.get $ch))
    (call $applyAction)

    (i32.load8_u (global.get $memAction))
  )

  (func $convertToAction (param $ch i32)
    ;; default to no action
    (i32.store8 (global.get $memAction) (global.get $actNone))

    ;; TODO convert to use tables?
    (if (i32.eq (local.get $ch) (global.get $kUp))
      (then (block
        (i32.store8          (global.get $memAction) (global.get $actMove))
        (i32.store8 offset=1 (global.get $memAction) (i32.const 0))
        (i32.store8 offset=2 (global.get $memAction) (i32.const -1))
        (return)
      ))
    )
    (if (i32.eq (local.get $ch) (global.get $kRight))
      (then (block
        (i32.store8          (global.get $memAction) (global.get $actMove))
        (i32.store8 offset=1 (global.get $memAction) (i32.const 1))
        (i32.store8 offset=2 (global.get $memAction) (i32.const 0))
        (return)
      ))
    )
    (if (i32.eq (local.get $ch) (global.get $kDown))
      (then (block
        (i32.store8          (global.get $memAction) (global.get $actMove))
        (i32.store8 offset=1 (global.get $memAction) (i32.const 0))
        (i32.store8 offset=2 (global.get $memAction) (i32.const 1))
        (return)
      ))
    )
    (if (i32.eq (local.get $ch) (global.get $kLeft))
      (then (block
        (i32.store8          (global.get $memAction) (global.get $actMove))
        (i32.store8 offset=1 (global.get $memAction) (i32.const -1))
        (i32.store8 offset=2 (global.get $memAction) (i32.const 0))
        (return)
      ))
    )
  )

  (table $actions anyfunc (elem
    $applyNoAction
    $applyMoveAction
  ))

  (func $applyNoAction)

  (func $applyMoveAction
    (i32.load8_s offset=1 (global.get $memAction))
    (i32.load8_s offset=2 (global.get $memAction))
    (call $playerMove)
  )

  (func $applyAction
    (call_indirect $actions (i32.load8_u (global.get $memAction)))
  )
)
