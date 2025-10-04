## empty statement

**Context-free syntax**: `EmptyStatement ::= ";"? ;`

Currently the semicolon in the empty statement is nullable; this will change
later, as we make statements a part of a bigger statement list -- then, the
nullability will result in an ambiguity.

**Execution**:

* `;`
    * Return a `NoneValue`.

