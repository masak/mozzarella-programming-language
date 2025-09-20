## integers

**New token**: `IntLit` (holding a `bigint` as payload).

**Lexical syntax**: One or more ASCII digits, separated by at most one
underscore. `/\d(_?\d)*/`

**Context-free syntax**: `IntLitExpr ::= IntLit ;`

**New value type**: `IntValue` (holding a `bigint` as payload).

**Evaluation**: An `IntListExpr` evaluates to an `IntValue` whose payload is
the payload of the `IntLitExpr`'s `IntLit` token.

