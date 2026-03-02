# Macro expansion hygiene

This requires deliberate design, which is why I'm writing it out in this
document.

Which syntax types _bind_ an identifier? These:

* `ForStatement` (the element variable)
* `VarDecl`
* `Parameter`
* `FuncDecl`
* `MacroDecl`

Dually, which syntax types _reference_ a bound identifier? Only the one:

* `VarRefExpr`

In a lovely, naïve world without macros, the social contract is simple, and
this simplicity works fine for all involved. Like this:

* A declarator introduces an identifier, which is a _string_ (chosen by the
  author of the declarator!); this identifier is then visible in a scope
  determined by the particular syntax type.
* A variable reference consists of a _string_, which is then used as a key in
  an _innermost scope wins_ search.

You could call this model the "high-trust society" of declaration and lookup.
It works because of the direct WYSIWYG relationship between the blocks in the
source text and the variable scopes in the resulting program.

Two things go wrong as we pass into a world with first-class syntax objects and
macro expansion:

* **Names are not enough**. Specifically, identifiers can't just be simple
  strings anymore. This is because where there used to be a single author of
  the code who could act as a central responsible authority of such names, now
  there are multiple such authors (including macros and code quotes); these
  authors are located in disparate parts of time and space, and are unable to
  coordinate with each other on names in general.

* **Not in Kansas anymore**. I feel like I'm the bearer of bad news here. Via
  the wonderful process of macro expansion, it's possible for a variable
  reference to end up _not in the scope_ of its original declarator. A search
  which traverses progressively outer scopes from the variable reference, will
  not find the declarator.

Let's address the first problem first. We need to treat identifiers as having
two parts &mdash; the original string name (which isn't enough), and a new,
unique identity:

```
class Identifier {
    displayName: string;
    identity: object;
}
```

When are two `Identifier` instances considered equivalent? When their
`.identity` properties are reference-equal.

The old, naive world doesn't go away entirely. It remains in several places
before code is properly "integrated":

* At the time we parse the code, identifiers are still strings. After it passes
  validation, it is then integrated, and each identifier is turned into an
  `Identifier` as above. We still don't give an early error for variable
  references without a corresponding binder; instead we either keep them as
  strings, or turn them into an `Identifier` with a special `.identity` that
  means "unbound" (and that will give an error at runtime as usual).
* Inside of code quotes, identifiers are still strings. At this point, they
  don't really follow any scoping regime. However, any code that is returned
  from a macro as the result of macro expansion is integrated as part of being
  incorporated into the mainline program. (Those code objects will in general
  contain a mixture of string identifiers and `Identifier`-identifiers. We only
  upgrade the former, and leave the latter alone.)
* In Mozzarella's future, it might be possible to create syntax nodes as
  objects. These could certainly support both the string form of identifier,
  and the `Identifier` form. They are passed around as-is without modification;
  if they are returned from a macro as the result of macro expansion (quite
  possibly as a smaller part of a bigger code object), the same rules as above
  apply.

As a result of all this, at the conclusion of the macro expansion pass, all the
code in the mainline program will have integrated identifiers, of the
`Identifier` type.

That takes care of the first problem. As for the second, the conservative thing
is to disallow all lookups except lexical ones.

