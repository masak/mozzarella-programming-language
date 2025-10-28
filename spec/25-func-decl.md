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

**Execution**:

Function declarations are executed at _block entry_.

* `func <name>(<params>) { <block> }`
    * In the current environment, bind `<name>` to a new `FuncValue` whose
      name is `<name>`.

