(module
  (import "stdlib" "abs" (func $abs (param i32) (result i32)))
  (import "stdlib" "max" (func $max (param i32) (param i32) (result i32)))

  ;; TODO make my own rng!
  (import "host" "rng" (func $rng (param i32) (param i32) (result i32)))

  (global $chAt i32 [[= '@']])

  (global $cWhite i32 (i32.const 0xffffff00))
  (global $cYellow i32 (i32.const 0xffff0000))

  (global $kLeft i32 (i32.const 37))
  (global $kUp i32 (i32.const 38))
  (global $kRight i32 (i32.const 39))
  (global $kDown i32 (i32.const 40))
  (global $kWait i32 (i32.const 101))
  (global $kGenerate i32 [[= 'G']])

  (global $playerID (export "gPlayerID") (mut i32) (i32.const 0))
  (global $visionRange i32 (i32.const 8))

  [[struct Tile walkable:u8 transparent:u8 ch:u8 fg:i32 bg:i32 fglight:i32 bglight:i32]]
  [[reserve TileTypes sizeof_Tile*2 gTileTypes]]
  [[align 8]]
  (data $tileTypeData (offset [[= TileTypes]])
    [[data Tile walkable=1 transparent=1 ch='.' fg=0xffffff00 bg=0x32329600 fglight=0xffffff00 bglight=0xc8b43200]]
    [[data Tile ch='#' fg=0xffffff00 bg=0x00006400 fglight=0xffffff00 bglight=0x826e3200]]
  )
  [[consts tt 0 Floor Wall]]
  (global $ttINVALID (export "gTileTypeCount") i32 [[= _Next]])
  (global $tileTypeSize (export "gTileTypeSize") i32 [[= sizeof_Tile]])

  [[struct Entity mask:i64]]
  (global $maxEntities (export "gMaxEntities") i32 (i32.const 256))
  (global $entitySize (export "gEntitySize") i32 [[= sizeof_Entity]])
  (global $nextEntity (mut i32) (i32.const 1))
  (global $currentEntity (mut i32) (i32.const -1))

  [[component Appearance ch:u8 colour:i32 name:i32]]
  [[component AI fn:u8]]
  [[component Fighter maxhp:i32 hp:i32 defence:i32 power:i32]]
  [[component Position x:u8 y:u8]]
  [[component Solid]]

  [[struct Room x1:u8 y1:u8 x2:u8 y2:u8]]
  (global $maxRoomSize i32 (i32.const 10))
  (global $minRoomSize i32 (i32.const 6))
  (global $maxRooms i32 (i32.const 32))
  (global $maxMonstersPerRoom i32 (i32.const 2))

  [[struct Action id:u8 dx:s8 dy:s8 eid:u8]]

  [[reserve currentAction sizeof_Action]]
  [[align 8]]
  [[reserve Entities maxEntities*sizeof_Entity gEntities]]
  [[reserve Appearances maxEntities*sizeof_Appearance gAppearances]]
  [[reserve AIs maxEntities*sizeof_AI gAIs]]
  [[reserve Fighters maxEntities*sizeof_Fighter gFighters]]
  [[reserve Positions maxEntities*sizeof_Position gPositions]]
  [[reserve Rooms maxRooms*sizeof_Room gRooms]]

  (global $mapWidth (export "gMapWidth") i32 (i32.const 100))
  (global $mapHeight (export "gMapHeight") i32 (i32.const 100))
  (global $mapSize (export "gMapSize") i32 [[= mapWidth * mapHeight]])
  [[reserve Map mapSize gMap]]
  [[reserve VisibleMap mapSize]]
  [[reserve ExploredMap mapSize]]
  [[reserve PathMap mapSize]]

  (global $displayWidth (export "gDisplayWidth") (mut i32) (i32.const 0))
  (global $displayHeight (export "gDisplayHeight") (mut i32) (i32.const 0))
  (global $displayMinX (export "gDisplayMinX") (mut i32) (i32.const 0))
  (global $displayMinY (export "gDisplayMinY") (mut i32) (i32.const 0))
  (global $displayMaxX (export "gDisplayMaxX") (mut i32) (i32.const 0))
  (global $displayMaxY (export "gDisplayMaxY") (mut i32) (i32.const 0))
  (global $displayEdge i32 (i32.const 8))
  [[reserve Display 100*100 gDisplay]]
  [[reserve DisplayFG 100*100*4 gDisplayFG]]
  [[reserve DisplayBG 100*100*4 gDisplayBG]]

  ;; TODO make sizeof_Strings dynamic
  [[reserve Strings 1000 gStrings]]
  (global $stringsSize (export "gStringsSize") i32 [[= sizeof_Strings]])

  [[memory memory]]

  ;; TODO would prefer to put these in stdlib, but then they don't reference the same memory...
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
  (func $memset64 (param $addr i32) (param $n i64) (param $size i32)
    (loop $set
      (i64.store (local.get $addr) (local.get $n))
      (local.set $addr (i32.add (local.get $addr) (i32.const 8)))
      (br_if $set (i32.gt_u
        (local.tee $size (i32.sub (local.get $size) (i32.const 8)))
        (i32.const 0))
      )
    )
  )

  (func $initialise (export "initialise") (param $w i32) (param $h i32)
    ;; TODO check $w * $h < sizeof_Display
    (global.set $displayWidth (local.get $w))
    (global.set $displayHeight (local.get $h))

    (call $generateMap)
    (call $render)
  )

  (func $fillMap (param $tid i32)
    (call $memset (global.get $Map) (local.get $tid) (global.get $mapSize))
  )

  (func $clearVisibleMap
    (call $memset (global.get $VisibleMap) (i32.const 0) (global.get $mapSize))
  )

  (func $clearExploredMap
    (call $memset (global.get $ExploredMap) (i32.const 0) (global.get $mapSize))
  )

  (func $clearEntities
    (call $memset64 (global.get $Entities) (i64.const 0) [[= sizeof_Entities]])
    (global.set $nextEntity (i32.const 1))
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
        (i32.store8 (call $getMapXY (local.get $x) (local.get $y)) (global.get $ttFloor))

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

  (func $carveLine (param $x0 i32) (param $y0 i32) (param $x1 i32) (param $y1 i32)
    (local $dx i32)
    (local $dy i32)
    (local $sx i32)
    (local $sy i32)
    (local $err i32)
    (local $e2 i32)

    (local.set $dx (call $abs (i32.sub (local.get $x1) (local.get $x0))))
    (if (i32.lt_u (local.get $x0) (local.get $x1))
      (local.set $sx (i32.const 1))
      (local.set $sx (i32.const -1))
    )
    (local.set $dy (i32.sub (i32.const 0) (call $abs (i32.sub (local.get $y1) (local.get $y0)))))
    (if (i32.lt_u (local.get $y0) (local.get $y1))
      (local.set $sy (i32.const 1))
      (local.set $sy (i32.const -1))
    )
    (local.set $err (i32.add (local.get $dx) (local.get $dy)))

    (loop $draw
      (i32.store8 (call $getMapXY (local.get $x0) (local.get $y0)) (global.get $ttFloor))

      (if (i32.and
        (i32.eq (local.get $x0) (local.get $x1))
        (i32.eq (local.get $y0) (local.get $y1))
      ) (return))

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
    (call $clearVisibleMap)
    (call $clearExploredMap)

    ;; TODO more sensible way of dealing with entities
    (call $clearEntities)

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

          (call $placeEntities (local.get $n))
          (local.set $n (i32.add (local.get $n) (i32.const 1)))
        ))
      ))

      (br_if $rooms (i32.ne
        (local.tee $i (i32.add (local.get $i) (i32.const 1)))
        (global.get $maxRooms)
      ))
    )

    (call $centreOnPlayer)
    (call $updateFov)
  )

  (func $placeEntities (param $rid i32)
    (local $r i32)
    (local $i i32)
    (local $max i32)
    (local $x i32)
    (local $y i32)

    (local.set $r (call $getRoom (local.get $rid)))
    (local.set $max (call $rng (i32.const 0) (global.get $maxMonstersPerRoom)))
    (if (i32.eqz (local.get $max)) (return))

    (loop $try
      (local.set $x (call $rng
        (i32.add [[load $r Room.x1]] (i32.const 1))
        (i32.sub [[load $r Room.x2]] (i32.const 1))
      ))
      (local.set $y (call $rng
        (i32.add [[load $r Room.y1]] (i32.const 1))
        (i32.sub [[load $r Room.y2]] (i32.const 1))
      ))

      (if (i32.lt_s (call $getEntityAt (local.get $x) (local.get $y)) (i32.const 0))
        (call $spawnEnemyAt (local.get $x) (local.get $y))
      )

      (br_if $try (i32.lt_u
        (local.tee $i (i32.add (local.get $i) (i32.const 1)))
        (local.get $max)
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
          (i32.store8 (local.get $i) (global.get $ttWall))
          (i32.store8 (local.get $i) (global.get $ttFloor))
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

  (func $getDisplayXY (param $x i32) (param $y i32) (result i32)
    (i32.add
      (global.get $Display)
      (i32.add
        (i32.mul
          (global.get $displayWidth)
          (local.get $y)
        )
        (local.get $x)
      )
    )
  )
  (func $getDisplayFGXY (param $x i32) (param $y i32) (result i32)
    (i32.add
      (global.get $DisplayFG)
      (i32.mul
        (i32.add
          (i32.mul
            (global.get $displayWidth)
            (local.get $y)
          )
          (local.get $x)
        )
        (i32.const 4)
      )
    )
  )
  (func $getDisplayBGXY (param $x i32) (param $y i32) (result i32)
    (i32.add
      (global.get $DisplayBG)
      (i32.mul
        (i32.add
          (i32.mul
            (global.get $displayWidth)
            (local.get $y)
          )
          (local.get $x)
        )
        (i32.const 4)
      )
    )
  )

  (func $getMapXY (param $x i32) (param $y i32) (result i32)
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

  (func $getVisibleMapXY (param $x i32) (param $y i32) (result i32)
    (i32.add
      (global.get $VisibleMap)
      (i32.add
        (i32.mul
          (global.get $mapWidth)
          (local.get $y)
        )
        (local.get $x)
      )
    )
  )

  (func $getExploredMapXY (param $x i32) (param $y i32) (result i32)
    (i32.add
      (global.get $ExploredMap)
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
    [[load (call $getTileType (i32.load8_u (call $getMapXY (local.get $x) (local.get $y)))) Tile.walkable]]
  )

  (func $isTransparent (param $x i32) (param $y i32) (result i32)
    [[load (call $getTileType (i32.load8_u (call $getMapXY (local.get $x) (local.get $y)))) Tile.transparent]]
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
      (i32.and
        (call $isWalkable
          (local.tee $x (i32.add [[load $pos Position.x]] (local.get $mx)))
          (local.tee $y (i32.add [[load $pos Position.y]] (local.get $my)))
        )
        (call $isInBounds (local.get $x) (local.get $y))
      )
      (i32.lt_s (call $getBlockerAt (local.get $x) (local.get $y)) (i32.const 0))
    ) (then
        [[store $pos Position.x $x]]
        [[store $pos Position.y $y]]
      )
    )
  )

  (func $input (export "input") (param $ch i32) (result i32)
    (call $convertToAction (local.get $ch))
    (call $applyAction)

    [[load $currentAction Action.id]]
  )

  (table $fnLookup anyfunc (elem
    $applyNoAction
    $applyWaitAction
    $applyMoveAction
    $applyBumpAction
    $applyMeleeAction
    $generateMap

    $applyNoneAI
    $applyHostileAI
  ))
  [[consts act 0 None Wait Move Bump Melee Generate]]
  [[consts ai actGenerate+1 None Hostile]]

  (func $applyNoAction)
  (func $applyWaitAction)

  (func $applyMoveAction
    (call $moveEntity
      [[load $currentAction Action.eid]]
      [[load $currentAction Action.dx]]
      [[load $currentAction Action.dy]]
    )

    (if (call $playerNearEdge) (call $centreOnPlayer))
  )

  (func $applyBumpAction
    (local $pos i32)
    (local.set $pos (call $getPosition [[load $currentAction Action.eid]]))

    (if (i32.lt_s (call $getBlockerAt
      (i32.add [[load $pos Position.x]] [[load $currentAction Action.dx]])
      (i32.add [[load $pos Position.y]] [[load $currentAction Action.dy]])
    ) (i32.const 0))
      (call $applyMoveAction)
      (call $applyMeleeAction)
    )
  )

  (func $applyMeleeAction
    (local $pos i32)
    (local $enemy i32)
    (local.set $pos (call $getPosition [[load $currentAction Action.eid]]))
    (local.set $enemy (call $getBlockerAt
      (i32.add [[load $pos Position.x]] [[load $currentAction Action.dx]])
      (i32.add [[load $pos Position.y]] [[load $currentAction Action.dy]])
    ))

    ;; TODO applyMeleeAction
  )

  (func $applyAction
    (call_indirect $fnLookup [[load $currentAction Action.id]])

    (call $sysRunAI)
    (call $updateFov)
    (call $render)
  )

  (func $convertToAction (param $ch i32)
    ;; default to no action
    [[store $currentAction Action.id $actNone]]
    [[store $currentAction Action.eid $playerID]]

    ;; TODO convert to use tables?
    (if (i32.eq (local.get $ch) (global.get $kUp)) (then
      [[store $currentAction Action.id $actBump]]
      [[store $currentAction Action.dx 0]]
      [[store $currentAction Action.dy -1]]
      (return)
    ))
    (if (i32.eq (local.get $ch) (global.get $kRight)) (then
      [[store $currentAction Action.id $actBump]]
      [[store $currentAction Action.dx 1]]
      [[store $currentAction Action.dy 0]]
      (return)
    ))
    (if (i32.eq (local.get $ch) (global.get $kDown)) (then
      [[store $currentAction Action.id $actBump]]
      [[store $currentAction Action.dx 0]]
      [[store $currentAction Action.dy 1]]
      (return)
    ))
    (if (i32.eq (local.get $ch) (global.get $kLeft)) (then
      [[store $currentAction Action.id $actBump]]
      [[store $currentAction Action.dx -1]]
      [[store $currentAction Action.dy 0]]
      (return)
    ))

    (if (i32.eq (local.get $ch) (global.get $kWait)) (then
      [[store $currentAction Action.id $actWait]]
      (return)
    ))

    (if (i32.eq (local.get $ch) (global.get $kGenerate)) (then
      [[store $currentAction Action.id $actGenerate]]
      (return)
    ))
  )

  (func $getEntity (param $id i32) (result i32)
    (i32.add
      (global.get $Entities)
      (i32.mul (local.get $id) [[= sizeof_Entity]])
    )
  )

  (func $getEntityAt (param $x i32) (param $y i32) (result i32)
    (local $eid i32)
    (local $pos i32)

    (local.set $eid (i32.const 0))
    (local.set $pos (global.get $Positions))
    (loop $entities
      (if (i32.and
        (i32.eq (local.get $x) [[load $pos Position.x]])
        (i32.eq (local.get $y) [[load $pos Position.y]])
      ) (then
        (local.get $eid)
        (return)
      ))

      (local.set $pos (i32.add (local.get $pos) [[= sizeof_Position]]))
      (br_if $entities (i32.le_u
        (local.tee $eid (i32.add (local.get $eid) (i32.const 1)))
        (global.get $nextEntity)
      ))
    )

    (i32.const -1)
  )

  (func $getBlockerAt (param $x i32) (param $y i32) (result i32)
    (local $eid i32)
    (local $pos i32)

    (local.set $eid (i32.const 0))
    (local.set $pos (global.get $Positions))
    (loop $entities
      (if (i32.and
        (i32.and
          (i32.eq (local.get $x) [[load $pos Position.x]])
          (i32.eq (local.get $y) [[load $pos Position.y]])
        )
        (call $isSolid (local.get $eid))
      ) (then
        (local.get $eid)
        (return)
      ))

      (local.set $pos (i32.add (local.get $pos) [[= sizeof_Position]]))
      (br_if $entities (i32.le_u
        (local.tee $eid (i32.add (local.get $eid) (i32.const 1)))
        (global.get $nextEntity)
      ))
    )

    (i32.const -1)
  )

  (func $spawnEntity (result i32)
    global.get $nextEntity
    (global.set $nextEntity (i32.add (global.get $nextEntity) (i32.const 1)))
  )

  (func $spawnEnemyAt (param $x i32) (param $y i32)
    (local $roll i32)
    (local $eid i32)

    (local.set $roll (call $rng (i32.const 0) (i32.const 99)))

    (local.set $eid (call $spawnEntity))
    (call $setSolid (local.get $eid))
    (call $attachPosition (local.get $eid) (local.get $x) (local.get $y))

    (if (i32.le_u (local.get $roll) (i32.const 80)) (then
      (call $constructOrc (local.get $eid))
      (return)
    ))

    (call $constructTroll (local.get $eid))
  )

  (func $constructOrc (param $eid i32)
    (call $attachAppearance (local.get $eid) [[= 'o']] [[= 0x3f7f3f00 ]] [[s "Orc"]])
    (call $attachAI (local.get $eid) (global.get $aiHostile))
    (call $attachFighter (local.get $eid)
      (i32.const 10) (i32.const 10) (i32.const 0) (i32.const 3)
    )
  )
  (func $constructTroll (param $eid i32)
    (call $attachAppearance (local.get $eid) [[= 'T']] [[= 0x007f0000 ]] [[s "Troll"]])
    (call $attachAI (local.get $eid) (global.get $aiHostile))
    (call $attachFighter (local.get $eid)
      (i32.const 16) (i32.const 16) (i32.const 1) (i32.const 4)
    )
  )

  (func $makePlayer (param $x i32) (param $y i32)
    (call $setSolid (global.get $playerID))
    (call $attachAppearance (global.get $playerID)
      (global.get $chAt) (global.get $cWhite) [[s "you"]]
    )
    (call $attachFighter (global.get $playerID)
      (i32.const 32) (i32.const 32) (i32.const 2) (i32.const 5)
    )
    (call $attachPosition (global.get $playerID)
      (local.get $x) (local.get $y))
  )

  (func $drawFg (param $x i32) (param $y i32) (param $ch i32) (param $fg i32)
    (i32.store8
      (call $getDisplayXY (local.get $x) (local.get $y))
      (local.get $ch)
    )
    (i32.store
      (call $getDisplayFGXY (local.get $x) (local.get $y))
      (local.get $fg)
    )
  )
  (func $drawFgBg (param $x i32) (param $y i32) (param $ch i32) (param $fg i32) (param $bg i32)
    (call $drawFg (local.get $x) (local.get $y) (local.get $ch) (local.get $fg))
    (i32.store
      (call $getDisplayBGXY (local.get $x) (local.get $y))
      (local.get $bg)
    )
  )

  [[system RenderEntity Appearance Position]]
    (local $x i32)
    (local $y i32)

    (local.set $x [[load $Position Position.x]])
    (local.set $y [[load $Position Position.y]])

    (if (i32.and
      (call $isOnScreen (local.get $x) (local.get $y))
      (call $isVisible (local.get $x) (local.get $y))
    ) (call $drawFg
        (i32.sub (local.get $x) (global.get $displayMinX))
        (i32.sub (local.get $y) (global.get $displayMinY))
        [[load $Appearance Appearance.ch]]
        [[load $Appearance Appearance.colour]]
      )
    )
  [[/system]]

  [[system RunAI AI]]
    (global.set $currentEntity (local.get $eid))
    (call_indirect $fnLookup [[load $AI AI.fn]])
  [[/system]]

  (func $centreOnPlayer
    (local $pos i32)
    (local.set $pos (call $getPosition (global.get $playerID)))

    (global.set $displayMinX (i32.sub
      [[load $pos Position.x]]
      (i32.div_u (global.get $displayWidth) (i32.const 2))
    ))
    (global.set $displayMinY (i32.sub
      [[load $pos Position.y]]
      (i32.div_u (global.get $displayHeight) (i32.const 2))
    ))
    (global.set $displayMaxX (i32.add
      (global.get $displayMinX)
      (global.get $displayWidth)
    ))
    (global.set $displayMaxY (i32.add
      (global.get $displayMinY)
      (global.get $displayHeight)
    ))
  )

  (func $playerNearEdge (result i32)
    (local $pos i32)
    (local $dx i32)
    (local $dy i32)

    (local.set $pos (call $getPosition (global.get $playerID)))
    (local.set $dx (i32.sub [[load $pos Position.x]] (global.get $displayMinX)))
    (local.set $dy (i32.sub [[load $pos Position.y]] (global.get $displayMinY)))

    (i32.or
      (i32.or
        (i32.lt_s (local.get $dx) (global.get $displayEdge))
        (i32.ge_s (local.get $dx) (i32.sub (global.get $displayWidth) (global.get $displayEdge)))
      )
      (i32.or
        (i32.lt_s (local.get $dy) (global.get $displayEdge))
        (i32.ge_s (local.get $dy) (i32.sub (global.get $displayHeight) (global.get $displayEdge)))
      )
    )
  )

  (func $isOnScreen (param $x i32) (param $y i32) (result i32)
    (i32.and
      (i32.and
        (i32.ge_s (local.get $x) (global.get $displayMinX))
        (i32.lt_s (local.get $x) (global.get $displayMaxX))
      )
      (i32.and
        (i32.ge_s (local.get $y) (global.get $displayMinY))
        (i32.lt_s (local.get $y) (global.get $displayMaxY))
      )
    )
  )

  (func $isOnMap (param $x i32) (param $y i32) (result i32)
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

  (func $isVisible (param $x i32) (param $y i32) (result i32)
    (i32.load8_u
      (i32.add
        (global.get $VisibleMap)
        (i32.add
          (i32.mul (local.get $y) (global.get $mapWidth))
          (local.get $x)
        )
      )
    )
  )
  (func $isExplored (param $x i32) (param $y i32) (result i32)
    (i32.load8_u
      (i32.add
        (global.get $ExploredMap)
        (i32.add
          (i32.mul (local.get $y) (global.get $mapWidth))
          (local.get $x)
        )
      )
    )
  )

  (func $renderDungeon
    (local $x i32)
    (local $y i32)
    (local $dx i32)
    (local $dy i32)
    (local $tt i32)

    (local.set $y (global.get $displayMinY))
    (loop $loopY
      (local.set $dy (i32.sub (local.get $y) (global.get $displayMinY)))

      (local.set $x (global.get $displayMinX))
      (loop $loopX
        (local.set $dx (i32.sub (local.get $x) (global.get $displayMinX)))

        (if (call $isOnMap (local.get $x) (local.get $y)) (then
          (local.set $tt (call $getTileType (i32.load8_u (call $getMapXY (local.get $x) (local.get $y)))))

          (if (call $isVisible (local.get $x) (local.get $y))
            (then (call $drawFgBg
              (local.get $dx) (local.get $dy)
              [[load $tt Tile.ch]] [[load $tt Tile.fglight]] [[load $tt Tile.bglight]]
            ))
            (else
              (if (call $isExplored (local.get $x) (local.get $y))
                (call $drawFgBg
                  (local.get $dx) (local.get $dy)
                  [[load $tt Tile.ch]] [[load $tt Tile.fg]] [[load $tt Tile.bg]]
                )
                (call $drawFgBg
                  (local.get $dx) (local.get $dy)
                  (i32.const 0) (i32.const 0) (i32.const 0)
                )
              )
            )
          )
        ) (else
          (call $drawFgBg
            (local.get $dx) (local.get $dy)
            (i32.const 0) (i32.const 0) (i32.const 0)
          )
        ))

        (br_if $loopX (i32.lt_s
          (local.tee $x (i32.add (local.get $x) (i32.const 1)))
          (global.get $displayMaxX)
        ))
      )
      (br_if $loopY (i32.lt_s
        (local.tee $y (i32.add (local.get $y) (i32.const 1)))
        (global.get $displayMaxY)
      ))
    )
  )

  ;; http://www.roguebasin.com/index.php/LOS_using_strict_definition
  (func $applyLos (param $x0 i32) (param $y0 i32) (param $x1 i32) (param $y1 i32)
    (local $sx i32)
    (local $sy i32)
    (local $xnext i32)
    (local $ynext i32)
    (local $dx i32)
    (local $dy i32)
    (local $dist f32)

    (local.set $dx (i32.sub (local.get $x1) (local.get $x0)))
    (local.set $dy (i32.sub (local.get $y1) (local.get $y0)))

    (if (i32.lt_s (local.get $x0) (local.get $x1))
      (local.set $sx (i32.const 1))
      (local.set $sx (i32.const -1))
    )
    (if (i32.lt_s (local.get $y0) (local.get $y1))
      (local.set $sy (i32.const 1))
      (local.set $sy (i32.const -1))
    )

    (local.set $xnext (local.get $x0))
    (local.set $ynext (local.get $y0))
    (local.set $dist (f32.sqrt (f32.convert_i32_s (i32.add
      (i32.mul (local.get $dx) (local.get $dx))
      (i32.mul (local.get $dy) (local.get $dy))
    ))))

    (loop $ray
      (if (i32.eqz (call $isInBounds (local.get $xnext) (local.get $ynext)))
        (return)
      )

      (i32.store8 (call $getExploredMapXY (local.get $xnext) (local.get $ynext)) (i32.const 1))

      (if (i32.eqz (call $isTransparent (local.get $xnext) (local.get $ynext)))
        (return)
      )

      ;; if(abs(dy * (xnext - x0 + sx) - dx * (ynext - y0)) / dist < 0.5f)
      (if (f32.lt
        (f32.div (f32.convert_i32_u (call $abs
          (i32.sub
            (i32.mul (local.get $dy)
              (i32.add (local.get $sx)
                (i32.sub (local.get $xnext) (local.get $x0))
              )
            )
            (i32.mul (local.get $dx)
              (i32.sub (local.get $ynext) (local.get $y0))
            )
          )
        )) (local.get $dist))
        (f32.const 0.5)
      ) (then
        (local.set $xnext (i32.add (local.get $xnext) (local.get $sx)))
      ) (else
        ;; else if(abs(dy * (xnext - x0) - dx * (ynext - y0 + sy)) / dist < 0.5f)
        (if (f32.lt
          (f32.div (f32.convert_i32_u (call $abs
            (i32.sub
              (i32.mul (local.get $dy)
                (i32.sub (local.get $xnext) (local.get $x0))
              )
              (i32.mul (local.get $dx)
                (i32.add (local.get $sy)
                  (i32.sub (local.get $ynext) (local.get $y0))
                )
              )
            )
          )) (local.get $dist))
          (f32.const 0.5)
        ) (then
          (local.set $ynext (i32.add (local.get $ynext) (local.get $sy)))
        ) (else
          (local.set $xnext (i32.add (local.get $xnext) (local.get $sx)))
          (local.set $ynext (i32.add (local.get $ynext) (local.get $sy)))
        ))
      ))

      (i32.store8 (call $getExploredMapXY (local.get $xnext) (local.get $ynext)) (i32.const 1))
      (i32.store8 (call $getVisibleMapXY (local.get $xnext) (local.get $ynext)) (i32.const 1))

      (br_if $ray (i32.or
        (i32.ne (local.get $xnext) (local.get $x1))
        (i32.ne (local.get $ynext) (local.get $y1))
      ))
    )
  )

  (func $updateFov
    (local $pos i32)
    (local $x i32)
    (local $y i32)
    (local $i i32)
    (local $j i32)
    (local $radius2 i32)

    (local.set $pos (call $getPosition (global.get $playerID)))
    (local.set $x [[load $pos Position.x]])
    (local.set $y [[load $pos Position.y]])

    (call $clearVisibleMap)
    (i32.store8 (call $getVisibleMapXY (local.get $x) (local.get $y)) (i32.const 1))

    (local.set $i (i32.sub (i32.const 0) (global.get $visionRange)))
    (local.set $radius2 (i32.mul (global.get $visionRange) (global.get $visionRange)))
    (loop $loopI
      (local.set $j (i32.sub (i32.const 0) (global.get $visionRange)))
      (loop $loopJ
        (if (i32.lt_s
          (i32.add
            (i32.mul (local.get $i) (local.get $i))
            (i32.mul (local.get $j) (local.get $j))
          )
          (local.get $radius2)
        )
          (call $applyLos
            (local.get $x)
            (local.get $y)
            (i32.add (local.get $x) (local.get $i))
            (i32.add (local.get $y) (local.get $j))
          )
        )

        (br_if $loopJ (i32.le_s
          (local.tee $j (i32.add (local.get $j) (i32.const 1)))
          (global.get $visionRange)
        ))
      )

      (br_if $loopI (i32.le_s
        (local.tee $i (i32.add (local.get $i) (i32.const 1)))
        (global.get $visionRange)
      ))
    )
  )

  (func $render
    (call $renderDungeon)
    (call $sysRenderEntity)
  )

  (func $applyNoneAI
    [[store $currentAction Action.eid $currentEntity]]
    [[store $currentAction Action.id $actWait]]
    (call $applyWaitAction)
  )

  (func $applyHostileAI
    (local $target i32)
    (local $distance i32)
    (local $pos i32)
    (local $tpos i32)
    (local $dx i32)
    (local $dy i32)

    (local.set $target (global.get $playerID))
    (local.set $tpos (call $getPosition (local.get $target)))
    (local.set $pos (call $getPosition (global.get $currentEntity)))

    (local.set $dx (i32.sub [[load $tpos Position.x]] [[load $pos Position.x]]))
    (local.set $dy (i32.sub [[load $tpos Position.y]] [[load $pos Position.y]]))
    (local.set $distance (call $max (call $abs (local.get $dx)) (call $abs (local.get $dy))))

    [[store $currentAction Action.eid $currentEntity]]

    (if (call $isVisible [[load $pos Position.x]] [[load $pos Position.y]]) (then
      (if (i32.le_s (local.get $distance) (i32.const 1)) (then
        [[store $currentAction Action.id $actMelee]]
        [[store $currentAction Action.dx $dx]]
        [[store $currentAction Action.dy $dy]]
        (call $applyMeleeAction)
        (return)
      ))

      ;; TODO calculate path, if exists move
    ))

    [[store $currentAction Action.id $actWait]]
    (call $applyWaitAction)
  )

  (data $stringData (offset [[= Strings]])
    [[strings]]
  )
)
