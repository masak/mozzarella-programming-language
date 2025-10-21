# mozzarella-programming-language

An unassuming language with a way to create code in macros using hygienic
string interpolation.

## Installation

```
$ git clone git@github.com:masak/mozzarella-programming-language.git
$ cd mozzarella-programming-language
$ npm install
$ npm test
```

## Example

Take the traditional swap macro as an example.

```
macro swap(x, y) {
    code`
        my temp = ${x};
        ${x} = ${y};
        ${y} = temp;
    `;
}
```

The declaration of `temp` in the generated macro code gets us in
trouble if there's already another `temp` declaration in the caller's scope:

```
{
    my temp = "25 degrees";
    my angle = "60 degrees";
    swap(temp, angle);
}
```

Picture the result of the macro expansion:

```diff
 {
     my temp = "25 degrees";
     my angle = "60 degrees";
+    my temp = temp;    // error: redeclaration of `temp`
+    temp = angle;
+    angle = temp;
 }
```

Where did we go wrong? Thinking of the replacement as a purely textual thing,
or even AST-based but with variables represented just by their string names,
is not powerful enough to discriminate between the `temp` of the caller code
and the `temp` of the macro-generated code.

But could the `code` construct do the right thing? Here, that would be
something that led to the following expanded code:

```
{
    my temp = "25 degrees";
    my angle = "60 degrees";
    my a001::temp = temp;
    temp = angle;
    angle = a001::temp;
}
```

The exact name `a001::temp` isn't what's important here. What's important is
that the name can be changed from `temp`, and that the resulting name is so
unique that repeated or even re-entrant activations of the macro results in
distinct names.

Under the hood, the `code` construct builds an AST, in which the names hold
enough provenance to know they are from a certain macro activation. When it
is expanded into the calling code, the names won't collide even if the "short
names" happen to coincide.

## Features

- [x] [integers](https://github.com/masak/mozzarella-programming-language/blob/main/spec/01-int.md)
- [x] [strings](https://github.com/masak/mozzarella-programming-language/blob/main/spec/02-str.md)
- [x] [booleans](https://github.com/masak/mozzarella-programming-language/blob/main/spec/03-bool.md)
- [x] [none](https://github.com/masak/mozzarella-programming-language/blob/main/spec/04-none.md)
- [x] [integer operators](https://github.com/masak/mozzarella-programming-language/blob/main/spec/05-int-ops.md)
- [x] [string operators](https://github.com/masak/mozzarella-programming-language/blob/main/spec/06-str-ops.md)
- [x] [boolean operators](https://github.com/masak/mozzarella-programming-language/blob/main/spec/07-bool-ops.md)
- [x] [comparison operators](https://github.com/masak/mozzarella-programming-language/blob/main/spec/08-comparison.md)
- [x] [parentheses](https://github.com/masak/mozzarella-programming-language/blob/main/spec/09-parens.md)
- [x] [expression statements](https://github.com/masak/mozzarella-programming-language/blob/main/spec/10-expr-stmt.md)
- [x] [empty statements](https://github.com/masak/mozzarella-programming-language/blob/main/spec/11-empty-stmt.md)
- [x] [statement lists](https://github.com/masak/mozzarella-programming-language/blob/main/spec/12-statement-list.md)
- [x] [block statements](https://github.com/masak/mozzarella-programming-language/blob/main/spec/13-block-stmt.md)
- [x] [`do` expressions](https://github.com/masak/mozzarella-programming-language/blob/main/spec/14-do-expr.md)
- [x] [`if` statements](https://github.com/masak/mozzarella-programming-language/blob/main/spec/15-if-stmt.md)
- [x] [arrays](https://github.com/masak/mozzarella-programming-language/blob/main/spec/16-array.md)
- [x] [indexing](https://github.com/masak/mozzarella-programming-language/blob/main/spec/17-indexing.md)
- [x] [variable declarations](https://github.com/masak/mozzarella-programming-language/blob/main/spec/18-var-decl.md)
- [x] [variable reference](https://github.com/masak/mozzarella-programming-language/blob/main/spec/19-var-ref.md)
- [x] [`for` statements](https://github.com/masak/mozzarella-programming-language/blob/main/spec/20-for-stmt.md)
- [x] [assignments](https://github.com/masak/mozzarella-programming-language/blob/main/spec/21-assign-expr.md)
- [x] [`while` statements](https://github.com/masak/mozzarella-programming-language/blob/main/spec/22-while-stmt.md)
- [ ] `last` statements
- [ ] `next` statements
- [ ] functions
- [ ] parameters
- [ ] `return` statements
- [ ] calls
- [ ] macros
- [ ] code quotation
- [ ] quote interpolation
- [ ] macro hygiene

## Code quoting

**Code quoting**, also known as quasiquotation, converts some actual source
code to a first-class value in the program. Compared to building code using
nested AST node constructors, a code quote is more direct, one layer of
indirection _closer_ to the code we're representing.

The syntax for the code quote is modeled on JavaScript's template strings. So
is the syntax for interpolation, `${ }`. The evaluation is also analogous:
first all the interpolation expressions are evaluated, left to right, and then
the results are used to fill the corresponding holes and construct a complete
AST.

There's one difference to template strings, though: since code quotes contain
arbitrary code, they can also contain nested code quotes. This is not unheard
of in metaprogramming; you're not going to use it on Day 1 in your macros, but
let's say the day you decide to write a macro which generates a macro
definition, and the generated macro's body is likely to contain a nested code
quote.

```
macro genMacro(a1, a2) {
    code`
        macro myMacro(b1, b2) {
            code`
                // ...
            `;
        }
    `;
}
```

Again, this does not happen in template strings, essentially because strings
are "flat" sequences of characters, and in particular don't have any nested
quoting capability. The closest thing is that you can include the string's own
delimiters inside the string content itself, by backslashing them. With nested
code quotes, however, no backslash is needed.

Just like you can have two (or more) layers of code quotation, you can have two
(or more) layers of interpolation: `${ ${ } }`. The "un-nesting" effect of the
interpolation syntax is applied twice in this case; that would take you from
the doubly code-quoted level of the `// ...` line to the level outside the
outermost code quote, in the `genMacro` body.

The ability to stack multiple interpolations like this means that outer code
quotes participate not just in interpolating and building themselves, but also
inner code quotes. This adds to the expressivity and power of code quotes.

## The outer of the injectile

Consider this example:

```
macro dubious(x) {
    code`
        print(x)
    `;
}
```

This example will fail with a certainty, because the `x` in `print(x)` is
unbound, and at the time it's incorporated in place of the macro call, this
will be discovered. Note that the presence of the `x` parameter to the macro
does not change the situation.

However, the `print` in the code quote should be fine, and so the outer
scope of the code that gets inserted cannot just be the empty scope.

In light of this, we decide the following:

> The outer scope of the injectile is the "standard scope" (containing
> readonly bindings to builtins like `print`).

It does mean the following:

* If `print` was redefined/shadowed in the environment of the macro, this
  redefinition will not be seen/used by the expanded code.
* It is not possible to read/write a global variable that's in the macro's
  module (whether or not this module is the same as the macro call).

These restrictions are known, and the decision is nevertheless made as
above.

The restrictions also eliminate the possibility of "Type II accidental
capture", which is when surrounding context at the caller influences
the meaning of names in the injectile in ways that the macro author
never intended. But since the surrounding context at the caller cannot
influence the injectile at all, this kind of accidental capture can never
happen.

## Grammophone grammar

https://mdaines.github.io/grammophone/ is a good place to confirm that a
grammar adheres to the LR criterion.

```
Program -> .
Program -> StatementOrDeclList .

StatementOrDeclList -> StatementOrDecl .
StatementOrDeclList -> StatementOrDeclList StatementOrDecl .

StatementOrDecl -> Statement .
StatementOrDecl -> Decl .

Statement -> EmptyStatement .
Statement -> ExprStatement .
Statement -> BlockStatement .
Statement -> IfStatement .

EmptyStatement -> ";" .

ExprStatement -> Expr ";" .

BlockStatement -> Block .

IfStatement -> "if" Expr Block .
IfStatement -> "if" Expr Block "else" Block .
IfStatement -> "if" Expr Block ElseIfClauses .
IfStatement -> "if" Expr Block ElseIfClauses "else" Block .

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
Block -> "{" StatementOrDeclarationList "}" .

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

For the above grammar, the LALR parser has 91 states.

## Types

* `Int`
* `Str`
* `Bool`
* `None`
* `Array`
* `SyntaxNode`

## Syntax node types

Following C#, there is one type `SyntaxNode` for nodes in the syntax tree.
The below nested list contains the possible values of the `kind` field of syntax nodes.
On the right is for each concrete node type a list of the types of its children.
Currently, where it says `name`, we assume it's actually a `Str`, but it could also be something more general which includes a gensym type.

```
Program                     -- (Statement | Decl)*
Statement
  EmptyStatement            -- (none)
  ExprStatement             -- Expr
  BlockStatement            -- Block
  IfStatement               -- IfClause, Block?
IfClause                    -- Expr, Block
Decl
  VarDecl                   -- identifier, Expr?
  FuncDecl                  -- identifier, ParamList, Block
  MacroDecl                 -- identifier, ParamList, Block
ParamList                   -- Param*
Param                       -- identifier
Block                       -- (Statement | Decl)*
Expr
  AssignExpr                -- Expr, Expr
  IndexingExpr              -- Expr, Expr
  CallExpr                  -- Expr, Argument*
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
Argument                    -- Expr
```

