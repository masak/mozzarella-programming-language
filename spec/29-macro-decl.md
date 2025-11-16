## macro declarations

**New token**: `MacroKeyword` (`macro`).

**Context-free syntax**:

* `MacroDecl ::= "macro" Identifier "(" ParameterList ")" Block ;`

**Static validity**: The statement list of the program or any block may not
contain duplicate declarations, that is, two or more declarations of the same
name.

**New value types**: `MacroValue`, containing the following properties:

* `name`, a string
* `outerEnv`, an environment
* `parameters`, an array of parameters
* `body`, a block

When stringifying a `MacroValue`, the following procedure is used:

* Return the string `"<func "`, concatenated with the `name`, concatenated with
  `"("`, concatenated with all the `parameters`, comma-separated, concatenated
  with `")>"`.

When boolifying a `MacroValue`, the boolean value `true` is always returned.

The type `MacroValue` is not considered comparable.

When checking whether a `MacroValue v1` equals a `MacroValue v2`, the following
procedure is used:

* If `v1` and `v2` are the exact same object (by reference ID), return `true`.
* Otherwise return `false`.

Also a new type `SyntaxNodeValue`, containing the following properties:

* `kind`, an `IntValue`
* `children`, an `ArrayValue`
* `payload`, any of `IntValue | StrValue | BoolValue | NoneValue`

When stringifying a `SyntaxNodeValue`, the following procedure is used:

* Return the string `"<syntax "`, concatenated with a string representation
  of the `kind` (such as `"InfixOpExpr"`), concatenated with `")>"`.

When boolifying a `SyntaxNodeValue`, the boolean value `true` is always
returned.

The type `SyntaxNodeValue` is not considered comparable.

Values of type `SyntaxNodeValue` cannot (at present) be created from scratch
in the program; the only way to produce such a value is to convert a macro
argument (in the form of built-in syntax) into a `SyntaxNodeValue`; we say that
the syntax node is **reified** into a `SyntaxNodeValue`.

The following syntax nodes represent tokens.

```
| Token kind     | Payload  |
|----------------|----------|
| `Identifier`   | `string` |
| `Operator`     | (none)   |
| `IntLit`       | `bigint` |
| `StrLit`       | `string` |
| `TrueKeyword`  | `true`   |
| `FalseKeyword` | `false`  |
| `NoneLit`      | (none)   |
```

The following syntax nodes are uncategorized and serve as either the root node
of a compilation unit, or as part of larger syntax trees.

```
| Syntax node kind | Children               |
|------------------|------------------------|
| `CompUnit`       | `(Statement \| Decl)*` |
| `Block`          | `(Statement \| Decl)*` |
| `IfClause`       | `Expr, Block`          |
| `IfClauseList`   | `IfClause+`            |
| `Parameter`      | `Identifier, null`     |
| `ParameterList`  | `Parameter*`           |
| `Argument`       | `Expr`                 |
| `ArgumentList`   | `Argument*`            |
```

The following syntax nodes represent expressions.

```
| Syntax node kind  | Children                      |
|-------------------|-------------------------------|
| `ExprStatement`   | `Expr`                        |
| `EmptyStatement`  | (none)                        |
| `BlockStatement`  | `Block`                       |
| `IfStatement`     | `IfClauseList, Block \| null` |
| `ForStatement`    | `Identifier, Expr, Block`     |
| `WhileStatement`  | `Expr, Block`                 |
| `LastStatement`   | (none)                        |
| `NextStatement`   | (none)                        |
| `ReturnStatement` | `Expr \| null`                |
```

The following syntax nodes represent declarations.

```
| Syntax node kind  | Children                                 |
|-------------------|------------------------------------------|
| `VarDecl`         | `Identifier, null, Expr \| null`         |
| `FuncDecl`        | `Identifier, ParameterList, null, Block` |
| `MacroDecl`       | `Identifier, ParameterList, null, Block` |
```

The following syntax nodes represent expressions.

```
| Syntax node kind       | Children                      |
|------------------------|-------------------------------|
| `PrefixOpExpr`         | `Operator, Expr`              |
| `InfixOpExpr`          | `Expr, Operator, Expr`        |
| `IndexingExpr`         | `Expr, Expr`                  |
| `CallExpr`             | `Expr, ArgumentList`          |
| `IntLitExpr`           | `IntLit`                      |
| `StrLitExpr`           | `StrLit`                      |
| `BoolLitExpr`          | `TrueKeyword \| FalseKeyword` |
| `NoneLitExpr`          | (none)                        |
| `ParenExpr`            | `Expr`                        |
| `DoExpr`               | `Statement`                   |
| `ArrayInitializerExpr` | `Expr*`                       |
| `VarRefExpr`           | `Identifier`                  |
```

Conversely, a value returned from a macro is **absorbed** into
compiler-internal syntax using the following rules:

* A `NoneValue`, `IntValue`, `StrValue`, or `BoolValue` is converted into the
  corresponding `NoneLitExpr`, `IntLitExpr`, `StrLitExpr`, or `BoolLitExpr`,
  respectively.
* A `SyntaxNodeValue` representing a token of a certain kind `k` and with a
  certain payload `p` is converted into a token of kind `k` with payload `p`.
* A `SyntaxNodeValue` representing a syntax node of a certain kind `k` and with
  children `c` is converted into a syntax node of kind `k` and with children
  `c` (all absorbed).

When checking whether a `SyntaxNodeValue v1` equals a `SyntaxNodeValue v2`, the
following procedure is used:

* If `v1` and `v2` are the result of reifying the exact same syntax node,
  return `true`.
* Otherwise return `false`.

**Execution**:

Macro declarations are executed at _block entry_, creating a readonly binding
for the macro name to the corresponding `MacroValue`.

* `macro <name>(<params>) { <block> }`
    * In the current environment, create a readonly binding from `<name>` to a
      new `MacroValue` whose `name` is `<name>`, whose `outerEnv` is the
      current environment, whose `parameters` is the array of parameters
      `<params>`, and whose `body` is `<block>`.

If the left side of a call expression evaluates to a `MacroValue`, a runtime
error is thrown about macros not being callable at runtime.

**Macro expansion**:

After parsing and validation of a compilation unit, the compilation unit is
_macro-expanded_:

* Traverse the entire syntax tree in preorder (handling each node before its
  child nodes):
    * Along the traversal, manage a _static environment_ `env`, registering
      bindings in their appropriate environment; respect all binders in the
      language, including those in `CompUnit` and `Block`, and also binders
      found inside `ForStatement`, `FuncDecl`, and `MacroDecl`.
    * If the current node is a `CallExpr` and its left-hand side is a
      `VarRefExpr` with the name `<name>`:
        * _Tolerantly_ look up `<name>` in the current static environment
          `env`:
            * Forever:
                * If `env` contains a binding from `<name>` to `v`:
                    * If `v` is an `UninitValue`, fail silently and continue
                      to the next node.
                    * Otherwise, return `v`.
                * Otherwise, if `env` has an outer environment, set `env` to
                  this outer environment and continue to the next iteration.
                * Otherwise (if `env` has no outer environment), fail silently
                  and continue to the next node.
        * If the value `v` returned from the lookup is a `MacroValue`:
            * Collect the list of argument expressions from the `CallExpr`; do
              _not_ evaluate the expressions; instead, reify them into
              `SyntaxNodeValue`s as outlined above.
            * Call `MacroValue` `v` with the arguments converted to
              `SyntaxNodeValue`s; in other words, invoke the evaluator (via a
              dedicated entry function for macro calls) so that the macro call
              is evaluated and a value `r` is returned.
            * If `r` is a `NoneValue`:
                * Replace the current node with a new `NoneLitExpr`.
            * If `r` is an `IntValue`:
                * Replace the current node with a new `IntLitExpr`, with an
                  `IntLit` token with the same payload as `r`.
            * If `r` is a `StrValue`:
                * Replace the current node with a new `StrLitExpr`, with a
                  `StrLit` token with the same payload as `r`.
            * If `r` is a `BoolValue`:
                * Replace the current node with a new `BoolLitExpr`, with a
                  `TrueKeyword` or `FalseKeyword` token with the same payload
                  as `r`.
            * If `r` is a `SyntaxNodeValue`:
                * Absorb `r` into a syntax node `s`, as outlined above.
                * If `s` is an expression:
                    * Replace the current node with `s`.
                * If `s` is a statement:
                    * Replace the current node with a `DoExpr` containing `s`.
                * If `s` is a block:
                    * Replace the current node with a `DoExpr` containing a
                      `BlockStatement` containing `s`.
                * Otherwise:
                    * Fail with a compile-time error about incompatible syntax
                      node types.
            * Otherwise:
                * Fail with a compile-time error about a value type returned
                  from a macro call which cannot be turned into program syntax.
        * If the current node was replaced by the above step, _treat the
          resulting syntax tree as the tree being traversed_ (forgetting the
          old `CallExpr` node and its tree); continue the tree traversal on
          the (new) current node in the next step; specifically, if the new
          node is a `CallExpr` to a macro, that macro call will be expanded
          next.
* Any replacements done during the traversal resulting in a new syntax tree are
  conceptually considered mutations to the syntax tree of the current
  compilation unit; the resulting tree is what goes on to be evaluated during
  runtime.

