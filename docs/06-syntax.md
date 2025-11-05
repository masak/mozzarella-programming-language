# Syntax node types

Following C#, there is one type `SyntaxNode` for nodes in the syntax tree.
Though the syntax for class definitions is still conjectural, I imagine it
could be defined like this:

```
class SyntaxNode {
    @get
    has kind: SyntaxKind

    @get
    has children: Array[SyntaxNode | None]
}
```

The below nested list contains the possible values of the `kind` field of
syntax nodes. On the right is for each concrete node type a list of the types
of its children.

Some of the syntax kinds have a `Type?` child, but we do not yet implement
type annotations, so the value in this spot will always be `none` for now.

```
CompUnit                    -- (Statement | Decl)*
Block                       -- (Statement | Decl)*
Parameter                   -- identifier, Type?
ParameterList               -- Parameter*
Argument                    -- Expr
ArgumentList                -- Argument*
IfClause                    -- Expr, Block
IfClauseList                -- IfClause*
Statement
  EmptyStatement            -- (none)
  ExprStatement             -- Expr
  BlockStatement            -- Block
  IfStatement               -- IfClauseList, Block?
  ForStatement              -- identifier, Expr, Block
  WhileStatement            -- Expr, Block
  LastStatement             -- (none)
  NextStatement             -- (none)
Decl
  VarDecl                   -- identifier, Type?, Expr?
  FuncDecl                  -- identifier, ParamList, Type?, Block
  MacroDecl                 -- identifier, ParamList, Type?, Block
Expr
  AssignExpr                -- Expr, Expr
  IndexingExpr              -- Expr, Expr
  CallExpr                  -- Expr, ArgumentList
  PrimaryExpr
    IntLitExpr              -- intLit
    StrLitExpr              -- strLit
    BoolLitExpr             -- "true" | "false"
    NoneLitExpr             -- (none)
    PrefixOpExpr            -- opToken, Expr
    InfixOpExpr             -- Expr, opToken, Expr
    ArrayInitializerExpr    -- Expr*
    VarRefExpr              -- identifier
    CodeQuoteExpr           -- Block
    CodeUnquoteExpr         -- Expr
    DoExpr                  -- Block
    ParenExpr               -- Expr
```

