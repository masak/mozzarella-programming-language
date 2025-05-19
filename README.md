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

