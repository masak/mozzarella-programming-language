## 'if' statement

**New tokens**: `IfKeyword` (`if`), `ElseKeyword` (`else`).

**Context-free syntax**:

`IfExpr ::= "if" Expr Block ("else" "if" Expr Block)* ("else" Block)? ;`

Parentheses are not necessary around the conditional expressions. Blocks are
necessary, and there's no single-statement form. (As a result, there is also
no "dangling else" parsing ambiguity.) An `if` statement always ends in a
closing curly brace (`}`).

**Execution**:

* `if e1 { bl1 } [else if e2 { bl2 } ...]`
    * For each clause in turn, do the following:
        * Evaluate the expression `eK` to `vK`.
        * Boolify `vK` to `bK`.
        * If `bK` is true, run the block and return its value.
    * Return a new `NoneValue`.
* `if e1 { bl1 } [else if e2 { bl2 } ...] else { blN }`
    * For each clause in turn, do the following:
        * Evaluate the expression `eK` to `vK`.
        * Boolify `vK` to `bK`.
        * If `bK` is true, run the block and return its value.
    * Run the block `blN` and return its value.

