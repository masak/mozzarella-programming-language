## booleans

**New tokens**: `TrueKeyword` (holding `true` as payload) and `FalseKeyword`
(holding `false` as payload).

**Lexical syntax**: `true` and `false` are maximal (not followed by
an alphanumeric or an underscore).

**Context-free syntax**: `BoolLitExpr ::= TrueKeyword | FalseKeyword ;`

**New value type**: `BoolValue` (holding a `boolean` as payload).

**Evaluation**: A `BoolLitExpr` evaluates to a `BoolValue` whose payload is
the payload of the `BoolLitExpr`'s keyword token.

