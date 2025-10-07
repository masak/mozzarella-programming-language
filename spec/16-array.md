## arrays

**New tokens**: `SquareL` (`[`), `SquareR` (`]`), `Comma` (`,`).

**Context-free syntax**:

`ArrayInitializerExpr ::= "[" (Expr ("," Expr)* ","?)? "]" ;`

**New value type**: `ArrayValue` (containing `elements`, an array of Value).

When stringifying an `ArrayValue`, the following procedure is used:

* For each element `vK` in order:
    * Generate the print form of `vK` to `pK`.
* Return the string `"["`, concatenated with all the print forms in order,
  separated by `", "`, concatenated with `"]"`.

When boolifying an `ArrayValue`, the following procedure is used:

* Return `false` if the array's `elements` has length 0, and `true` otherwise.

The type `ArrayValue` is considered comparable. When checking whether an
`ArrayValue v1` is less than an `ArrayValue v2`, the following procedure is
used:

* For each element `v1_K` of `v1`, in order:
    * If there is no corresponding element `v2_K`, it means array `v1` is
      longer (but all the previous elements compared equal). Return `false`.
    * If `v1_K` is less than `v2_K`, return `true`.
    * If `v1_K` equals `v2_K`, continue directly to the next iteration.
    * Otherwise (`v1_K` is greater than `v2_K`), return `false`.
* Return whether `v1.elements` has a length less than `v2.elements`.

When checking whether a value `v1` equals a value `v2`, the following
procedure is used:

* If `v1.elements` and `v2.elements` are of unequal lengths, return `false`.
* For each element `v1_K` of `v1`, in order:
    * If `v1_K` equals the corresponding element `v2_K`, continue directly to
      the next iteration.
    * Otherwise return `false`.
* Return `true`.

**Evaluation**:

* `[e1, e2, ..., eN]`
    * For each element expression `eK` in order:
        * Evaluate `eK` to `vK`.
    * Return a new `ArrayValue` whose `elements` is an array of the values
      `v1`, `v2`, ... `vN`.

