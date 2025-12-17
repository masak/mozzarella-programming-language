## unquote expression

**New token**: `Dollar` (`$`).

**Context-free syntax**:

* `UnquoteExpr ::= "$" "{" Expr "}" ;`

```
| Syntax node kind       | Children                      |
|------------------------|-------------------------------|
| `UnquoteExpr`          | `Expr`                        |
```

**Validation**:

For any syntax node in the compilation unit, define the _quote level_ of that
node as `Q - U`, the number `Q` of `QuoteExpr` nodes among the node's ancestors
(excluding the node itself), minus the number `U` of `UnquoteExpr` nodes among
the node's ancestors (excluding the node itself).

When validating a compilation unit, any unquote expression node whose quote
level is zero or less is considered invalid, and causes a validation error.

**Evaluation**:

To _traverse a quoted node_ `n` means to do the following:

* Set the quote level to 1.
* Traverse nodes with `n` as a root:
    * On the way down through a node `e`:
        * If `e` is a `QuoteExpr`, increment the quote level by 1.
        * If `e` is an `UnquotExpr`, decrement the quote level by 1.
        * If the quote level is now 0:
            * Do not traverse any of the descendants of `e`.
            * Evaluate `e` to a value `v`.
                * If `v` is an `IntValue`, replace `e` with the corresponding
                  `SyntaxNodeValue` of kind `IntLitExpr`.
                * If `v` is a `StrValue`, replace `e` with the corresponding
                  `SyntaxNodeValue` of kind `StrLitExpr`.
                * If `v` is a `BoolValue`, replace `e` with the corresponding
                  `SyntaxNodeValue` of kind `BoolLitExpr`.
                * If `v` is a `NoneValue`, replace `e` with a `SyntaxNodeValue`
                  of kind `NoneLitExpr`.
                * If `v` is a `SyntaxNodeValue`:
                    * If the kind of `v` is an expression, replace `e` with
                      `v`.
                    * If the kind of `v` is a statement, replace `e` with a
                      `SyntaxNodeValue` of kind `DoExpr`, containing `v` as its
                      child.
                    * Otherwise, fail with a type error.
                * Otherwise, fail with a type error.
    * On the way up through a node `e`:
        * Create the `reify(e)`.

We redefine evaluation of a `QuoteExpr` as follows:

* `code\` sl \``
    * If the statement list `sl` has length 1:
        * Name the single statement in the statement list `s`.
        * If `s` is an ExprStatement:
            * Name the expression in the expression statement `e`.
            * Traverse the quoted node `e` and return the result.
        * Otherwise:
            * Create a `DoExpr` containing `s`; name it `e`.
            * Traverse the quoted node `e` and return the result.
    * Otherwise:
        * Create a `Block` containing `sl`; name it `b`.
        * Create a `BlockStatement` containing `b`; name it `s`.
        * Create a `DoExpr` containing `s`; name it `e`.
        * Traverse the quoted node `e` and return the result.

**Macro expansion**:

In the traversal of nodes during the macro expansion pass, disregard nodes of
quote level greater than zero.

