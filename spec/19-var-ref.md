## variable reference

**Context-free syntax**: `VarRefExpr ::= Identifier ;`

**Static validity**: A variable reference may not occur before its
corresponding declaration in a block. Note that this holds true even if the
variable reference occurs not directly in the block, but one or more blocks
deeper.

**Evaluation**:

* `<name>`
    * Look up `<name>` in the current environment `env`:
        * Forever:
            * If `env` contains a binding from `<name>` to `v`:
                * If `v` is an `UninitValue`, issue a runtime error about
                  accessing an uninitialized variable.
                * Otherwise, return `v`.
            * Otherwise, if `env` has an outer environment, set `env` to this
              outer environment and continue to the next iteration.
            * Otherwise, issue a runtime error about an undeclared variable.
    * Evaluate `initExpr` to `v`.
    * In `env`, bind `<name>` to `v`.

