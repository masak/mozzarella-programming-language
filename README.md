# mozzarella-programming-language

An unassuming language with a way to create code in macros using hygienic
string interpolation.

## Example

Take the traditional swap macro as an example.

```
macro swap(x, y) {
    code`
        let temp = ${x};
        ${x} = ${y};
        ${y} = temp;
    `;
}
```

The declaration of `temp` in the generated macro code gets us in
trouble if there's already another `temp` declaration in the caller's scope:

```
{
    let temp = "25 degrees";
    let angle = "60 degrees";
    swap(temp, angle);
}
```

Picture the result of the macro expansion:

```diff
 {
     let temp = "25 degrees";
     let angle = "60 degrees";
+    let temp = temp;    // error: redeclaration of `temp`
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
    let temp = "25 degrees";
    let angle = "60 degrees";
    let a001::temp = temp;
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

```
Program -> .
Program -> StatementOrDeclarationList .

Statement -> EmptyStatement .
Statement -> ExprStatement .

EmptyStatement -> ";" .

ExprStatement -> Expr ";" .

Declaration -> LetDeclaration .
Declaration -> MacroDeclaration .

LetDeclaration -> "let" identifier "=" Expr ";" .

MacroDeclaration -> "macro" identifier "(" ")" Block .
MacroDeclaration -> "macro" identifier "(" ParameterList ")" Block .

ParameterList -> Parameter .
ParameterList -> ParameterList "," Parameter .

Parameter -> identifier .

Block -> "{" "}" .
Block -> "{" StatementOrDeclarationList "}" .

StatementOrDeclarationList -> StatementOrDeclaration .
StatementOrDeclarationList -> StatementOrDeclarationList StatementOrDeclaration .

StatementOrDeclaration -> Statement .
StatementOrDeclaration -> Declaration .

Expr -> AssignmentExpr .

AssignmentExpr -> CallExpr .
AssignmentExpr -> VariableRef "=" CallExpr .

CallExpr -> PrimaryExpr .
CallExpr -> CallExpr "(" ")" .
CallExpr -> CallExpr "(" ArgumentList ")" .

ArgumentList -> Argument .
ArgumentList -> ArgumentList "," Argument .

Argument -> Expr .

PrimaryExpr -> StrLiteral .
PrimaryExpr -> IntLiteral .
PrimaryExpr -> TrueLiteral .
PrimaryExpr -> FalseLiteral .
PrimaryExpr -> NoneLiteral .
PrimaryExpr -> VariableRef .
PrimaryExpr -> CodeQuote .
PrimaryExpr -> CodeUnquote .
PrimaryExpr -> "(" Expr ")" .

VariableRef -> identifier .

CodeQuote -> "code`" "`" .
CodeQuote -> "code`" StatementOrDeclarationList "`" .

CodeUnquote -> "${" Expr "}" .
```

For the above grammar, the LALR parser has 60 states.

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
Program                     -- Array<Statement | Declaration>
Statement
  EmptyStatement            -- (none)
  ExprStatement             -- Expr
Declaration
  LetDeclaration            -- Variable, Expr
  MacroDeclaration          -- Variable, ParameterList, Block
Variable                    -- name
ParameterList               -- Array<Parameter>
Parameter                   -- Variable
Block                       -- Array<Statement | Declaration>
Expr
  AssignmentExpr            -- VariableRef, Expr
  CallExpr                  -- Expr, ArgumentList
  PrimaryExpr
    StrLiteral              -- Str
    IntLiteral              -- Int
    TrueLiteral             -- (none)
    FalseLiteral            -- (none)
    NoneLiteral             -- (none)
    VariableRef             -- name
    CodeQuote               -- Array<Statement | Declaration> | Expr
    CodeUnquote             -- Expr
  Adapter
    NoneToExprAdapter       -- (none)
    ExprToExprAdapter       -- Expr
    StatementToExprAdapter  -- Statement
    StatementsToExprAdapter -- Array<Statement | Declaration>
ArgumentList                -- Array<Argument>
Argument                    -- Expr
```
