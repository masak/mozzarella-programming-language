## statement lists

**Context-free syntax**: `StatementList ::= Statement* ;`

We change the definition of a _program_ from being a single statement to being
a statement list. Later on, a statement list will also be allowed to contain
declarations.

We make the semicolon in the empty statement required; this avoids a
grammatical ambiguity.

`EmptyStatement ::= ";" ;`

**Execution**:

We _execute_ statement lists, same as we execute statements.

* `s1; s2; ... sN` (N >= 0)
    * Set `result` to a new `NoneValue`.
    * For each statement `s` in the statement list:
        * Execute `s` and update `result` with the result.
    * Return `result`.

