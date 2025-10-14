## 'while' statement

**New token**: `WhileKeyword` (`while`).

**Context-free syntax**:

`WhileStatement ::= "while" Expr Block ;`

**Execution**:

* `while e { b }`
    * Forever:
        * Evaluate `e` to `v`.
        * Boolify `vK` to `bK`.
        * If `bK` is true, run the block and go to the next iteration.
        * Otherwise, finish the loop.
    * Return a new `NoneValue`.

