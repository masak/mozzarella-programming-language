## none

**New token**: `NoneKeyword`.

**Lexical syntax**: `none` is maximal (not followed by an alphanumeric or an
underscore).

**Context-free syntax**: `NoneLitExpr ::= NoneKeyword ;`

**New value type**: `NoneValue`.

**Evaluation**: A `NoneLitExpr` evaluates to a `NoneValue`.

