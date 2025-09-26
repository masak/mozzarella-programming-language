## integer operations

**New tokens**: `Plus` (`+`), `Minus` (`-`), `Mult` (`*`), `FloorDiv` (`//`),
and `Mod` (`%`).

**Context-free syntax**:

* `AdditionExpr ::= Expr "+" Expr ;`
* `AdditionExpr ::= Expr "-" Expr ;`
* `MultiplicationExpr ::= Expr "*" Expr ;`
* `MultiplicationExpr ::= Expr "//" Expr ;`
* `MultiplicationExpr ::= Expr "%" Expr ;`
* `PrefixExpr ::= "+" Expr ;`
* `PrefixExpr ::= "-" Expr ;`

**Precedence and associativity**: The prefix ops are tighter than the infix
ops. All the infix ops introduced here associate to the left. Infix
multiplication, floor division, and modulo have the same precedence, tighter
than infix addition and subtraction.

**Evaluation**:

* `e1 + e2`:
    * Evaluate `e1` to `v1`.
    * Assert that `v1` has type `IntValue`.
    * Evaluate `e2` to `v2`.
    * Assert that `v2` has type `IntValue`.
    * Return an `IntValue` with payload `v1.payload + v2.payload`.
* `e1 - e2`:
    * Evaluate `e1` to `v1`.
    * Assert that `v1` has type `IntValue`.
    * Evaluate `e2` to `v2`.
    * Assert that `v2` has type `IntValue`.
    * Return an `IntValue` with payload `v1.payload - v2.payload`.
* `e1 * e2`:
    * Evaluate `e1` to `v1`.
    * Assert that `v1` has type `IntValue`.
    * Evaluate `e2` to `v2`.
    * Assert that `v2` has type `IntValue`.
    * Return an `IntValue` with payload `v1.payload * v2.payload`.
* `e1 // e2`:
    * Evaluate `e1` to `v1`.
    * Assert that `v1` has type `IntValue`.
    * Evaluate `e2` to `v2`.
    * Assert that `v2` has type `IntValue`.
    * Signal an error if `v2.payload` is 0.
    * Return an `IntValue` with payload `floor(v1.payload / v2.payload)`
* `e1 % e2`:
    * Evaluate `e1` to `v1`.
    * Assert that `v1` has type `IntValue`.
    * Evaluate `e2` to `v2`.
    * Assert that `v2` has type `IntValue`.
    * Signal an error if `v2.payload` is 0.
    * Return an `IntValue` with payload `v1.payload % v2.payload`
* `+e`:
    * Evaluate `e` to `v`.
    * Assert that `v` has type `IntValue`.
    * Return an `IntValue` with payload `v.payload`.
* `-e`:
    * Evaluate `e` to `v`.
    * Assert that `v` has type `IntValue`.
    * Return an `IntValue` with payload `-v.payload`.

