# mozarella-programming-language

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

Traditionally, the declaration of `temp` in the generated macro code gets us in
trouble if there's already another `temp` declaration in the caller's scope:

```
{
    let temp = "25 degrees";
    let angle = "60 degrees";
    swap(temp, angle);
}
```

Picture the result of the macro expansion:

```
{
    let temp = "25 degrees";
    let angle = "60 degrees";
    let temp = temp;    // error: redeclaration of `temp`
    temp = angle;
    angle = temp;
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

