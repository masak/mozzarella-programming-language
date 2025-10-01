## boolean operations

**New tokens**: `Quest` (`?`), `Bang` (`!`), `AmpAmp` (`&&`), `PipePipe`
(`||`).

**Context-free syntax**:

* `DisjunctionExpr ::= Expr "||" Expr ;`
* `ConjunctionExpr ::= Expr "&&" Expr ;`
* `PrefixExpr ::= "?" Expr ;`
* `PrefixExpr ::= "!" Expr ;`

**Precedence and associativity**: The prefix ops are tighter than the infix
ops. All the infix ops introduced here associate to the left. Infix
disjunction is looser than infix conjunction, which is looser than all the
infix ops introduced so far.

**Evaluation**:

When "boolifying" a value, the following procedure is used:

* An `IntValue` boolifies to `false` if 0, and to `true` otherwise.
* A `StrValue` boolifies to `false` if the empty string, and to `true`
  otherwise.
* A `BoolValue` boolifies to its payload.
* A `NoneValue` boolifies to `false`.
* For any other value type, unless they specify their own stringification, a
  value boolifies to `true`.

* `e1 && e2`:
    * Evaluate `e1` to `v1`.
    * Boolify `v1` to `b1`.
    * If `b1` is `true`:
        * Evaluate `e2` to `v2`.
        * Return `v2`.
    * Otherwise:
        * Return `v1`.
* `e1 || e2`:
    * Evaluate `e1` to `v1`.
    * Boolify `v1` to `b1`.
    * If `b1` is `true`:
        * Return `v1`.
    * Otherwise:
        * Evaluate `e2` to `v2`.
        * Return `v2`.
* `?e`:
    * Evaluate `e` to `v`.
    * Boolify `v` to `b`.
    * Return a `BoolValue` with payload `b`.
* `!e`:
    * Evaluate `e` to `v`.
    * Boolify `v` to `b`.
    * Return a `BoolValue` with payload `!b`.

