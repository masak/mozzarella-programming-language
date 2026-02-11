# Macro expansion hygiene

This actually requires some deliberate design, which is why I'm writing it out
in this document.

Which syntax types _bind_ an identifier? These:

* `ForStatement` (the element variable)
* `VarDecl`
* `Parameter`
* `FuncDecl`
* `MacroDecl`

Dually, which syntax types _reference_ a bound identifier? Well, only the one:

* `VarRefExpr`

In a lovely, naïve world without macros, the social contract is simple, and
this simplicity works fine for all involved. The simple contract looks like
this:

* A declarator introduces an identifier, which is a _string_ (selected by the
  author of the declarator!); this identifier is then visible in a scope
  determined by the particular syntax type.
* A variable reference supplies a _string_, which is then used as a key in an
  _innermost scope wins_ search.

You could call this model the "high-trust society" of declaration and lookup.

Two things go wrong as we pass into a world with first-class syntax objects and
macro expansion:

* **Names are not enough**. Specifically, identifiers can't just be simple
  strings anymore. This is because where there used to be a single author of
  the code who could act as a central authority of such names, now there are
  multiple such authors (including macros and code quotes); these authors are
  located in disparate parts of time and space, and are unable to coordinate
  with each other on names in general.

* **Not in Kansas anymore**. I feel like I'm delivering extremely bad news
  here. Via the wonderful process of macro expansion, it's possible for a
  variable reference to end up _not in the scope_ of its declarator.

Let's try to fix the first problem first. We need to treat identifiers as
having two parts &mdash; the original string name (which isn't enough), and
a new, unique identity:

```
class Identifier {
    displayName: string;
    identity: object;
}
```

When are two `Identifier` instances considered equivalent? When their
`.identity` properties are reference-equal.

