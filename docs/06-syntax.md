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

```
CompUnit                    -- (Statement | Decl)*
Block                       -- (Statement | Decl)*
Parameter                   -- identifier
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
  VarDecl                   -- identifier, Expr?
  FuncDecl                  -- identifier, ParamList, Block
  MacroDecl                 -- identifier, ParamList, Block
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

