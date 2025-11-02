## 'return' statement

**New token**: `ReturnKeyword` (`return`).

**Context-free syntax**: `ReturnStatement ::= "return" Expr? ";"? ;`

**Execution**:

* `return;`
    * Starting with the current continuation, loop forever:
        * If the current continuation is the "halt" continuation:
            * Throw an error about `return;` being executed outside of a
              routine.
        * Otherwise, if the current continuation has a call level lower than
          the continuation we started from:
            * Invoke that continuation with a `NoneValue`.
        * Otherwise, make the current continuation be the current
          continuation's tail, and go to the next iteration.
* `return e;`
    * Evaluate expression `e` to value `v`.
    * Starting with the current continuation, loop forever:
        * If the current continuation is the "halt" continuation:
            * Throw an error about `return;` being executed outside of a
              routine.
        * Otherwise, if the current continuation has a call level lower than
          the continuation we started from:
            * Invoke that continuation with `v`.
        * Otherwise, make the current continuation be the current
          continuation's tail, and go to the next iteration.

