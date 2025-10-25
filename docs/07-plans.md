# Near-future plans

## Run with fuel

After the recent change to a CEK machine, it should be a small fix to run the
machine at most N step, with N being supplied as a parameter.

This in turn would allow some tests to be written that are otherwise hard to
write, such as trying out infinite loops (checking that they indeed do run out
of fuel, even with enough fuel).

## Typed errors

Right now, some of the tests only check that the code fails with _some_ error.
This is needlessly imprecise, and could in the worst case hide subtle bugs.

The plan is to have specific types (divided into compile-time and runtime
errors), and to expect a specific type of error in the `t.throws` tests.

## Errors with locations

This is part of Hoare's minimum requirements for a language: that the error is
identified _in the source code_, so that the programmer knows where to look in
order to fix the problem. This is probably where we introduce "spans" in the
code, but also spend some time thinking about how to format compiler/runtime
diagnostics to be maximally informative.

## Web IDE

A HTML page, modeled on the TypeScript playground. The important aspects are
being able to edit a program and run it.

As a slight improvement, it would be nice to have syntax highlighting of the
source code. Also, showing compile errors as red squiggly lines under the
identified code.

## Debugging/stepping

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

## Web debugger

Highlight the current statement (or smaller part thereof) that the debugger is
currently paused at.

Allow setting and unsetting breakpoints. (Most likely via the gutter on the
left.)

Provide "step into", "step over", "step out", "continue" buttons in the web UI.

## Show local variables and call stack

There's this idea of a "notional machine", need to look into that. Also SMoL.

Show all the local variables in the _current_ scope, along with a linked list
of all outer scopes.

Also show the call stack, that is, a linked list of all the active calls to
functions.

## Objects and classes

Primarily, support for the `obj.prop` operator, for politely asking `obj` what
`prop` might be like.

Along with that, `class` declarations, and `has` declarations. `@get` and
`@set` annotations. Maybe more than that.

## The `is` operator

When `v is T` returns true, it means that the value `v` is of type `T`. There
is only one shared namespace, so `T` is in some sense (a name bound to) a
value.

## Modules

The addition of `import` declarations and `export`, um, keyword on
declarations. For now, relative paths only and modules being able to import
each other in the same project.

## Compilation to bytecode

The addition of a bytecode for a new VM (with a ROM and a RAM), and the
compilation of the AST to that bytecode.

## Post-AST intermediate representation

A nice in-between form (between AST and bytecode) would be a Mozzarella-like
syntax, but narrowed to serve the more restricted goals of control flow.

Basic blocks as functions-within-functions, control flow as tail calls between
these, registers as a `reg` array. Pizlonator phi-and-upsilon form. Compiler
passes which can efficiently transform this representation.

## Micros

Like macros, but targeting the above post-AST intermediate representation.

## User-defined operators

Prefixes: `op_`; infixes: `_op_`; postfixes: `_op`. Annotations (optional) for
things like precedence and associativity.

## Make parser extensible

The ability to extend terms, statements, declarations, on the parser level.

## Extensible semantics by desugaring

Similar to macros. `unless <cond> { <block> }` desugars to `if !<cond> {
<block> }`. Need a way to declare this in modules which modify their caller
module, so that extended parsers generating new AST types also have a
desugaring for those AST types.

## Extensible semantics by evaluation rule

Supplying a new "case" for new AST types. The `unless` example gets implemented
as a _function_ with access to "internal" runtime things, like the current
environment, and the ability to evaluate subterms.

## Make lexer extensible

So that we can, at the very least, write `0b` and `0x` integer literals.

## Static analyses

Variables shouldn't be used if they were definitely not initialized. We should
have an analysis for that (maybe based on attribute grammars). Variables also
shouldn't be used if they were _not definitely_ initialized &mdash; i.e. maybe
they were, but maybe they were not. Less bad, but still bad.

Also, even without type annotations, we can trace through the programs and
conclude that some operation is trying to `+` together two `Bool` values or
whatever, so that the program will definitely fail. There are many other
examples like that, where we can statically catch a thing that will definitely
fail at runtime.

## Optional type checking

Add (optional) _type annotations_ on variable declarations, parameters,
function return types. Also add the `as` operator.

