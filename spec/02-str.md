## strings

**New token**: `StrLit` (holding a `string` as payload).

**Lexical syntax**: Starting with a double quote (`"`); contains zero or more
of the following: either any character except double quote (`"`) or backslash
(`\\`), or any of the following escape sequences: `\\n`, `\\r`, `\\t`, `\\"`,
or `\\\\`; ending with a double quote (`"`). `/"([^"\\]|\\[nrt\\"])*"/

**Context-free syntax**: `StrLitExpr ::= StrLit ;`

**New value type**: `StrValue` (holding a `string` as payload).

**Evaluation**: A `StrLitExpr` evaluates to a `StrValue` whose payload is
the payload of the `StrLitExpr`'s `StrLit` token.

