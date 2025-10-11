## 'for' statement

**New tokens**: `ForKeyword` (`for`), `InKeyword` (`in`).

**Context-free syntax**: `ForStatement ::= "for" Identifier "in" Expr Block ;`

**Execution**:

* `for <name> in e { b }`
    * Extend the current environment into a new environment `forEnv`.
    * Bind `<name>` in `forEnv` to a new `UninitValue`.
    * Evaluate `e` (under `forEnv`) to `v`.
    * Assert that `v` is of type `ArrayValue`.
    * For each element `elem` (left to right) of the elements of `v`:
        * Extend `forEnv` into a new environment `bodyEnv`.
        * Bind `<name>` in `bodyEnv` to `elem`.
        * Run block `b` (under `bodyEnv`).
    * Return a new `NoneValue`.
