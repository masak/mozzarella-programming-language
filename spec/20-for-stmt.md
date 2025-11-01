## 'for' statement

**New tokens**: `ForKeyword` (`for`), `InKeyword` (`in`).

**Context-free syntax**: `ForStatement ::= "for" Identifier "in" Expr Block ;`

**Execution**:

Besides mutable bindings (such as those created by variable declarations),
there are also readonly bindings. The variable created to hold each element of
the array in the `for` loop is bound using a readonly binding. It is a runtime
error to try to assign to it either in the array expression or in the loop
body.

* `for <name> in e { b }`
    * Extend the current environment into a new environment `forEnv`.
    * Create a readonly binding in `forEnv` from `<name>` to a new
      `UninitValue`.
    * Evaluate `e` (under `forEnv`) to `v`.
    * Assert that `v` is of type `ArrayValue`.
    * For each element `elem` (left to right) of the elements of `v`:
        * Extend `forEnv` into a new environment `bodyEnv`.
        * Create a readonly binding in `bodyEnv` from `<name>` to `elem`.
        * Run block `b` (under `bodyEnv`).
    * Return a new `NoneValue`.
