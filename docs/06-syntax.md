# Syntax node types

Following C#, there is one type `SyntaxNode` for nodes in the syntax tree.
Though the syntax for class definitions is still conjectural, I imagine it
could be defined like this:

```
class SyntaxNode {
    @get
    has kind: SyntaxKind;

    @get
    has children: Array[SyntaxNode];

    @get
    has payload: Int | Str | Bool | None;
}
```

The below nested list contains the possible values of the `kind` field of
syntax nodes. On the right is for each concrete node type a list of the kinds
of its children.

The indentation below shows that some kinds are abstract, and contain all their
descendant kinds, the leaf kinds of which are concrete.

In instances where we use a `?` suffix after a kind, it means either a child of
that kind is expected, or else an `EmptyPlaceholder`.

In instances where we use a `*` suffix after a kind, it means we expect zero or
more children of that kind. (No `EmptyPlaceholder` is allowed.) As a policy,
when there's a `*`, there are no children of other kinds involved.

Some of the syntax kinds have a `Type?` child, but we do not yet implement
type annotations, so the value in this spot will always be `none` for now.

```
EmptyPlaceholder            -- (no children)
IntNode                     -- (Int payload)
StrNode                     -- (Str payload)
BoolNode                    -- (Bool payload)
CompUnit                    -- StatementOrDecl*
Block                       -- StatementOrDecl*
Parameter                   -- StrNode, Type?
ParameterList               -- Parameter*
Argument                    -- Expr
ArgumentList                -- Argument*
IfClause                    -- Expr, Block
IfClauseList                -- IfClause*
StatementOrDecl
  Statement
    EmptyStatement          -- (no children)
    BlockStatement          -- Block
    IfStatement             -- IfClauseList, Block?
    ForStatement            -- StrNode, Expr, Block
    WhileStatement          -- Expr, Block
    SimpleStatement
      ExprStatement         -- Expr
      LastStatement         -- (no children)
      NextStatement         -- (no children)
      ReturnStatement       -- Expr?
  Decl
    VarDecl                 -- StrNode, Type?, Expr?
    FuncDecl                -- StrNode, ParamList, Type?, Block
    MacroDecl               -- StrNode, ParamList, Type?, Block
Expr
  AssignExpr                -- Expr, Expr
  IndexingExpr              -- Expr, Expr
  CallExpr                  -- Expr, ArgumentList
  PrimaryExpr
    IntLitExpr              -- IntNode
    StrLitExpr              -- StrNode
    BoolLitExpr             -- BoolNode
    NoneLitExpr             -- (no children)
    InfixOpExpr             -- Expr, StrNode, Expr
    PrefixOpExpr            -- StrNode, Expr
    ParenExpr               -- Expr
    DoExpr                  -- Block
    ArrayInitializerExpr    -- Expr*
    VarRefExpr              -- StrNode
    QuoteExpr               -- StatementOrDecl*
    UnquoteExpr             -- Expr
```

