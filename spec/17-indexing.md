## array indexing

**Context-free syntax**: `IndexingExpr ::= Expr "[" Expr "]" ;`

**Precedence and associativity**: Array indexing, a postfix op, is tighter than
all the prefix ops.

**Evaluation**:

* `e1[e2]`:
    * Evaluate `e1` to `v1`.
    * Assert that `v1` has type `ArrayValue`.
    * Evaluate `e2` to `v2`.
    * Assert that `v2` has type `IntValue`.
    * Assert that `0 <= v2.payload` and `v2.payload < v1.elements.length`.
    * Return `v1.elements[v2.payload]`.

