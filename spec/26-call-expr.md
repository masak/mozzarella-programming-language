## call expressions

**Context-free syntax**:

* `CallExpr ::= Expr "(" ArgumentList ")" ;`
* `ArgumentList ::= (Argument (("," Argument)* ","?)?)? ;`
* `Argument ::= Expr ;`

**Precedence and associativity**: Call expressions, a postfix op, is tighter
than all the prefix ops.

**Evaluation**:

* `e0[a1, ..., aN]`:
    * Evaluate `e0` to `v0`.
    * Assert that `v0` has type `FuncValue`.
    * Assert that `v0.parameters` has length `N`.
    * Evaluate all the arguments `a1, ..., aN`, left-to-right, to values
      `v1, ..., vN`.
    * Execute the block `v0.body` in `v0.outerEnv`, resulting in value `v`.
    * Return `v`.

