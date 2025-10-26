# Grammophone grammar

https://mdaines.github.io/grammophone/ is a good place to confirm that a
grammar adheres to the LR criterion.

```
CompUnit -> .
CompUnit -> StatementOrDeclList .

StatementOrDeclList -> StatementOrDecl .
StatementOrDeclList -> StatementOrDeclList StatementOrDecl .

StatementOrDecl -> Statement .
StatementOrDecl -> Decl .

Statement -> EmptyStatement .
Statement -> ExprStatement .
Statement -> BlockStatement .
Statement -> IfStatement .
Statement -> ForStatement .
Statement -> WhileStatement .
Statement -> LastStatement .
Statement -> NextStatement .

EmptyStatement -> ";" .

ExprStatement -> Expr ";" .

BlockStatement -> Block .

IfStatement -> "if" Expr Block .
IfStatement -> "if" Expr Block "else" Block .
IfStatement -> "if" Expr Block ElseIfClauses .
IfStatement -> "if" Expr Block ElseIfClauses "else" Block .

ForStatement -> "for" identifier "in" Expr Block .

WhileStatement -> "while" Expr Block .

LastStatement -> "last" ";" .

NextStatement -> "next" ";" .

Decl -> VarDecl .
Decl -> FuncDecl .
Decl -> MacroDecl .

VarDecl -> "my" identifier ";" .
VarDecl -> "my" identifier "=" Expr ";" .

FuncDecl -> "func" identifier "(" ")" Block .
FuncDecl -> "func" identifier "(" ParameterList ")" Block .

MacroDecl -> "macro" identifier "(" ")" Block .
MacroDecl -> "macro" identifier "(" ParameterList ")" Block .

ParameterList -> Parameter .
ParameterList -> ParameterList "," Parameter .

Parameter -> identifier .

Block -> "{" "}" .
Block -> "{" StatementOrDeclList "}" .

Expr -> AssignmentExpr .

AssignmentExpr -> CallExpr .
AssignmentExpr -> VariableRef "=" CallExpr .

CallExpr -> PrimaryExpr .
CallExpr -> CallExpr "(" ")" .
CallExpr -> CallExpr "(" ArgumentList ")" .

ArgumentList -> Argument .
ArgumentList -> ArgumentList "," Argument .

Argument -> Expr .

PrimaryExpr -> StrLit .
PrimaryExpr -> IntLit .
PrimaryExpr -> "true" .
PrimaryExpr -> "false" .
PrimaryExpr -> "none" .
PrimaryExpr -> VarRefExpr .
PrimaryExpr -> CodeQuoteExpr .
PrimaryExpr -> CodeUnquoteExpr .
PrimaryExpr -> DoExpr .
PrimaryExpr -> "(" Expr ")" .
PrimaryExpr -> "[" "]" .
PrimaryExpr -> "[" ElementList "]" .

ElementList -> Expr .
ElementList -> ElementList "," Expr .

VarRefExpr -> identifier .

CodeQuoteExpr -> "code" "`" "`" .
CodeQuoteExpr -> "code" "`" StatementOrDeclList "`" .

CodeUnquoteExpr -> "${" Expr "}" .

DoExpr -> "do" Statement .
```

For the above grammar, the LALR parser has 115 states.

