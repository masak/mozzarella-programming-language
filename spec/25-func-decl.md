## function declarations

**New token**: `FuncKeyword` (`func`).

**Context-free syntax**:

* `FuncDecl ::= "func" Identifier "(" ParamList ")" Block ;`
* `ParamList ::= ;`

For now, the `ParamList` nonterminal is empty, but later blades will redefine
it.

**Static validity**: The statement list of the program or any block may not
contain duplicate declarations, that is, two or more declarations of the same
name.

**New value type**: `FuncValue` (containing `name`, a string).

When stringifying a `FuncValue`, the following procedure is used:

* Return the string `"<func "`, concatenated with the `name`, concatenated with
  `"()>"`.

When boolifying an `ArrayValue`, the boolean value `true` is always returned.

The type `FuncValue` is not considered comparable.

When checking whether a `FuncValue v1` equals a `FuncValue v2`, the following
procedure is used:

* If `v1` and `v2` are the exact same object (by reference ID), return `true`.
* Otherwise return `false`.

**Execution**:

Function declarations are executed at _block entry_.

* `func <name>(<params>) { <block> }`
    * In the current environment, bind `<name>` to a new `FuncValue` whose
      `name` is `<name>`.

