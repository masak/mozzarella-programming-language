## variable declarations

**New tokens**: `MyKeyword` (`my`), `Assign` (`=`), `Identifier` (with a string
payload for the name).

**Lexical syntax**: `Identifier`: one or more ASCII letters.

**Context-free syntax**: `VarDecl ::= "my" Identifier ("=" Expr)? ;`

Variable declarations are the first type of declaration we introduce. We also
extend statement list so that it may contain both statements and declarations.

* `StatementList ::= (Statement | Decl)* ;`

However, `do` expressions are still only allowed to contain a statement, not a
declaration.

**Static validity**: The statement list of the program or any block may not
contain duplicate declarations, that is, two or more declarations of the same
name.

**Execution**:

Declarations typically do not have much of a runtime semantics, but variable
declarations do.

An environment is a mapping from (string) names to values. Evaluation proceeds
with a _current environment_. At program start, we begin with an empty
environment (that does not have an outer environment). When execution enters
a block, a new empty environment is created whose outer environment is the
current environment, and this new environment is then made the current
environment. When execution leaves a block, the current environment's outer
environment is made the current environment.

* `my <name> = initExpr;`
    * Evaluate `initExpr` to `v`.
    * In the current environment, bind `<name>` to `v`.

