## parameters

**Context-free syntax**:

* `ParameterList ::= (Parameter (("," Parameter)* ",")?)? ;`
* `Parameter ::= Identifier ;`

**Evaluation**:

* `e0[a1, ..., aN]`:
    * Evaluate `e0` to `v0`.
    * Assert that `v0` has type `FuncValue`.
    * Assert that `v0.parameters` has length `N`.
    * Evaluate all the arguments `a1, ..., aN`, left-to-right, to values
      `v1, ..., vN`.
    * Extend `v0.outerEnv` to a new environment `bodyEnv`.
    * For all parameters in `v0.parameters` and all argument values `v1, ...,
      vN` (in parallel), create a readonly binding from the parameter name to
      the value.
    * Execute the block `v0.body` in `bodyEnv`, resulting in value `v`.
    * Return `v`.

