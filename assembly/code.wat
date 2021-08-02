(module
  (import "display" "centreOn" (func $centreOn (param $x i32) (param $y i32)))
  (import "display" "clear" (func $clearScreen))
  (import "display" "resize" (func $resize (param $x i32) (param $y i32)))
  (import "display" "drawFg" (func $drawFg (param $x i32) (param $y i32) (param $ch i32) (param $fg i32)))
  (import "display" "drawFgBg" (func $drawFgBg (param $x i32) (param $y i32) (param $ch i32) (param $fg i32) (param $bg i32)))
  (import "display" "getLayer" (func $getDisplayLayer (param $x i32) (param $y i32) (result i32)))
  (import "display" "setLayer" (func $setDisplayLayer (param $x i32) (param $y i32) (param i32)))
  (import "display" "contains" (func $isOnScreen (param $x i32) (param $y i32) (result i32)))
  (import "display" "width" (global $displayWidth (mut i32)))
  (import "display" "height" (global $displayHeight (mut i32)))
  (import "display" "minX" (global $displayMinX (mut i32)))
  (import "display" "minY" (global $displayMinY (mut i32)))
  (import "display" "maxX" (global $displayMaxX (mut i32)))
  (import "display" "maxY" (global $displayMaxY (mut i32)))

  (import "stdlib" "abs" (func $abs (param i32) (result i32)))
  (import "stdlib" "max" (func $max (param i32) (param i32) (result i32)))
  (import "stdlib" "min" (func $min (param i32) (param i32) (result i32)))

  (import "host" "debug" (func $debug (param i32)))
  ;; TODO make my own rng!
  (import "host" "rng" (func $rng (param i32) (param i32) (result i32)))

  (global $chAt i32 [[= '@']])

  (global $cBlack i32 (i32.const 0x00000000))
  (global $cWhite i32 (i32.const 0xffffff00))

  (global $cBarEmpty i32 (i32.const 0x40101000))
  (global $cBarFilled i32 (i32.const 0x00600000))
  (global $cBarText i32 (i32.const 0xffffff00))
  (global $cCorpse i32 (i32.const 0xbf000000))
  (global $cEnemyAtk i32 (i32.const 0xffc0c000))
  (global $cEnemyDie i32 (i32.const 0xffa03000))
  (global $cError i32 (i32.const 0xff4040))
  (global $cFloorDark i32 (i32.const 0x32329600))
  (global $cFloorLight i32 (i32.const 0xc8b43200))
  (global $cHealingPotion i32 (i32.const 0x7f00ff00))
  (global $cHealthRecovered i32 (i32.const 0x00ff0000))
  (global $cImpossible i32 (i32.const 0x80808000))
  (global $cInvalid i32 (i32.const 0xffff0000))
  (global $cOrc i32 (i32.const 0x3f7f3f00))
  (global $cPlayerAtk i32 (i32.const 0xe0e0e000))
  (global $cPlayerDie i32 (i32.const 0xff303000))
  (global $cTroll i32 (i32.const 0x007f0000))
  (global $cWallBright i32 (i32.const 0x826e3200))
  (global $cWallDark i32 (i32.const 0x00006400))
  (global $cWelcomeText i32 (i32.const 0x20a0ff00))

  (global $kLeft i32 (i32.const 37))
  (global $kUp i32 (i32.const 38))
  (global $kRight i32 (i32.const 39))
  (global $kDown i32 (i32.const 40))
  (global $kWait i32 (i32.const 12))

  (global $kNumLeft i32 (i32.const 100))
  (global $kNumUp i32 (i32.const 104))
  (global $kNumRight i32 (i32.const 102))
  (global $kNumDown i32 (i32.const 98))
  (global $kNumWait i32 (i32.const 101))

  (global $kViLeft i32 (i32.const 72))
  (global $kViUp i32 (i32.const 75))
  (global $kViRight i32 (i32.const 76))
  (global $kViDown i32 (i32.const 74))
  (global $kViWait i32 (i32.const 190))

  (global $kEscape i32 (i32.const 27))
  (global $kPageUp i32 (i32.const 33))
  (global $kPageDown i32 (i32.const 34))
  (global $kEnd i32 (i32.const 35))
  (global $kHome i32 (i32.const 36))
  (global $kSpace i32 [[= ' ']])
  (global $kGet i32 [[= 'G']])
  (global $kHistory i32 [[= 'V']])
  (global $kGenerate i32 (i32.const 116)) ;; F5

  (global $inputChar (mut i32) (i32.const 0))
  (global $gameMode (export "gGameMode") (mut i32) (i32.const 0))
  (global $renderMode (mut i32) (i32.const 0))
  (global $previousGameMode (mut i32) (i32.const 0))
  (global $previousRenderMode (mut i32) (i32.const 0))

  ;; TODO remove me
  (global $playerID (export "gPlayerID") (mut i32) (i32.const 0))
  (global $visionRange i32 (i32.const 8))
  (global $inventorySize i32 (i32.const 10))

  (global $mouseX (mut i32) (i32.const 0))
  (global $mouseY (mut i32) (i32.const 0))

  [[struct Tile walkable:u8 transparent:u8 ch:u8 fg:i32 bg:i32 fglight:i32 bglight:i32]]
  [[reserve TileTypes sizeof_Tile*2 gTileTypes]]
  [[align 8]]
  (data $tileTypeData (offset [[= TileTypes]])
    [[data Tile walkable=1 transparent=1 ch='.' fg=cWhite bg=cFloorDark fglight=cWhite bglight=cFloorLight]]
    [[data Tile ch='#' fg=cWhite bg=cWallDark fglight=cWhite bglight=cWallBright]]
  )
  [[consts tt 0 Floor Wall]]
  (global $ttINVALID (export "gTileTypeCount") i32 [[= _Next]])
  (global $tileTypeSize (export "gTileTypeSize") i32 [[= sizeof_Tile]])

  [[struct Entity mask:i64]]
  (global $maxEntities (export "gMaxEntities") i32 (i32.const 256))
  (global $entitySize (export "gEntitySize") i32 [[= sizeof_Entity]])
  (global $nextEntity (mut i32) (i32.const 1))
  (global $currentEntity (mut i32) (i32.const -1))

  [[consts layer 0 Empty Corpse Item Actor]]

  [[component Appearance ch:u8 layer:u8 colour:i32 name:i32]]
  [[component AI fn:u8]]
  [[component Carried carrier:u8]]
  [[component Consumable fn:u8 power:u8]]
  [[component Fighter maxhp:i32 hp:i32 defence:i32 power:i32]]
  [[component Inventory size:u8]]
  [[component Position x:u8 y:u8]]

  [[component Item]]
  [[component Player]]
  [[component Solid]]

  [[struct Room x1:u8 y1:u8 x2:u8 y2:u8]]
  (global $maxRoomSize i32 (i32.const 10))
  (global $minRoomSize i32 (i32.const 6))
  (global $maxRooms i32 (i32.const 32))
  (global $maxMonstersPerRoom i32 (i32.const 2))
  (global $maxItemsPerRoom i32 (i32.const 1))

  [[struct Action id:u8 dx:s8 dy:s8 eid:u8 item:u8]]
  [[struct Result id:u8 message:i32]]
  [[consts dir 0 Up Right Down Left]]
  [[consts res 0 OK Impossible]]

  [[reserve currentAction sizeof_Action]]
  [[reserve currentResult sizeof_Result]]
  [[align 8]]

  [[reserve Entities maxEntities*sizeof_Entity gEntities]]
  [[reserve Appearances maxEntities*sizeof_Appearance gAppearances]]
  [[reserve AIs maxEntities*sizeof_AI gAIs]]
  [[reserve Carrieds maxEntities*sizeof_Carried gCarrieds]]
  [[reserve Consumables maxEntities*sizeof_Consumable gConsumables]]
  [[reserve Fighters maxEntities*sizeof_Fighter gFighters]]
  [[reserve Inventorys maxEntities*sizeof_Inventory gInventories]]
  [[reserve Positions maxEntities*sizeof_Position gPositions]]
  [[reserve Rooms maxRooms*sizeof_Room gRooms]]

  (global $mapWidth (export "gMapWidth") i32 (i32.const 100))
  (global $mapHeight (export "gMapHeight") i32 (i32.const 100))
  (global $mapSize (export "gMapSize") i32 [[= mapWidth * mapHeight]])
  [[reserve Map mapSize gMap]]
  [[reserve VisibleMap mapSize]]
  [[reserve ExploredMap mapSize]]
  [[reserve PathMap mapSize]]

  (global $displayEdge i32 (i32.const 8))

  ;; TODO am I going to regret this
  (global $maxStringSize i32 (i32.const 100))
  ;; TODO make sizeof_Strings dynamic
  [[reserve Strings 1000 gStrings]]
  (global $stringsSize (export "gStringsSize") i32 [[= sizeof_Strings]])
  [[reserve tempString maxStringSize]]
  [[reserve itoaString 20]]
  (global $itoaStringEnd i32 [[= itoaString + sizeof_itoaString - 1]])

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
  (func $memcpy (param $dst i32) (param $src i32) (param $size i32)
    (loop $cat
      (i32.store8 (local.get $dst) (i32.load8_u (local.get $src)))

      (local.set $dst (i32.add (local.get $dst) (i32.const 1)))
      (local.set $src (i32.add (local.get $src) (i32.const 1)))

      (br_if $cat (i32.gt_u (local.tee $size (i32.sub (local.get $size) (i32.const 1))) (i32.const 0)))
    )
  )
  (func $strcpy (param $dst i32) (param $src i32) (result i32)
    (local $ch i32)
    (loop $cat
      (i32.store8 (local.get $dst) (local.tee $ch (i32.load8_u (local.get $src))))

      (local.set $dst (i32.add (local.get $dst) (i32.const 1)))
      (local.set $src (i32.add (local.get $src) (i32.const 1)))

      (br_if $cat (i32.ne (local.get $ch) (i32.const 0)))
    )

    ;; return address of closing NUL byte
    (i32.sub (local.get $dst) (i32.const 1))
  )
  (func $streq (param $a i32) (param $b i32) (result i32)
    (local $ach i32)
    (local $bch i32)

    (loop $eq
      (if (i32.ne
        (local.tee $ach (i32.load8_u (local.get $a)))
        (local.tee $bch (i32.load8_u (local.get $b)))
      ) (return (i32.const 0)))

      (local.set $a (i32.add (local.get $a) (i32.const 1)))
      (local.set $b (i32.add (local.get $b) (i32.const 1)))

      (br_if $eq (i32.ne (local.get $ach) (i32.const 0)))
    )

    (i32.const 1)
  )
  (func $itoa (param $n i32) (result i32)
    (local $s i32)
    (local $mod i32)
    (local $digit i32)
    (local $neg i32)

    (if (i32.eqz (local.get $n)) (return [[s "0"]]))

    (i32.store8 (local.tee $s (global.get $itoaStringEnd)) (i32.const 0))
    (i32.store8 (i32.sub (local.get $s) (i32.const 1)) [[= '0']])

    ;; deal with negative numbers
    (if (i32.lt_s (local.get $n) (i32.const 0)) (then
      (local.set $neg (i32.const 1))
      (local.set $n (i32.sub (i32.const 0) (local.get $n)))
    ))

    (local.set $mod (i32.const 1))
    (loop $digits
      (local.set $digit (i32.rem_u (i32.div_u (local.get $n) (local.get $mod)) (i32.const 10)))

      ;; *s-- = digit + '0'
      (i32.store8 (local.tee $s (i32.sub (local.get $s) (i32.const 1))) (i32.add (local.get $digit) [[= '0']]))

      (local.set $mod (i32.mul (local.get $mod) (i32.const 10)))

      ;; bail out if we've run out of digits somehow?
      (br_if $digits (i32.and
        (i32.ge_u (local.get $n) (local.get $mod))
        (i32.gt_u (local.get $mod) (i32.const 0))
      ))
    )

    ;; prefix a - if it was negative
    (if (local.get $neg)
      (i32.store8 (local.tee $s (i32.sub (local.get $s) (i32.const 1))) [[= '-']])
    )

    (local.get $s)
  )

  (func $setMode (param $gm i32) (param $rm i32)
    (global.set $gameMode (local.get $gm))
    (global.set $renderMode (local.get $rm))
  )
  (func $saveMode
    (global.set $previousGameMode (global.get $gameMode))
    (global.set $previousRenderMode (global.get $renderMode))
  )
  (func $restoreMode
    (global.set $gameMode (global.get $previousGameMode))
    (global.set $renderMode (global.get $previousRenderMode))
  )

  (func $initialise (export "initialise") (param $w i32) (param $h i32)
    (call $resize (local.get $w) (local.get $h))
    (call $generateMap)
    (call $addToLog [[s "Welcome to WASMrogue!"]] (global.get $cWelcomeText))
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
        (return (i32.const 1))
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

        (call $constructPlayer
          (global.get $playerID)
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
    (call $setMode (global.get $gmDungeon) (global.get $rmDungeon))
  )

  (func $placeEntities (param $rid i32)
    (local $r i32)
    (local $max i32)

    (local.set $r (call $getRoom (local.get $rid)))
    (call $placeMonsters
      (local.get $r)
      (call $rng (i32.const 0) (global.get $maxMonstersPerRoom))
    )
    (call $placeItems
      (local.get $r)
      (call $rng (i32.const 0) (global.get $maxItemsPerRoom))
    )
  )

  (func $placeMonsters (param $r i32) (param $max i32)
    (local $i i32)
    (local $x i32)
    (local $y i32)

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

  (func $placeItems (param $r i32) (param $max i32)
    (local $i i32)
    (local $x i32)
    (local $y i32)

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
        (call $spawnItemAt (local.get $x) (local.get $y))
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

  (func $getPathMapXY (param $x i32) (param $y i32) (result i32)
    (i32.add
      (global.get $PathMap)
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

  (func $impossible (param $message i32)
    [[store $currentResult Result.id $resImpossible]]
    [[store $currentResult Result.message $message]]
  )

  (func $moveEntity (export "moveEntity") (param $eid i32) (param $mx i32) (param $my i32)
    (local $pos i32)
    (local $x i32)
    (local $y i32)

    (local.set $pos (call $getPosition (local.get $eid)))

    (if (i32.eqz (call $isInBounds
      (local.tee $x (i32.add [[load $pos Position.x]] (local.get $mx)))
      (local.tee $y (i32.add [[load $pos Position.y]] (local.get $my)))
    )) (then
      (call $impossible [[s "That way is blocked."]])
      (return)
    ))

    (if (i32.eqz (call $isWalkable (local.get $x) (local.get $y))) (then
      (call $impossible [[s "That way is blocked."]])
      (return)
    ))

    (if (i32.ge_s (call $getBlockerAt (local.get $x) (local.get $y)) (i32.const 0)) (then
      (call $impossible [[s "That way is blocked."]])
      (return)
    ))

    [[store $pos Position.x $x]]
    [[store $pos Position.y $y]]
  )

  (func $input (export "input") (param $ch i32) (result i32)
    ;; default to no action
    [[store $currentAction Action.id $actNone]]
    [[store $currentAction Action.eid $playerID]]

    (global.set $inputChar (local.get $ch))
    (call_indirect $fnLookup (global.get $gameMode))

    [[load $currentAction Action.id]]
    (call $applyAction)
  )

  (func $mouseInput (export "hover") (param $x i32) (param $y i32)
    (global.set $mouseX (i32.add (local.get $x) (global.get $displayMinX)))
    (global.set $mouseY (i32.add (local.get $y) (global.get $displayMinY)))

    (call $render)
  )

  (table $fnLookup anyfunc (elem
    $applyNoAction
    $applyWaitAction
    $applyMoveAction
    $applyBumpAction
    $applyMeleeAction
    $applyPickupAction
    $applyItemAction
    $applyDungeonAction
    $generateMap
    $applyHistoryAction

    $applyNoneAI
    $applyHostileAI

    $applyDungeonInput
    $applyDeadInput
    $applyHistoryInput

    $applyDungeonRender
    $applyHistoryRender

    $applyHealingItem
  ))
  [[consts act 0 None Wait Move Bump Melee Pickup Item Dungeon Generate History]]
  [[consts ai _Next None Hostile]]
  [[consts gm _Next Dungeon Dead History]]
  [[consts rm _Next Dungeon History]]
  [[consts it _Next Healing]]

  (func $applyNoAction)
  (func $applyWaitAction)

  (func $applyMoveAction
    (call $moveEntity
      [[load $currentAction Action.eid]]
      [[load $currentAction Action.dx]]
      [[load $currentAction Action.dy]]
    )

    (if (call $isPlayer [[load $currentAction Action.eid]]) (then
      (if (call $playerNearEdge) (call $centreOnPlayer))
    ))
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
    (local $me i32)
    (local $pos i32)
    (local $enemy i32)
    (local $attacker i32)
    (local $victim i32)
    (local $damage i32)
    (local $s i32)
    (local $fg i32)

    (local.set $me [[load $currentAction Action.eid]])
    (local.set $pos (call $getPosition (local.get $me)))
    (local.set $enemy (call $getBlockerAt
      (i32.add [[load $pos Position.x]] [[load $currentAction Action.dx]])
      (i32.add [[load $pos Position.y]] [[load $currentAction Action.dy]])
    ))

    (if (i32.lt_s (local.get $enemy) (i32.const 0)) (then
      (call $impossible [[s "Nothing to attack."]])
      (return)
    ))

    (if (i32.eqz (call $hasFighter (local.get $me))) (then
      ;; TODO not a combatant
      (return)
    ))

    (if (i32.eqz (call $hasFighter (local.get $enemy))) (then
      ;; TODO not a combatant
      (return)
    ))

    (if (call $isPlayer (local.get $me))
      (local.set $fg (global.get $cPlayerAtk))
      (local.set $fg (global.get $cEnemyAtk))
    )

    (local.set $attacker (call $getFighter (local.get $me)))
    (local.set $victim (call $getFighter (local.get $enemy)))
    (local.set $damage (i32.sub [[load $attacker Fighter.power]] [[load $victim Fighter.defence]]))

    (local.set $s (call $strcpy (global.get $tempString) (call $getName (local.get $me))))
    (local.set $s (call $strcpy (local.get $s) [[s " attacks "]]))
    (local.set $s (call $strcpy (local.get $s) (call $getName (local.get $enemy))))

    (if (i32.gt_s (local.get $damage) (i32.const 0)) (then
      (local.set $s (call $strcpy (local.get $s) [[s " for "]]))
      (local.set $s (call $strcpy (local.get $s) (call $itoa (local.get $damage))))
      (local.set $s (call $strcpy (local.get $s) [[s " hit points."]]))
      (call $takeDamage (local.get $enemy) (local.get $damage))
      (call $addToLog (global.get $tempString) (local.get $fg))

      (call $checkKill (local.get $enemy))
    ) (else
      (local.set $s (call $strcpy (local.get $s) [[s " but does no damage."]]))
      (call $addToLog (global.get $tempString) (local.get $fg))
    ))
  )

  (global $historyCursor (mut i32) (i32.const 0))
  (func $applyHistoryAction
    (call $saveMode)
    (call $setMode (global.get $gmHistory) (global.get $rmHistory))
    (global.set $historyCursor (i32.const 0))
  )

  (func $applyDungeonAction
    (call $restoreMode)
  )

  (func $applyAction
    (local $res i32)

    ;; assume OK
    [[store $currentResult Result.id $resOK]]
    (call_indirect $fnLookup [[load $currentAction Action.id]])

    (if (local.tee $res [[load $currentResult Result.id]]) (then
      (if (i32.eq (local.get $res) (global.get $resImpossible))
        (call $addToLog [[load $currentResult Result.message]] (global.get $cImpossible))
      )

      (call $render)
      (return)
    ))

    (call $sysRunAI)
    (call $updateFov)
    (call $render)
  )

  (func $applyDungeonInput
    (local $ch i32)
    (local.set $ch (global.get $inputChar))

    (if (i32.or (i32.or
      (i32.eq (local.get $ch) (global.get $kUp))
      (i32.eq (local.get $ch) (global.get $kNumUp)))
      (i32.eq (local.get $ch) (global.get $kViUp)))
    (then
      [[store $currentAction Action.id $actBump]]
      [[store $currentAction Action.dx 0]]
      [[store $currentAction Action.dy -1]]
      (return)
    ))

    (if (i32.or (i32.or
      (i32.eq (local.get $ch) (global.get $kRight))
      (i32.eq (local.get $ch) (global.get $kNumRight)))
      (i32.eq (local.get $ch) (global.get $kViRight)))
    (then
      [[store $currentAction Action.id $actBump]]
      [[store $currentAction Action.dx 1]]
      [[store $currentAction Action.dy 0]]
      (return)
    ))

    (if (i32.or (i32.or
      (i32.eq (local.get $ch) (global.get $kDown))
      (i32.eq (local.get $ch) (global.get $kNumDown)))
      (i32.eq (local.get $ch) (global.get $kViDown)))
    (then
      [[store $currentAction Action.id $actBump]]
      [[store $currentAction Action.dx 0]]
      [[store $currentAction Action.dy 1]]
      (return)
    ))

    (if (i32.or (i32.or
      (i32.eq (local.get $ch) (global.get $kLeft))
      (i32.eq (local.get $ch) (global.get $kNumLeft)))
      (i32.eq (local.get $ch) (global.get $kViLeft)))
    (then
      [[store $currentAction Action.id $actBump]]
      [[store $currentAction Action.dx -1]]
      [[store $currentAction Action.dy 0]]
      (return)
    ))

    (if (i32.or (i32.or
      (i32.eq (local.get $ch) (global.get $kWait))
      (i32.eq (local.get $ch) (global.get $kNumWait)))
      (i32.eq (local.get $ch) (global.get $kViWait)))
    (then
      [[store $currentAction Action.id $actWait]]
      (return)
    ))

    (if (i32.eq (local.get $ch) (global.get $kGet)) (then
      [[store $currentAction Action.id $actPickup]]
      (return)
    ))

    (if (i32.eq (local.get $ch) (global.get $kGenerate)) (then
      [[store $currentAction Action.id $actGenerate]]
      (return)
    ))

    (if (i32.eq (local.get $ch) (global.get $kHistory)) (then
      [[store $currentAction Action.id $actHistory]]
      (return)
    ))
  )

  (func $applyDeadInput
    (local $ch i32)
    (local.set $ch (global.get $inputChar))

    (if (i32.or
      (i32.eq (local.get $ch) (global.get $kEscape))
      (i32.eq (local.get $ch) (global.get $kGenerate))
    ) (then
      [[store $currentAction Action.id $actGenerate]]
      (return)
    ))

    (if (i32.eq (local.get $ch) (global.get $kHistory)) (then
      [[store $currentAction Action.id $actHistory]]
      (return)
    ))
  )

  (func $moveHistoryCursor (param $mod i32)
    (global.set $historyCursor
      (call $min (call $max
        (i32.add (global.get $historyCursor) (local.get $mod))
        (global.get $minLogCount)
      ) (i32.const 0))
    )

    ;; claim I did an action
    [[store $currentAction Action.id $actWait]]
  )

  (func $applyHistoryInput
    (local $ch i32)
    (local.set $ch (global.get $inputChar))

    (if (i32.or (i32.or
      (i32.eq (local.get $ch) (global.get $kUp))
      (i32.eq (local.get $ch) (global.get $kNumUp)))
      (i32.eq (local.get $ch) (global.get $kViUp)))
    (then
      (call $moveHistoryCursor (i32.const -1))
      (return)
    ))

    (if (i32.or (i32.or
      (i32.eq (local.get $ch) (global.get $kDown))
      (i32.eq (local.get $ch) (global.get $kNumDown)))
      (i32.eq (local.get $ch) (global.get $kViDown)))
    (then
      (call $moveHistoryCursor (i32.const 1))
      (return)
    ))

    (if (i32.eq (local.get $ch) (global.get $kPageUp)) (then
      (call $moveHistoryCursor (i32.const -10))
      (return)
    ))

    (if (i32.eq (local.get $ch) (global.get $kPageDown)) (then
      (call $moveHistoryCursor (i32.const 10))
      (return)
    ))

    (if (i32.eq (local.get $ch) (global.get $kHome)) (then
      (call $moveHistoryCursor (i32.const -9999))
      (return)
    ))

    (if (i32.eq (local.get $ch) (global.get $kEnd)) (then
      (call $moveHistoryCursor (i32.const 9999))
      (return)
    ))

    (if (i32.eq (local.get $ch) (global.get $kEscape)) (then
      [[store $currentAction Action.id $actDungeon]]
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
      ) (return (local.get $eid))
      )

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
      ) (return (local.get $eid))
      )

      (local.set $pos (i32.add (local.get $pos) [[= sizeof_Position]]))
      (br_if $entities (i32.le_u
        (local.tee $eid (i32.add (local.get $eid) (i32.const 1)))
        (global.get $nextEntity)
      ))
    )

    (i32.const -1)
  )

  (func $getItemAt (param $x i32) (param $y i32) (result i32)
    (local $eid i32)
    (local $pos i32)

    (local.set $eid (i32.const 0))
    (loop $entities
      (if (call $hasPosition (local.get $eid)) (then
        (local.set $pos (call $getPosition (local.get $eid)))

        (if (i32.and
          (i32.and
            (i32.eq (local.get $x) [[load $pos Position.x]])
            (i32.eq (local.get $y) [[load $pos Position.y]])
          )
          (call $isItem (local.get $eid))
        ) (return (local.get $eid))
        )
      ))

      (br_if $entities (i32.le_u
        (local.tee $eid (i32.add (local.get $eid) (i32.const 1)))
        (global.get $nextEntity)
      ))
    )

    (i32.const -1)
  )

  (func $getInventoryCount (param $carrier i32) (result i32)
    (local $eid i32)
    (local $carried i32)
    (local $count i32)

    (local.set $eid (i32.const 0))
    (local.set $carried (global.get $Carrieds))
    (loop $entities
      (if (call $hasCarried (local.get $eid)) (then
        (if (i32.eq (local.get $carrier) [[load (call $getCarried (local.get $eid)) Carried.carrier]])
          (local.set $count (i32.add (local.get $count) (i32.const 1)))
        )
      ))

      (local.set $carried (i32.add (local.get $carried) [[= sizeof_Carried]]))
      (br_if $entities (i32.le_u
        (local.tee $eid (i32.add (local.get $eid) (i32.const 1)))
        (global.get $nextEntity)
      ))
    )

    (local.get $count)
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
    [[attach $eid Position x=$x y=$y]]

    (if (i32.le_u (local.get $roll) (i32.const 80)) (then
      (call $constructOrc (local.get $eid))
      (return)
    ))

    (call $constructTroll (local.get $eid))
  )

  (func $constructOrc (param $eid i32)
    [[attach $eid Appearance ch='o' colour=cOrc layer=layerActor name="Orc"]]
    [[attach $eid AI fn=$aiHostile]]
    [[attach $eid Fighter maxhp=10 hp=10 defence=0 power=3]]
  )
  (func $constructTroll (param $eid i32)
    [[attach $eid Appearance ch='T' colour=cTroll layer=layerActor name="Troll"]]
    [[attach $eid AI fn=$aiHostile]]
    [[attach $eid Fighter maxhp=16 hp=16 defence=1 power=4]]
  )

  (func $spawnItemAt (param $x i32) (param $y i32)
    (local $roll i32)
    (local $eid i32)

    (local.set $roll (call $rng (i32.const 0) (i32.const 99)))

    (local.set $eid (call $spawnEntity))
    (call $setItem (local.get $eid))
    [[attach $eid Position x=$x y=$y]]

    (call $constructHealingPotion (local.get $eid))
  )

  (func $constructHealingPotion (param $eid i32)
    [[attach $eid Appearance ch='!' colour=cHealingPotion layer=layerItem name=[[s "Healing Potion"]]]]
    [[attach $eid Consumable fn=$itHealing power=4]]
  )

  (func $constructPlayer (param $eid i32) (param $x i32) (param $y i32)
    (call $setPlayer (local.get $eid))
    (call $setSolid (local.get $eid))
    [[attach $eid Appearance ch='@' colour=cWhite layer=layerActor name="Player"]]
    [[attach $eid Fighter maxhp=32 hp=32 defence=2 power=5]]
    [[attach $eid Inventory size=inventorySize]]
    [[attach $eid Position x=$x y=$y]]
  )

  [[system RenderEntity Appearance Position]]
    (local $x i32)
    (local $y i32)
    (local $dx i32)
    (local $dy i32)

    (local.set $dx (i32.sub (local.tee $x [[load $Position Position.x]]) (global.get $displayMinX)))
    (local.set $dy (i32.sub (local.tee $y [[load $Position Position.y]]) (global.get $displayMinY)))

    (if (i32.and (i32.and
      (call $isOnScreen (local.get $x) (local.get $y))
      (call $isVisible (local.get $x) (local.get $y)))
      (i32.gt_s [[load $Appearance Appearance.layer]] (call $getDisplayLayer (local.get $dx) (local.get $dy)))
    ) (then
      (call $drawFg
        (local.get $dx)
        (local.get $dy)
        [[load $Appearance Appearance.ch]]
        [[load $Appearance Appearance.colour]]
      )
      (call $setDisplayLayer (local.get $dx) (local.get $dy) [[load $Appearance Appearance.layer]])
    ))
  [[/system]]

  [[system RunAI AI]]
    (global.set $currentEntity (local.get $eid))
    (call_indirect $fnLookup [[load $AI AI.fn]])
  [[/system]]

  [[reserve hoverString maxStringSize]]
  (global $hoverStringPtr (mut i32) (i32.const 0))
  [[system HoverList Appearance Position]]
    (if (i32.and
      (i32.eq [[load $Position Position.x]] (global.get $mouseX))
      (i32.eq [[load $Position Position.y]] (global.get $mouseY))
    ) (then
      (if (i32.ne (global.get $hoverStringPtr) (global.get $hoverString))
        (global.set $hoverStringPtr (call $strcpy (global.get $hoverStringPtr) [[s ", "]]))
      )
      (global.set $hoverStringPtr (call $strcpy (global.get $hoverStringPtr) [[load $Appearance Appearance.name]]))
    ))
  [[/system]]

  (func $centreOnPlayer
    (local $pos i32)
    (local.set $pos (call $getPosition (global.get $playerID)))
    (call $centreOn [[load $pos Position.x]] [[load $pos Position.y]])
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
    (call_indirect (global.get $renderMode))
  )

  (func $applyDungeonRender
    (call $clearScreen)
    (call $renderDungeon)
    (call $sysRenderEntity)
    (call $renderUI)
  )

  (func $applyHistoryRender
    (call $clearScreen)
    (call $renderMessageLog
      (i32.const 0)
      (i32.sub (global.get $displayHeight) (i32.const 1))
      (i32.const 0)
      (global.get $historyCursor)
    )
  )

  [[reserve dijkstraQueue mapSize*2]]
  (global $dijkstraPtr (mut i32) (i32.const 0))
  (global $dijkstraEnd (mut i32) (i32.const 0))

  (func $dijkstra (param $sx i32) (param $sy i32) (param $dx i32) (param $dy i32) (param $etarget i32) (result i32)
    (local $x i32)
    (local $y i32)
    (local $cost i32)

    (call $memset (global.get $PathMap) (i32.const -1) (global.get $mapSize))
    (i32.store8 (call $getPathMapXY (local.get $sx) (local.get $sy)) (i32.const 0))
    (global.set $dijkstraPtr (global.get $dijkstraQueue))
    (global.set $dijkstraEnd (global.get $dijkstraQueue))
    (call $dijkstraEnqueue (local.get $sx) (local.get $sy))

    (loop $algo
      (local.set $x (i32.load8_u (global.get $dijkstraPtr)))
      (local.set $y (i32.load8_u (i32.add (global.get $dijkstraPtr) (i32.const 1))))

      (if (i32.and
        (i32.eq (local.get $x) (local.get $dx))
        (i32.eq (local.get $y) (local.get $dy))
      ) (return (i32.const 1)))

      (global.set $dijkstraPtr (i32.add (global.get $dijkstraPtr) (i32.const 2)))
      (local.set $cost (i32.add (i32.load8_u (call $getPathMapXY (local.get $x) (local.get $y))) (i32.const 1)))

      (call $dijkstraNeighbour (local.get $x) (local.get $y) (local.get $cost) (local.get $etarget) (i32.const -1) (i32.const  0))
      (call $dijkstraNeighbour (local.get $x) (local.get $y) (local.get $cost) (local.get $etarget) (i32.const  0) (i32.const -1))
      (call $dijkstraNeighbour (local.get $x) (local.get $y) (local.get $cost) (local.get $etarget) (i32.const  1) (i32.const  0))
      (call $dijkstraNeighbour (local.get $x) (local.get $y) (local.get $cost) (local.get $etarget) (i32.const  0) (i32.const  1))

      (br_if $algo (i32.lt_u (global.get $dijkstraPtr) (global.get $dijkstraEnd)))
    )
    (i32.const 0)
  )

  (func $dijkstraEnqueue (param $x i32) (param $y i32)
    (i32.store8 (global.get $dijkstraEnd) (local.get $x))
    (i32.store8 offset=1 (global.get $dijkstraEnd) (local.get $y))
    (global.set $dijkstraEnd (i32.add (global.get $dijkstraEnd) (i32.const 2)))
  )

  (func $dijkstraNeighbour (param $sx i32) (param $sy i32) (param $cost i32) (param $etarget i32) (param $dx i32) (param $dy i32)
    (local $x i32)
    (local $y i32)
    (local $pos i32)
    (local $blocker i32)

    (local.set $x (i32.add (local.get $sx) (local.get $dx)))
    (local.set $y (i32.add (local.get $sy) (local.get $dy)))

    (if (i32.eqz (call $isInBounds (local.get $x) (local.get $y))) (return))
    (if (i32.eqz (call $isWalkable (local.get $x) (local.get $y))) (return))

    (local.set $blocker (call $getBlockerAt (local.get $x) (local.get $y)))
    (if (i32.and
      (i32.ge_s (local.get $blocker) (i32.const 0))
      (i32.ne (local.get $blocker) (local.get $etarget))
    ) (return))

    (local.set $pos (call $getPathMapXY (local.get $x) (local.get $y)))
    (if (i32.lt_u (local.get $cost) (i32.load8_u (local.get $pos))) (then
      (i32.store8 (local.get $pos) (local.get $cost))
      (call $dijkstraEnqueue (local.get $x) (local.get $y))
    ))
  )

  (func $dijkstraBest (param $x i32) (param $y i32) (result i32)
    (local $u i32)
    (local $r i32)
    (local $d i32)
    (local $l i32)

    (local.set $u (i32.load8_u (call $getPathMapXY
      (local.get $x)
      (i32.add (local.get $y) (i32.const -1))
    )))
    (local.set $r (i32.load8_u (call $getPathMapXY
      (i32.add (local.get $x) (i32.const 1))
      (local.get $y)
    )))
    (local.set $d (i32.load8_u (call $getPathMapXY
      (local.get $x)
      (i32.add (local.get $y) (i32.const 1))
    )))
    (local.set $l (i32.load8_u (call $getPathMapXY
      (i32.add (local.get $x) (i32.const -1))
      (local.get $y)
    )))

    (if (i32.lt_u (local.get $u) (local.get $r)) (then
      (if (i32.lt_u (local.get $u) (local.get $d)) (then
        (if (i32.lt_u (local.get $u) (local.get $l))
          (return (global.get $dirUp))
          (return (global.get $dirLeft))
        )
      ) (else
        (if (i32.lt_u (local.get $d) (local.get $l))
          (return (global.get $dirDown))
          (return (global.get $dirLeft))
        )
      ))
    ))
    (if (i32.lt_u (local.get $r) (local.get $d)) (then
      (if (i32.lt_u (local.get $r) (local.get $l))
        (return (global.get $dirRight))
        (return (global.get $dirLeft))
      )
    ))
    (if (i32.lt_u (local.get $d) (local.get $l))
      (return (global.get $dirDown))
    )
    (global.get $dirLeft)
  )

  (func $getDirX (param $dir i32) (result i32)
    (if (i32.eq (local.get $dir) (global.get $dirLeft)) (return (i32.const -1)))
    (if (i32.eq (local.get $dir) (global.get $dirRight)) (return (i32.const 1)))
    (i32.const 0)
  )
  (func $getDirY (param $dir i32) (result i32)
    (if (i32.eq (local.get $dir) (global.get $dirUp)) (return (i32.const -1)))
    (if (i32.eq (local.get $dir) (global.get $dirDown)) (return (i32.const 1)))
    (i32.const 0)
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
    (local $x i32)
    (local $y i32)
    (local $tx i32)
    (local $ty i32)
    (local $dx i32)
    (local $dy i32)
    (local $dir i32)

    (local.set $target (global.get $playerID))
    (local.set $tpos (call $getPosition (local.get $target)))
    (local.set $pos (call $getPosition (global.get $currentEntity)))

    (local.set $dx (i32.sub (local.tee $tx [[load $tpos Position.x]]) (local.tee $x [[load $pos Position.x]])))
    (local.set $dy (i32.sub (local.tee $ty [[load $tpos Position.y]]) (local.tee $y [[load $pos Position.y]])))
    ;; Manhattan distance
    (local.set $distance (i32.add (call $abs (local.get $dx)) (call $abs (local.get $dy))))

    [[store $currentAction Action.eid $currentEntity]]

    (if (call $isVisible [[load $pos Position.x]] [[load $pos Position.y]]) (then
      (if (i32.le_s (local.get $distance) (i32.const 1)) (then
        [[store $currentAction Action.id $actMelee]]
        [[store $currentAction Action.dx $dx]]
        [[store $currentAction Action.dy $dy]]
        (call $applyMeleeAction)
        (return)
      ))

      ;; TODO run dijkstra once per tick, only check if reachable here
      (if (call $dijkstra (local.get $tx) (local.get $ty) (local.get $x) (local.get $y) (global.get $currentEntity)) (then
        (local.set $dir (call $dijkstraBest (local.get $x) (local.get $y)))
        [[store $currentAction Action.id $actMove]]
        [[store $currentAction Action.dx (call $getDirX (local.get $dir))]]
        [[store $currentAction Action.dy (call $getDirY (local.get $dir))]]
        (call $applyMoveAction)
        (return)
      ))
    ))

    [[store $currentAction Action.id $actWait]]
    (call $applyWaitAction)
  )

  (func $getName (param $eid i32) (result i32)
    (if (call $hasAppearance (local.get $eid)) (then
      [[load (call $getAppearance (local.get $eid)) Appearance.name]]
      (return)
    ))
    [[s "something"]]
  )

  [[struct LogMsg fg:i32 count:u8]]
  (global $logMsgSize (export "gMessageSize") i32 [[= sizeof_LogMsg+maxStringSize]])

  (global $logCount (export "gMessageCount") i32 (i32.const 100))
  (global $minLogCount i32 [[= -logCount]])
  (global $showLogCount i32 (i32.const 5))
  [[reserve messageLog logMsgSize*logCount gMessageLog]]
  (global $messageChunkSize i32 [[= logMsgSize*(logCount-1)]])
  (global $secondMessage i32 [[= messageLog+logMsgSize]])
  (global $lastMessage i32 [[= messageLog+sizeof_messageLog-logMsgSize]])

  (func $addToLog (param $s i32) (param $fg i32)
    (local $o i32)

    (call $debug (local.get $s))

    (if (call $streq (local.get $s) (i32.add (local.tee $o (global.get $lastMessage)) [[= sizeof_LogMsg]])) (then
      [[store $o LogMsg.count (i32.add [[load $o LogMsg.count]] (i32.const 1))]]
      (return)
    ))

    (call $memcpy (global.get $messageLog) (global.get $secondMessage) (global.get $messageChunkSize))

    [[store $o LogMsg.fg $fg]]
    [[store $o LogMsg.count 1]]
    (call $strcpy (i32.add (local.get $o) [[= sizeof_LogMsg]]) (local.get $s)) (drop)
  )

  (func $checkKill (param $eid i32)
    (local $fighter i32)
    (local $s i32)
    (local $fg i32)

    (local.set $fighter (call $getFighter (local.get $eid)))
    (if (i32.gt_s [[load $fighter Fighter.hp]] (i32.const 0)) (return))

    (if (call $isPlayer (local.get $eid)) (then
      (local.set $s [[s "You died!"]])
      (local.set $fg (global.get $cPlayerDie))
      (call $setMode (global.get $gmDead) (global.get $rmDungeon))
    ) (else
      (local.set $s (call $strcpy (global.get $tempString) (call $getName (local.get $eid))))
      (call $strcpy (local.get $s) [[s " is dead!"]]) (drop)
      (local.set $s (global.get $tempString))
      (local.set $fg (global.get $cEnemyDie))
    ))
    (call $addToLog (local.get $s) (local.get $fg))

    [[attach $eid Appearance ch='%' colour=cCorpse layer=layerCorpse name="corpse"]]
    (call $unsetSolid (local.get $eid))
    (call $detachAI (local.get $eid))
  )

  (func $putsFg (param $s i32) (param $x i32) (param $y i32) (param $fg i32)
    (local $ch i32)

    (loop $str
      (local.set $ch (i32.load8_u (local.get $s)))
      (if (i32.eqz (local.get $ch)) (return))

      (call $drawFg (local.get $x) (local.get $y) (local.get $ch) (local.get $fg))

      (local.set $s (i32.add (local.get $s) (i32.const 1)))
      (local.set $x (i32.add (local.get $x) (i32.const 1)))
      (br $str)
    )
  )
  (func $putsFgBg (param $s i32) (param $x i32) (param $y i32) (param $fg i32) (param $bg i32)
    (local $ch i32)

    (loop $str
      (local.set $ch (i32.load8_u (local.get $s)))
      (if (i32.eqz (local.get $ch)) (return))

      (call $drawFgBg (local.get $x) (local.get $y) (local.get $ch) (local.get $fg) (local.get $bg))

      (local.set $s (i32.add (local.get $s) (i32.const 1)))
      (local.set $x (i32.add (local.get $x) (i32.const 1)))
      (br $str)
    )
  )

  (func $blankBg (param $sx i32) (param $sy i32) (param $w i32) (param $h i32) (param $bg i32)
    (local $x i32)
    (local $y i32)
    (local $ex i32)
    (local $ey i32)

    (local.set $ex (i32.add (local.get $sx) (local.get $w)))
    (local.set $ey (i32.add (local.get $sy) (local.get $h)))

    (local.set $y (local.get $sy))
    (loop $rows
      (local.set $x (local.get $sx))
      (loop $cols
        (call $drawFgBg (local.get $x) (local.get $y) (global.get $kSpace) (i32.const 0) (local.get $bg))

        (br_if $cols (i32.lt_u (local.tee $x (i32.add (local.get $x) (i32.const 1))) (local.get $ex)))
      )

      (br_if $rows (i32.lt_u (local.tee $y (i32.add (local.get $y) (i32.const 1))) (local.get $ey)))
    )
  )

  (func $renderMessageLog (param $x i32) (param $y i32) (param $minY i32) (param $offset i32)
    (local $msg i32)
    (local $s i32)
    (local $count i32)

    (local.set $msg (i32.add
      (global.get $lastMessage)
      (i32.mul (local.get $offset) (global.get $logMsgSize))
    ))
    (loop $messages
      (if (i32.gt_s (local.tee $count [[load $msg LogMsg.count]]) (i32.const 0)) (then
        (local.set $s (call $strcpy (global.get $tempString) (i32.add (local.get $msg) [[= sizeof_LogMsg]])))

        (if (i32.gt_s (local.get $count) (i32.const 1)) (then
          (local.set $s (call $strcpy (local.get $s) [[s " (x"]]))
          (local.set $s (call $strcpy (local.get $s) (call $itoa (local.get $count))))
          (local.set $s (call $strcpy (local.get $s) [[s ")"]]))
        ))

        ;; TODO word wrap
        (call $putsFgBg (global.get $tempString) (local.get $x) (local.get $y) [[load $msg LogMsg.fg]] (global.get $cBlack))
        (local.set $y (i32.sub (local.get $y) (i32.const 1)))
      ) (return))

      (local.set $msg (i32.sub (local.get $msg) (global.get $logMsgSize)))
      (br_if $messages (i32.ge_u (local.get $y) (local.get $minY)))
    )
  )

  (func $renderUI
    (call $renderStats)
    (call $renderHover)
    (call $renderMessageLog
      (i32.const 21)
      (i32.sub (global.get $displayHeight) (i32.const 1))
      (i32.sub (global.get $displayHeight) (i32.const 5))
      (i32.const 0)
    )
  )

  (func $renderHover
    (i32.store8 (global.get $hoverString) (i32.const 0))
    (global.set $hoverStringPtr (global.get $hoverString))

    (call $sysHoverList)
    (call $putsFgBg (global.get $hoverString) (i32.const 21) (i32.sub (global.get $displayHeight) (i32.const 6)) (global.get $cWhite) (global.get $cBlack))
  )

  (func $renderStats
    (local $s i32)
    (local $pc i32)
    (local $y i32)

    (local.set $pc (call $getFighter (global.get $playerID)))
    (local.set $y (i32.sub (global.get $displayHeight) (i32.const 1)))
    (call $renderBar [[s "HP: "]] [[load $pc Fighter.hp]] [[load $pc Fighter.maxhp]] (i32.const 0) (local.get $y) (i32.const 20))
  )

  (func $renderBar (param $label i32) (param $value i32) (param $max i32) (param $x i32) (param $y i32) (param $size i32)
    (local $width i32)
    (local $s i32)

    (call $blankBg (local.get $x) (local.get $y) (local.get $size) (i32.const 1) (global.get $cBarEmpty))

    ;; bar_width = int(float(current_value) / maximum_value * total_width)
    (if (i32.gt_s (local.tee $width (i32.trunc_f32_s (f32.mul (f32.div
      (f32.convert_i32_s (local.get $value))
      (f32.convert_i32_s (local.get $max))
    ) (f32.convert_i32_s (local.get $size))))) (i32.const 0))
      (call $blankBg (local.get $x) (local.get $y) (local.get $width) (i32.const 1) (global.get $cBarFilled))
    )

    (local.set $s (call $strcpy (global.get $tempString) (local.get $label)))
    (local.set $s (call $strcpy (local.get $s) (call $itoa (local.get $value))))
    (local.set $s (call $strcpy (local.get $s) [[s "/"]]))
    (local.set $s (call $strcpy (local.get $s) (call $itoa (local.get $max))))
    (call $putsFg (global.get $tempString) (i32.const 1) (local.get $y) (global.get $cBarText))
  )

  (func $takeDamage (param $eid i32) (param $amount i32)
    (local $fighter i32)

    (local.set $fighter (call $getFighter (local.get $eid)))
    [[store $fighter Fighter.hp (i32.sub [[load $fighter Fighter.hp]] (local.get $amount))]]
  )

  (func $heal (param $eid i32) (param $amount i32) (result i32)
    (local $fighter i32)
    (local $oldHp i32)
    (local $newHp i32)

    (local.set $fighter (call $getFighter (local.get $eid)))
    (i32.sub
      (local.tee $newHp (call $min
        (i32.add (local.tee $oldHp [[load $fighter Fighter.hp]]) (local.get $amount))
        [[load $fighter Fighter.maxhp]]
      ))
      (local.get $oldHp)
    )

    [[store $fighter Fighter.hp $newHp]]
  )

  (func $applyHealingItem
    (local $consumer i32)
    (local $item i32)
    (local $consumable i32)
    (local $recovered i32)
    (local $s i32)

    (local.set $consumer [[load $currentAction Action.eid]])
    (local.set $item [[load $currentAction Action.item]])
    (local.set $consumable (call $getConsumable (local.get $item)))

    (if (i32.eqz (local.tee $recovered (call $heal (local.get $consumer) [[load $consumable Consumable.power]]))) (then
      (call $impossible [[s "Your health is already full."]])
    ) (else
      (local.set $s (call $strcpy (global.get $tempString) [[s "You consume the "]]))
      (local.set $s (call $strcpy (local.get $s) (call $getName (local.get $item))))
      (local.set $s (call $strcpy (local.get $s) [[s ", and recover "]]))
      (local.set $s (call $strcpy (local.get $s) (call $itoa (local.get $recovered))))
      (local.set $s (call $strcpy (local.get $s) [[s " HP!"]]))
      (call $addToLog (global.get $tempString) (global.get $cHealthRecovered))
    ))
  )

  (func $applyPickupAction
    (local $me i32)
    (local $pos i32)
    (local $inv i32)
    (local $x i32)
    (local $y i32)
    (local $item i32)
    (local $s i32)

    (local.set $me [[load $currentAction Action.eid]])
    (local.set $pos (call $getPosition (local.get $me)))
    (local.set $x [[load $pos Position.x]])
    (local.set $y [[load $pos Position.y]])
    (local.set $inv (call $getInventory (local.get $me)))

    (local.set $item (call $getItemAt (local.get $x) (local.get $y)))
    (if (i32.lt_s (local.get $item) (i32.const 0)) (then
      (call $impossible [[s "There's nothing here."]])
      (return)
    ))

    (if (i32.le_s [[load $inv Inventory.size]] (call $getInventoryCount (local.get $me))) (then
      (call $impossible [[s "Your inventory is full."]])
      (return)
    ))

    (call $detachPosition (local.get $item))
    [[attach $item Carried carrier=$me]]

    (local.set $s (call $strcpy (global.get $tempString) [[s "You picked up the "]]))
    (local.set $s (call $strcpy (local.get $s) (call $getName (local.get $item))))
    (local.set $s (call $strcpy (local.get $s) [[s "!"]]))
    (call $addToLog (global.get $tempString) (global.get $cWhite))
  )

  (func $applyItemAction
    (local $item i32)
    (local $consumable i32)

    (local.set $item [[load $currentAction Action.item]])
    (if (call $hasConsumable (local.get $item)) (then
      (local.set $consumable (call $getConsumable (local.get $item)))

      (call_indirect $fnLookup [[load $consumable Consumable.fn]])
      ;; TODO remove etc.

      (return)
    ))

    (call $impossible [[s "You can't use that."]])
  )

  (data $stringData (offset [[= Strings]]) [[strings]])
  [[memory memory]]
)
