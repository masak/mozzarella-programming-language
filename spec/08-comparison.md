## comparison operations

**New tokens**: `Less` (`<`), `LessEq` (`<=`), `Greater` (`>`), `GreaterEq`
(`>=`), `EqEq` (`==`), `BangEq` (`!=`).

**Context-free syntax**:

* `ComparisonExpr ::= Expr "<" Expr ;`
* `ComparisonExpr ::= Expr "<=" Expr ;`
* `ComparisonExpr ::= Expr ">" Expr ;`
* `ComparisonExpr ::= Expr ">=" Expr ;`
* `ComparisonExpr ::= Expr "==" Expr ;`
* `ComparisonExpr ::= Expr "!=" Expr ;`

**Precedence and associativity**: All six infix ops have _chaining_
associativity; operands are still evaluated left-to-right, but at most once,
and only as needed to make the next comparison. As soon as a comparison fails,
a `false` result is returned and any remaining operands are not evaluated.

**Evaluation**:

When checking whether a value `v1` "is less than" a value `v2`, the following
procedure is used:

* Assert that `v1` and `v2` are both of a comparable type, or raise and error.
    * The types `Int` and `Str` are comparable; no other types are.
* Assert that `v1` and `v2` are of the same type, or raise an error.
* If `v1` is of type `IntValue`:
    * Return whether `v1.payload < v2.payload`.
* If `v1` is of type `StrValue`:
    * Return whether `v1.payload < v2.payload`; that is, lexicographically
      smaller.
* Otherwise, raise an error about an unknown comparable type.

When checking whether a value `v1` "equals" a value `v2`, the following
procedure is used:

* Assert that `v1` and `v2` are of the same type, or return `false`.
* If `v1` is of type `IntValue`:
    * Return whether `v1.payload === v2.payload`.
* If `v1` is of type `StrValue`:
    * Return whether `v1.payload === v2.payload`.
* If `v1` is of type `BoolValue`:
    * Return whether `v1.payload === v2.payload`.
* If `v1` is of type `NoneValue`:
    * Return `true`.
* Otherwise, return `v1 === v2`, that is, reference equality.

* Chaining ops `e1 op e2 op ... op eN`
    * Evaluate `e1` to `v1`.
    * For each subsequent pair of operator and expression:
        * Evaluate `eK` to `vK`.
        * Compare the previous value and this value according to the rule
          for the corresponding operator, described below.
            * If the result is `false`, do no further comparisons and
              immediately return a `BoolValue` with payload `false`.
            * If the result is `true`, continue to the next iteration.
    * Return a `BoolValue` with payload `true`.
* `v1 < v2`:
    * Return whether `v1` is less than `v2`.
* `v1 <= v2`:
    * Return whether `v1` is less than `v2` or `v1` equals `v2`.
* `v1 > v2`:
    * Return whether `v2` is less than `v1`.
* `v1 >= v2`:
    * Return whether `v2` is less than `v1` or `v1` equals `v2`.
* `v1 == v2`:
    * Return whether `v1` equals `v2`.
* `v1 != v2`:
    * Check whether `v1` equals `v2`.
        * If `true`, return `false`.
        * If `false`, return `true`.

