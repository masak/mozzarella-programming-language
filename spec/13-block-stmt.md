## block statements

**New tokens**: `BraceL` (`{`), `BraceR` (`}`).

**Context-free syntax**:

* `BlockStatement ::= Block ;`
* `Block ::= "{" StatementList "}" ;`

Blocks will be used in other nonterminals later, such as `if` statements and
function declarations.

**Execution**:

* `{ sl }`
    * Execute the statement list `sl` inside the block, resulting in `v`.
    * Return `v`.

