(module
  (func $abs (export "abs") (param $n i32) (result i32)
    (if (i32.lt_s (local.get $n) (i32.const 0))
      (then
        (i32.sub (i32.const 0) (local.get $n))
        (return)
      )
    )
    (local.get $n)
  )

  (func $max (export "max") (param $a i32) (param $b i32) (result i32)
    (block (if (i32.lt_s (local.get $a) (local.get $b))
      (then
        (local.get $b)
        (return)
      )
    ))
    (local.get $a)
  )

  (func $min (export "min") (param $a i32) (param $b i32) (result i32)
    (block (if (i32.lt_s (local.get $a) (local.get $b))
      (then
        (local.get $a)
        (return)
      )
    ))
    (local.get $b)
  )
)
