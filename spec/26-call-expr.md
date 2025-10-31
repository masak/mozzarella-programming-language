## call expressions

**Context-free syntax**:

* `CallExpr ::= Expr "(" ArgumentList ")" ;`
* `ArgumentList ::= (Argument (("," Argument)* ","?)?)? ;`
* `Argument ::= Expr ;`

**Precedence and associativity**: Call expressions, a postfix op, is tighter
than all the prefix ops.

**Evaluation**:

For `last;` and `next;`, the search for an outer loop continuation _stops_ at
a function boundary. However, there is not a particular "function continuation"
that we can just stop at. Instead, we track a "call level" which increases by
one every time we go into a function. In the search for a dynamically outer
loop, we immediately stop the search if the continuation's call level is lower
than the current call level.

* `e0[a1, ..., aN]`:
    * Evaluate `e0` to `v0`.
    * Assert that `v0` has type `FuncValue`.
    * Assert that `v0.parameters` has length `N`.
    * Evaluate all the arguments `a1, ..., aN`, left-to-right, to values
      `v1, ..., vN`.
    * Execute the block `v0.body` in `v0.outerEnv`, resulting in value `v`.
    * Return `v`.

