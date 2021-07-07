(module
  (global $chAt i32 [[= '@']])

  (global $cWhite i32 (i32.const 0xffffff00))
  (global $cYellow i32 (i32.const 0xffff0000))

  (global $kLeft i32 (i32.const 37))
  (global $kUp i32 (i32.const 38))
  (global $kRight i32 (i32.const 39))
  (global $kDown i32 (i32.const 40))

  [[consts act 0 None Move]]

  (global $playerID (export "gPlayerID") (mut i32) (i32.const 0))
  (global $width (export "gWidth") (mut i32) (i32.const 0))
  (global $height (export "gHeight") (mut i32) (i32.const 0))

  [[struct Tile walkable:u8 transparent:u8 ch:u8 fg:i32 bg:i32]]
  [[reserve TileTypes sizeof_Tile*2 gTileTypes]]
  [[align 8]]
  (data $tileTypeData (offset [[= memTileTypes]])
    [[data Tile walkable=1 transparent=1 ch='.' fg=0xffffff00 bg=0x32329600]]
    [[data Tile ch='#' fg=0xffffff00 bg=0x00006400]]
  )
  [[consts tt 0 Floor Wall]]
  (global $ttINVALID (export "gTileTypeCount") i32 [[= ttWall + 1]])
  (global $tileTypeSize (export "gTileTypeSize") i32 [[= sizeof_Tile]])

  [[struct Entity exists:u8 x:u8 y:u8 ch:u8 colour:i32]]
  (global $maxEntities (export "gMaxEntities") i32 (i32.const 256))
  (global $entitySize (export "gEntitySize") i32 [[= sizeof_Entity]])

  [[struct NoneAction id:u8]]
  [[struct MoveAction id:u8 dx:s8 dy:s8]]

  [[reserve Action Math.max(sizeof_NoneAction,sizeof_MoveAction)]]
  [[align 8]]
  [[reserve Entities maxEntities*sizeof_Entity gEntities]]
  [[reserve Map 100*100 gMap]]
  [[memory memory]]

  (func $initialise (export "initialise") (param $w i32) (param $h i32)
    ;; (local $count i32)
    (local $x i32)
    (local $y i32)
    (local $i i32)
    (local $lastX i32)
    (local $lastY i32)

    ;; TODO: check $w * $h < sizeof_Tiles

    (global.set $width (local.get $w))
    (global.set $height (local.get $h))

    ;; (local.set $count (i32.mul
    ;;   (local.get $w)
    ;;   (local.get $h)
    ;; ))

    (local.set $lastX (i32.sub (local.get $w) (i32.const 1)))
    (local.set $lastY (i32.sub (local.get $h) (i32.const 1)))

    (local.set $i (global.get $memMap))
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
          (then (i32.store8 (local.get $i) (global.get $ttWall)))
          (else (i32.store8 (local.get $i) (global.get $ttFloor)))
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

    (call $initEntity (i32.const 0)
      (i32.div_u (local.get $w) (i32.const 2))
      (i32.div_u (local.get $h) (i32.const 2))
      (global.get $chAt)
      (global.get $cWhite)
    )

    (call $initEntity (i32.const 1)
      (i32.sub (i32.div_u (local.get $w) (i32.const 2)) (i32.const 5))
      (i32.div_u (local.get $h) (i32.const 2))
      (global.get $chAt)
      (global.get $cYellow)
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
      (global.get $memMap)
    )
  )

  (func $playerMove (export "playerMove") (param $mx i32) (param $my i32)
    (local $mem i32)
    (local.set $mem (call $getEntity (global.get $playerID)))

    ;; TODO walls etc.
    [[store $mem Entity.x (i32.add [[load $mem Entity.x]] (local.get $mx))]]
    [[store $mem Entity.y (i32.add [[load $mem Entity.y]] (local.get $my))]]
  )

  (func $input (export "input") (param $ch i32) (result i32)
    (call $convertToAction (local.get $ch))
    (call $applyAction)

    [[load $memAction NoneAction.id]]
  )

  (func $convertToAction (param $ch i32)
    ;; default to no action
    [[store $memAction NoneAction.id $actNone]]

    ;; TODO convert to use tables?
    (if (i32.eq (local.get $ch) (global.get $kUp))
      (then (block
        [[store $memAction MoveAction.id $actMove]]
        [[store $memAction MoveAction.dx 0]]
        [[store $memAction MoveAction.dy -1]]
        (return)
      ))
    )
    (if (i32.eq (local.get $ch) (global.get $kRight))
      (then (block
        [[store $memAction MoveAction.id $actMove]]
        [[store $memAction MoveAction.dx 1]]
        [[store $memAction MoveAction.dy 0]]
        (return)
      ))
    )
    (if (i32.eq (local.get $ch) (global.get $kDown))
      (then (block
        [[store $memAction MoveAction.id $actMove]]
        [[store $memAction MoveAction.dx 0]]
        [[store $memAction MoveAction.dy 1]]
        (return)
      ))
    )
    (if (i32.eq (local.get $ch) (global.get $kLeft))
      (then (block
        [[store $memAction MoveAction.id $actMove]]
        [[store $memAction MoveAction.dx -1]]
        [[store $memAction MoveAction.dy 0]]
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
    [[load $memAction MoveAction.dx]]
    [[load $memAction MoveAction.dy]]
    (call $playerMove)
  )

  (func $applyAction
    (call_indirect $actions [[load $memAction NoneAction.id]])
  )

  (func $getEntity (param $id i32) (result i32)
    (i32.add
      (global.get $memEntities)
      (i32.mul (local.get $id) [[= sizeof_Entity]])
    )
  )

  (func $initEntity (param $id i32) (param $x i32) (param $y i32) (param $ch i32) (param $colour i32)
    (local $mem i32)
    (local.set $mem (call $getEntity (local.get $id)))

    [[store $mem Entity.exists 1]]
    [[store $mem Entity.x $x]]
    [[store $mem Entity.y $y]]
    [[store $mem Entity.ch $ch]]
    [[store $mem Entity.colour $colour]]
  )
)
