## 'do' expression

**New token**: `DoKeyword` (`do`).

**Context-free syntax**: `DoExpr ::= "do" Statement ;`

The exact requirements at the end of a 'do' expression are impossible to
capture as a context-free grammar. Once we have parsed a statement, we need
one of the following two conditions to be true:

* _Either_ we are directly after a semicolon or closing curly brace,
* _or_ we are directly before a closing curly brace or end-of-file.

**Evaluation**:

* `do s;`
    * Execute the statement `s`, resulting in `v`.
    * Return `v`.

