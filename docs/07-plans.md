# Near-future plans

## Errors with locations 🧭🔍

This is part of Hoare's minimum requirements for a language: that the error is
identified _in the source code_, so that the programmer knows where to look in
order to fix the problem. This is probably where we introduce "spans" in the
code, but also spend some time thinking about how to format compiler/runtime
diagnostics to be maximally informative.

## Web IDE 🕸🛠

A HTML page, modeled on the TypeScript playground. The important aspects are
being able to edit a program and run it.

As a slight improvement, it would be nice to have syntax highlighting of the
source code. Also, showing compile errors as red squiggly lines under the
identified code.

## Debugging/stepping 🐛🚶

Debugging brings with it a number of capabilities:

* **Breakpoints**, which moves from "run mode" to "debug mode" whenever we hit
  one.
* **Step into**, which moves into a function, if the current node is a function
  call (or just steps over if it isnt').
* **Step over**, which runs a function to completion, going to the next thing
  after it.
* **Step out**, which runs the current function to completion, and goes to the
  node after it in the caller.
* **Continue**, which moves again from "debug mode" to "run mode".

There could be a `sorry` expression, which acts like an in-band breakpoint.

## Web debugger 🕸🐛

Highlight the current statement (or smaller part thereof) that the debugger is
currently paused at.

Allow setting and unsetting breakpoints. (Most likely via the gutter on the
left.)

Provide "step into", "step over", "step out", "continue" buttons in the web UI.

## Show local variables and call stack 📚🖨

There's this idea of a "notional machine", need to look into that. Also SMoL.

Show all the local variables in the _current_ scope, along with a linked list
of all outer scopes.

Also show the call stack, that is, a linked list of all the active calls to
functions.

## Named parameters and arguments 🏷️✉️

The regular parameters and arguments are rebranded as "positional". The syntax
would be this:

```mozzarella
func f(named => x) {
    return x;
}

f(named => 42);
```

## Objects and classes 🪐🎓

Primarily, support for the `obj.prop` operator, for politely asking `obj` what
`prop` might be like.

Along with that, `class` declarations, and `has` declarations. `@get` and
`@set` annotations. Maybe more than that.

## The `is` operator 🔍✅

When `v is T` returns true, it means that the value `v` is of type `T`. There
is only one shared namespace, so `T` is in some sense (a name bound to) a
value.

## Modules 📦🔗

The addition of `import` declarations and `export`, um, keyword on
declarations. For now, relative paths only and modules being able to import
each other in the same project.

## Compilation to bytecode 🧬🚤

The addition of a bytecode for a new VM (with a ROM and a RAM), and the
compilation of the AST to that bytecode.

## Post-AST intermediate representation 🌊🗺

A nice in-between form (between AST and bytecode) would be a Mozzarella-like
syntax, but narrowed to serve the more restricted goals of control flow.

Basic blocks as functions-within-functions, control flow as tail calls between
these, registers as a `reg` array. Pizlonator phi-and-upsilon form. Compiler
passes which can efficiently transform this representation.

## Micros 🔬⚡

Like macros, but targeting the above post-AST intermediate representation.

## User-defined operators 🧙✨

Prefixes: `op_`; infixes: `_op_`; postfixes: `_op`. Annotations (optional) for
things like precedence and associativity.

## Make parser extensible 🔧🧠

The ability to extend terms, statements, declarations, on the parser level.

## Extensible semantics by desugaring 🍯🔌

Similar to macros. `unless <cond> { <block> }` desugars to `if !<cond> {
<block> }`. Need a way to declare this in modules which modify their caller
module, so that extended parsers generating new AST types also have a
desugaring for those AST types.

## Extensible semantics by evaluation rule 📜🔌

Supplying a new "case" for new AST types. The `unless` example gets implemented
as a _function_ with access to "internal" runtime things, like the current
environment, and the ability to evaluate subterms.

A more interesting example is `until <cond> { <block> }`, because it's a loop.
If we desugared it to `while !<cond> { <block> }`, the `until` loop would pick
up the loop properties from the `while` loop; but when writing an evaluation
rule for `until`, the loop properties have to be supplied in some other way.

## Make lexer extensible 🧵👶

So that we can, at the very least, write `0b` and `0x` integer literals.

## Static analyses 🔍🏗

Variables shouldn't be used if they were definitely not initialized. We should
have an analysis for that (maybe based on attribute grammars). Variables also
shouldn't be used if they were _not definitely_ initialized &mdash; i.e. maybe
they were, but maybe they were not. Less bad, but still bad.

Also, even without type annotations, we can trace through the programs and
conclude that some operation is trying to `+` together two `Bool` values or
whatever, so that the program will definitely fail. There are many other
examples like that, where we can statically catch a thing that will definitely
fail at runtime.

## Optional type checking 🧪🤷

Add (optional) _type annotations_ on variable declarations, parameters,
function return types. Also add the `as` operator.

## `Rat` and `Num` types 🐀🌊

With `Rat` being arbitrary-precision rationals, and `Num` being 64-bit
floating-point numbers. The regular arithmetic operators are defined for them
(but only within the same type; there's no casting going on); additionally, the
`/` operator is defined for both `Ret` and `Num` operands.

## Optional parameters 🎁🤷

Marked with a `?` after the parameter name.

Regular parameters (both positional and named) are rebranded as "required";
optional parameters must come after required ones.

A call to a function with optional parameters will still succeed, even if one
or more of the arguments corresponding to optional parameters are absent in the
argument list. Any parameter of such an absent argument is bound to `none`.

## Parameter defaults 🪂📋

Written `param = <expr>` or `param? = <expr>`; the `?` is redundant, since a
parameter with a default expression is optional.

The `<expr>` is a thunk, and evaluates (from left to right among the
parameters) if the corresponding argument is absent. The parameter is bound to
the result.

## Rest parameters 🧘📦

Spelled `...param`, it accepts any excess (positional) arguments into an
immutable array. There can be at most one rest parameter, and it must be last
in the parameter list.

## Spread argument syntax 🍞✨

Spelled `...<expr>`, it evaluates `<expr>` as part of the other arguments
(left to right), asserts the result is an array of N elements, and passes those
as N separate arguments. There are no restrictions as to where a spread
argument occurs in the argument list, nor how many there can be.

## Multi functions and multi methods 🪆🔧

Instead of `func` and `method`, one can declare `multi func` and `multi method`
with the semantic difference that several functions or methods with the same
name can coexist in the same scope.

Bound to that name is a _dispatcher function_ or _dispatcher method_, whose job
it is to accept the arguments from the caller, and use them to determine which
actual function or method to call. There needs to be a narrowest matching
function or method; otherwise throws a runtime error.

## Test module 🧪📦

Maybe copy Ava or something. Basically just need to be able to do assertions.

## Code coverage 🧺📏

Extend the evaluator so that it collects statistics for every called function,
executed statement, and taken branch. Writes it all to a file, preferably an
HTML file.

## Compound assignment 🧪🍱

Those `+=` and `&&=` things. Done for _all_ the infix operators in scope
(except assignment, and iffy ones like `<`, or diffy ones like `as`). Since
`&&` is short-circuiting, so is `&&=`; if `x` in `x &&= y` is falsy, `y` is
not even evaluated.

## Increment/decrement operators ⬆️⬇️

`x++` and `x--`, which take a location and return a value. (The location is
immediately incremented and the new value is returned.)

`++x` and `--x`, which take a location and return a location. (The location is
immediately incremented, but (when used as a value) the old value is returned.)

## Partial evaluation 🧩🔍

Given a function (as syntax), allow one or more of its parameters to be known,
either completely as concrete values, or partially as boolean constraints/
predicates. Return a new function (as syntax), with the fully known parameters
removed (everywhere), and the remaining code simplified.

## Enums 🎰🔢

Inspired by PiSigma, I'd like to try this syntax:

```mozzarella
enum Season {
    case .spring;
    case .summer;
    case .fall;
    case .winter;
}
```

These dotted names are then "public symbols" of a new type `Symbol`. Since any
such symbol can belong to several enums, you can ask `.summer is Season` (which
is `true`), but `type(.summer)` is `Symbol`.

## Code formatting ✨🖊️

Consistently indenting and formatting some syntax to text. A first simple
version can pretend that lines of code can be infinitely long; later versions
can attempt the difficult but rewarding task of trying to keep line length
below some given maximum (such as 80 columns).

## CGA drawing library 🖥️🎨

A simple basic layer of drawing primitives (pixels, lines, circles, arcs) as a
start.

A second layer could do the same, but all with a declarative scene graph. I
don't have solid plans for more advanced things, such as sprites, animation,
and interaction -- but those could certainly be subsequent layers.

## Boltzmann generation from grammars 🎲📚

Given a grammar and a number N, it is possible to _effectively_ produce an N-
token sequence that G accepts. The algorithm for this is easier to specify if
we assume that G has no nullable nonterminals -- fortunately this is not even
a limitation in practice, as conversion to Chomsky Normal Form show how we can
convert a grammar G to an equivalent one with no nullable nonterminals (or at
most one).

Given this, we can automatically generate oodles of syntactically well-formed
Mozzarella programs, and expose them to various thrilling property tests.

