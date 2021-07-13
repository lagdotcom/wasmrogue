(module
  ;; TODO make my own rng!
  (import "host" "rng" (func $rng (param i32) (param i32) (result i32)))

  (global $chAt i32 [[= '@']])

  (global $cWhite i32 (i32.const 0xffffff00))
  (global $cYellow i32 (i32.const 0xffff0000))

  (global $kLeft i32 (i32.const 37))
  (global $kUp i32 (i32.const 38))
  (global $kRight i32 (i32.const 39))
  (global $kDown i32 (i32.const 40))
  (global $kGenerate i32 [[= 'G']])

  (global $playerID (export "gPlayerID") (mut i32) (i32.const 0))

  [[struct Tile walkable:u8 transparent:u8 ch:u8 fg:i32 bg:i32]]
  [[reserve TileTypes sizeof_Tile*2 gTileTypes]]
  [[align 8]]
  (data $tileTypeData (offset [[= TileTypes]])
    [[data Tile walkable=1 transparent=1 ch='.' fg=0xffffff00 bg=0x32329600]]
    [[data Tile ch='#' fg=0xffffff00 bg=0x00006400]]
  )
  [[consts tt 0 Floor Wall]]
  (global $ttINVALID (export "gTileTypeCount") i32 [[= _Next]])
  (global $tileTypeSize (export "gTileTypeSize") i32 [[= sizeof_Tile]])

  [[struct Entity mask:i64]]
  (global $maxEntities (export "gMaxEntities") i32 (i32.const 256))
  (global $entitySize (export "gEntitySize") i32 [[= sizeof_Entity]])

  [[component Appearance ch:u8 colour:i32]]
  [[component Position x:u8 y:u8]]

  [[struct Room x1:u8 y1:u8 x2:u8 y2:u8]]
  (global $maxRoomSize i32 (i32.const 10))
  (global $minRoomSize i32 (i32.const 6))
  (global $maxRooms i32 (i32.const 32))

  [[struct NoneAction id:u8]]
  [[struct MoveAction id:u8 dx:s8 dy:s8]]
  [[struct GenerateAction id:u8]]

  [[reserve Action Math.max(sizeof_NoneAction,sizeof_MoveAction,sizeof_GenerateAction)]]
  [[align 8]]
  [[reserve Entities maxEntities*sizeof_Entity gEntities]]
  [[reserve Appearances maxEntities*sizeof_Appearance gAppearances]]
  [[reserve Positions maxEntities*sizeof_Position gPositions]]
  [[reserve Rooms maxRooms*sizeof_Room gRooms]]

  (global $mapWidth (export "gMapWidth") i32 (i32.const 100))
  (global $mapHeight (export "gMapHeight") i32 (i32.const 100))
  (global $mapSize (export "gMapSize") i32 [[= mapWidth * mapHeight]])
  [[reserve Map mapSize gMap]]

  (global $displaySize (export "gDisplaySize") (mut i32) (i32.const 0))
  (global $displayWidth (export "gDisplayWidth") (mut i32) (i32.const 0))
  (global $displayHeight (export "gDisplayHeight") (mut i32) (i32.const 0))
  [[reserve Display 100*100 gDisplay]]

  [[memory memory]]

  (func $initialise (export "initialise") (param $w i32) (param $h i32)
    ;; TODO check $w * $h < sizeof_Display
    (global.set $displayWidth (local.get $w))
    (global.set $displayHeight (local.get $h))
    (global.set $displaySize (i32.mul (local.get $w) (local.get $h)))

    (call $generateMap)
  )

  (func $fillMap (param $tid i32)
    (local $i i32)
    (local $end i32)
    (local.set $i (global.get $Map))
    (local.set $end (i32.add (global.get $Map) (global.get $mapSize)))

    (loop $fill
      (i32.store8 (local.get $i) (local.get $tid))
      (br_if $fill (i32.ne
        (local.tee $i (i32.add (local.get $i) (i32.const 1)))
        (local.get $end)
      ))
    )
  )

  (func $getRoom (param $id i32) (result i32)
    (i32.add
      (global.get $Rooms)
      (i32.mul
        (local.get $id)
        [[= sizeof_Room]]
      )
    )
  )

  (func $doRoomsIntersect (param $aid i32) (param $bid i32) (result i32)
    (local $a i32)
    (local $b i32)
    (local.set $a (call $getRoom (local.get $aid)))
    (local.set $b (call $getRoom (local.get $bid)))

    (i32.and
      (i32.and
        (i32.le_u [[load $a Room.x1]] [[load $b Room.x2]])
        (i32.ge_u [[load $a Room.x2]] [[load $b Room.x1]])
      )
      (i32.and
        (i32.le_u [[load $a Room.y1]] [[load $b Room.y2]])
        (i32.ge_u [[load $a Room.y2]] [[load $b Room.y1]])
      )
    )
  )

  (func $isRoomBlocked (param $id i32) (result i32)
    (local $i i32)

    (local.set $i (i32.const 0))
    (loop $rooms
      (if (call $doRoomsIntersect (local.get $id) (local.get $i))
        (then
          (i32.const 1)
          (return)
        )
      )

      (br_if $rooms (i32.lt_u
        (local.tee $i (i32.add (local.get $i) (i32.const 1)))
        (local.get $id)
      ))
    )
    (i32.const 0)
  )

  (func $carveRect (param $sx i32) (param $sy i32) (param $ex i32) (param $ey i32)
    (local $x i32)
    (local $y i32)

    (local.set $y (i32.add (local.get $sy) (i32.const 1)))
    (loop $loopY
      (local.set $x (i32.add (local.get $sx) (i32.const 1)))
      (loop $loopX
        (i32.store8 (call $getTileXY (local.get $x) (local.get $y)) (global.get $ttFloor))

        (br_if $loopX (i32.ne
          (local.tee $x (i32.add (local.get $x) (i32.const 1)))
          (local.get $ex))
        )
      )

      (br_if $loopY (i32.ne
        (local.tee $y (i32.add (local.get $y) (i32.const 1)))
        (local.get $ey))
      )
    )
  )

  (func $abs (param $n i32) (result i32)
    (if (i32.lt_s (local.get $n) (i32.const 0))
      (then
        (i32.sub (i32.const 0) (local.get $n))
        (return)
      )
    )
    (local.get $n)
  )

  (func $carveLine (param $x0 i32) (param $y0 i32) (param $x1 i32) (param $y1 i32)
    (local $dx i32)
    (local $dy i32)
    (local $sx i32)
    (local $sy i32)
    (local $err i32)
    (local $e2 i32)

    (local.set $dx (call $abs (i32.sub (local.get $x1) (local.get $x0))))
    (if (i32.lt_u (local.get $x0) (local.get $x1))
      (then (local.set $sx (i32.const 1)))
      (else (local.set $sx (i32.const -1)))
    )
    (local.set $dy (i32.sub (i32.const 0) (call $abs (i32.sub (local.get $y1) (local.get $y0)))))
    (if (i32.lt_u (local.get $y0) (local.get $y1))
      (then (local.set $sy (i32.const 1)))
      (else (local.set $sy (i32.const -1)))
    )
    (local.set $err (i32.add (local.get $dx) (local.get $dy)))

    (loop $draw
      (i32.store8 (call $getTileXY (local.get $x0) (local.get $y0)) (global.get $ttFloor))

      (if (i32.and
        (i32.eq (local.get $x0) (local.get $x1))
        (i32.eq (local.get $y0) (local.get $y1))
      ) (then (return)))

      (local.set $e2 (i32.mul (local.get $err) (i32.const 2)))
      (if (i32.ge_s (local.get $e2) (local.get $dy))
        (then
          (local.set $err (i32.add (local.get $err) (local.get $dy)))
          (local.set $x0 (i32.add (local.get $x0) (local.get $sx)))
        )
      )
      (if (i32.le_s (local.get $e2) (local.get $dx))
        (then
          (local.set $err (i32.add (local.get $err) (local.get $dx)))
          (local.set $y0 (i32.add (local.get $y0) (local.get $sy)))
        )
      )

      (br $draw)
    )
  )

  (func $tunnelBetween (param $sx i32) (param $sy i32) (param $ex i32) (param $ey i32)
    (local $cx i32)
    (local $cy i32)

    (if (i32.eq (call $rng (i32.const 0) (i32.const 1)) (i32.const 0))
      (then
        (local.set $cx (local.get $ex))
        (local.set $cy (local.get $sy))
      )
      (else
        (local.set $cx (local.get $sx))
        (local.set $cy (local.get $ey))
      )
    )

    (call $carveLine (local.get $sx) (local.get $sy) (local.get $cx) (local.get $cy))
    (call $carveLine (local.get $cx) (local.get $cy) (local.get $ex) (local.get $ey))
  )

  (func $saveRoom (param $id i32) (param $x i32) (param $y i32) (param $w i32) (param $h i32)
    (local $r i32)
    (local.set $r (call $getRoom (local.get $id)))
    [[store $r Room.x1 $x]]
    [[store $r Room.y1 $y]]
    [[store $r Room.x2 (i32.add (local.get $x) (local.get $w))]]
    [[store $r Room.y2 (i32.add (local.get $y) (local.get $h))]]
  )

  (func $carveRoom (param $id i32)
    (local $r i32)
    (local.set $r (call $getRoom (local.get $id)))
    (call $carveRect
      [[load $r Room.x1]]
      [[load $r Room.y1]]
      [[load $r Room.x2]]
      [[load $r Room.y2]]
    )
  )

  (func $getRoomCX (param $id i32) (result i32)
    (local $r i32)
    (local.set $r (call $getRoom (local.get $id)))
    (i32.div_u (i32.add [[load $r Room.x1]] [[load $r Room.x2]]) (i32.const 2))
  )

  (func $getRoomCY (param $id i32) (result i32)
    (local $r i32)
    (local.set $r (call $getRoom (local.get $id)))
    (i32.div_u (i32.add [[load $r Room.y1]] [[load $r Room.y2]]) (i32.const 2))
  )

  (func $connectRooms (param $aid i32) (param $bid i32)
    (call $tunnelBetween
      (call $getRoomCX (local.get $aid))
      (call $getRoomCY (local.get $aid))
      (call $getRoomCX (local.get $bid))
      (call $getRoomCY (local.get $bid))
    )
  )

  (func $generateMap
    (local $i i32)
    (local $n i32)
    (local $x i32)
    (local $y i32)
    (local $w i32)
    (local $h i32)

    (call $fillMap (global.get $ttWall))

    (local.set $i (i32.const 0))
    (local.set $n (i32.const 0))
    (loop $rooms
      (local.set $w (call $rng
        (global.get $minRoomSize)
        (global.get $maxRoomSize)
      ))
      (local.set $h (call $rng
        (global.get $minRoomSize)
        (global.get $maxRoomSize)
      ))
      (local.set $x (call $rng
        (i32.const 0)
        (i32.sub (i32.sub (global.get $mapWidth) (local.get $w)) (i32.const 1))
      ))
      (local.set $y (call $rng
        (i32.const 0)
        (i32.sub (i32.sub (global.get $mapHeight) (local.get $h)) (i32.const 1))
      ))
      (call $saveRoom (local.get $n) (local.get $x) (local.get $y) (local.get $w) (local.get $h))

      ;; first room?
      (if (i32.eqz (local.get $n)) (then
        (call $carveRoom (i32.const 0))

        (call $makePlayer
          (call $getRoomCX (i32.const 0))
          (call $getRoomCY (i32.const 0))
        )

        (local.set $n (i32.const 1))
      ) (else
        ;; intersects no other room?
        (if (i32.eqz (call $isRoomBlocked (local.get $n))) (then
          (call $carveRoom (local.get $n))
          (call $connectRooms
            (i32.sub (local.get $n) (i32.const 1))
            (local.get $n)
          )

          (local.set $n (i32.add (local.get $n) (i32.const 1)))
        ))
      ))

      (br_if $rooms (i32.ne
        (local.tee $i (i32.add (local.get $i) (i32.const 1)))
        (global.get $maxRooms)
      ))
    )
  )

  (func $initTestMap
    (local $x i32)
    (local $y i32)
    (local $i i32)
    (local $lastX i32)
    (local $lastY i32)

    (local.set $lastX (i32.sub (global.get $mapWidth) (i32.const 1)))
    (local.set $lastY (i32.sub (global.get $mapHeight) (i32.const 1)))

    (local.set $i (global.get $Map))
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
          (global.get $mapWidth))
        )
      )

      (br_if $loopY (i32.ne
        (local.tee $y (i32.add (local.get $y) (i32.const 1)))
        (global.get $mapHeight))
      )
    )
  )

  (func $getTileXY (param $x i32) (param $y i32) (result i32)
    (i32.add
      (global.get $Map)
      (i32.add
        (i32.mul
          (global.get $mapWidth)
          (local.get $y)
        )
        (local.get $x)
      )
    )
  )

  (func $getTileType (param $id i32) (result i32)
    (i32.add
      (global.get $TileTypes)
      (i32.mul
        (local.get $id)
        [[= sizeof_Tile]]
      )
    )
  )

  (func $isWalkable (param $x i32) (param $y i32) (result i32)
    [[load (call $getTileType (i32.load8_u (call $getTileXY (local.get $x) (local.get $y)))) Tile.walkable]]
  )

  (func $isInBounds (param $x i32) (param $y i32) (result i32)
    (i32.and
      (i32.and
        (i32.ge_s (local.get $x) (i32.const 0))
        (i32.lt_s (local.get $x) (global.get $mapWidth))
      )
      (i32.and
        (i32.ge_s (local.get $y) (i32.const 0))
        (i32.lt_s (local.get $y) (global.get $mapHeight))
      )
    )
  )

  (func $moveEntity (export "moveEntity") (param $eid i32) (param $mx i32) (param $my i32)
    (local $pos i32)
    (local $x i32)
    (local $y i32)

    (local.set $pos (call $getPosition (local.get $eid)))

    (if (i32.and
      (call $isWalkable
        (local.tee $x (i32.add [[load $pos Position.x]] (local.get $mx)))
        (local.tee $y (i32.add [[load $pos Position.y]] (local.get $my)))
      )
      (call $isInBounds (local.get $x) (local.get $y))
    )
      (then
        [[store $pos Position.x $x]]
        [[store $pos Position.y $y]]
      )
    )
  )

  (func $input (export "input") (param $ch i32) (result i32)
    (call $convertToAction (local.get $ch))
    (call $applyAction)

    [[load $Action NoneAction.id]]
  )

  (table $actions anyfunc (elem
    $applyNoAction
    $applyMoveAction
    $generateMap
  ))
  [[consts act 0 None Move Generate]]

  (func $applyNoAction)

  (func $applyMoveAction
    (call $moveEntity
      ;; TODO allow actions on arbitrary entities!
      (global.get $playerID)
      [[load $Action MoveAction.dx]]
      [[load $Action MoveAction.dy]]
    )
  )

  (func $applyAction
    (call_indirect $actions [[load $Action NoneAction.id]])
  )

  (func $convertToAction (param $ch i32)
    ;; default to no action
    [[store $Action NoneAction.id $actNone]]

    ;; TODO convert to use tables?
    (if (i32.eq (local.get $ch) (global.get $kUp)) (then
      [[store $Action MoveAction.id $actMove]]
      [[store $Action MoveAction.dx 0]]
      [[store $Action MoveAction.dy -1]]
      (return)
    ))
    (if (i32.eq (local.get $ch) (global.get $kRight)) (then
      [[store $Action MoveAction.id $actMove]]
      [[store $Action MoveAction.dx 1]]
      [[store $Action MoveAction.dy 0]]
      (return)
    ))
    (if (i32.eq (local.get $ch) (global.get $kDown)) (then
      [[store $Action MoveAction.id $actMove]]
      [[store $Action MoveAction.dx 0]]
      [[store $Action MoveAction.dy 1]]
      (return)
    ))
    (if (i32.eq (local.get $ch) (global.get $kLeft)) (then
      [[store $Action MoveAction.id $actMove]]
      [[store $Action MoveAction.dx -1]]
      [[store $Action MoveAction.dy 0]]
      (return)
    ))

    (if (i32.eq (local.get $ch) (global.get $kGenerate)) (then
      [[store $Action GenerateAction.id $actGenerate]]
      (return)
    ))
  )

  (func $getEntity (param $id i32) (result i32)
    (i32.add
      (global.get $Entities)
      (i32.mul (local.get $id) [[= sizeof_Entity]])
    )
  )

  (func $makePlayer (param $x i32) (param $y i32)
    (call $attachAppearance (global.get $playerID)
      (global.get $chAt) (global.get $cWhite))
    (call $attachPosition (global.get $playerID)
      (local.get $x) (local.get $y))
  )
)
