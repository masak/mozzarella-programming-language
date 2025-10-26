## 'next' statement

**New token**: `NextKeyword` (`next`).

**Context-free syntax**: `NextStatement ::= "next" ;`

**Execution**:

* `next;`
    * Starting with the current continuation, loop forever:
        * If the current continuation is that of a `while` or `for` loop body:
            * Evaluate whatever expression, statement, or block in whatever
              environment and with whatever continuation as would be done
              when starting the next iteration of the loop.
        * Otherwise, if the current continuation is the "halt" continuation:
            * Throw an error about `next;` being executed outside of a loop.
        * Otherwise, make the current continuation be the current
          continuation's tail, and go to the next iteration.

