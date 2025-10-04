## expression statement

**New token**: `Semi` (`;`).

**Context-free syntax**: `ExprStatement ::= Expr ";"? ;`

We change the definition of a _program_ from being a single expression to being
a single expression statement.

**Execution**:

Whereas we speak of _evaluating_ expressions, we _execute_ statements.

* `e;`
    * Evaluate `e` to `v`.
    * Return `v`.

