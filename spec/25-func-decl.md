## function declarations

**New token**: `FuncKeyword` (`func`).

**Context-free syntax**:

* `FuncDecl ::= "func" Identifier "(" ParameterList ")" Block ;`
* `ParameterList ::= ;`

For now, the `ParamList` nonterminal is empty, but later blades will redefine
it.

**Static validity**: The statement list of the program or any block may not
contain duplicate declarations, that is, two or more declarations of the same
name.

**New value type**: `FuncValue`, containing the following properties:

* `name`, a string
* `outerEnv`, an environment
* `parameters`, an array of parameters
* `body`, a block

When stringifying a `FuncValue`, the following procedure is used:

* Return the string `"<func "`, concatenated with the `name`, concatenated with
  `"("`, concatenated with all the `parameters`, comma-separated, concatenated
  with `")>"`.

When boolifying a `FuncValue`, the boolean value `true` is always returned.

The type `FuncValue` is not considered comparable.

When checking whether a `FuncValue v1` equals a `FuncValue v2`, the following
procedure is used:

* If `v1` and `v2` are the exact same object (by reference ID), return `true`.
* Otherwise return `false`.

**Execution**:

Function declarations are executed at _block entry_.

Besides mutable bindings (such as those created by variable declarations),
there are also readonly bindings. Function declarations (and by default, all
other block-scoped declarations) create readonly bindings. It is a runtime
error to try to assign to a readonly binding.

* `func <name>(<params>) { <block> }`
    * In the current environment, create a readonly binding from `<name>` to a
      new `FuncValue` whose `name` is `<name>`, whose `outerEnv` is the current
      environment, whose `parameters` is the array of parameters `<params>`,
      and whose `body` is `<block>`.

