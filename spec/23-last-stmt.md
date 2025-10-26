## 'last' statement

**New token**: `LastKeyword` (`last`).

**Context-free syntax**: `LastStatement ::= "last" ;`

**Execution**:

Just as evaluation happens with a current environment, the evaluation of an
expression, the execution of a statement or sequence of statements, or the
running of a block happens with a _current continuation_, which is a stack of
suspended tasks to do next. Specifically, there is an entry in this stack for
a `while` loop body whenever we are executing inside a `while` loop; similarly
for a `for` loop body. The last/bottom continuation in this stack is always the
distinguished "halt" continuation.

* `last;`
    * Starting with the current continuation, loop forever:
        * If the current continuation is that of a `while` or `for` loop body:
            * Invoke that continuation's tail continuation (which aborts the
              rest of this algorithm and goes somewhere else).
        * Otherwise, if the current continuation is the "halt" continuation:
            * Throw an error about `last;` being executed outside of a loop.
        * Otherwise, make the current continuation be the current
          continuation's tail, and go to the next iteration.

