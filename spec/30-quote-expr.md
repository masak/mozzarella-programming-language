## quote expression

**New token**: `Backquote` (`\``).

Also, `code` is being used as a _contextual keyword_, which means that it's
available as an identifier (and you can declare variables, functions, and
macros with this name), but functions as a keyword in a quote expression.

**Context-free syntax**:

* `QuoteExpr ::= "code" Backquote StatementList? Backquote ;`

```
| Syntax node kind       | Children                      |
|------------------------|-------------------------------|
| `QuoteExpr`            | `(Statement | Decl)*`         |
```

**Validation**:

When validating programs, `my x; { { x }; my x; }` triggers a validation error
("ambiguous variable reference"). However, ``my x; { code`x`; my x; }``
doesn't. The reason is that the `x` inside the code quote is quoted and not
an active part of the program. More generally, for the purposes of validaation,
quoted variable references do not count as variable references.

The validation skips quote expressions as a whole. When later quote
interpolation is added, some parts of quote expression need to be considered.

**Evaluation**:

* `code\` sl \``
    * If the statement list `sl` has length 1:
        * Name the single statement in the statement list `s`.
        * If `s` is an ExprStatement:
            * Name the expression in the expression statement `e`.
            * Return `reify(e)`.
        * Otherwise:
            * Create a `DoExpr` containing `s`; name it `e`.
            * Return `reify(e)`.
    * Otherwise:
        * Create a `Block` containing `sl`; name it `b`.
        * Create a `BlockStatement` containing `b`; name it `s`.
        * Create a `DoExpr` containing `s`; name it `e`.
        * Return `reify(e)`.

**Macro expansion**:

In the traversal of nodes during the macro expansion pass, disregard nodes of
type `QuoteExpr`; do not visit any of its descendants.

