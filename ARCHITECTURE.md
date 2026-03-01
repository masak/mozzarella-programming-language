# Architecture

```
+-------+-------+----------+--------+     +-----------+
|  lex  | parse | validate | expand | ... |  evaluate |
+-------+-------+----------+--------+     +-----------+
|     C   O   M   P   I   L   E     |     |  R  U  N  |
+-----------------------------------+-----+-----------+
|                        G   O                        |
+-----------------------------------------------------+
```

## Compiler

* The _lexer_ takes a source string and (lazily) produces a sequence of tokens
    * It depends on `tokens.ts`, which declares all the token types
* The _parser_ takes a sequence of tokens and produces a syntax tree
    * It depends on `syntax.ts`, which declares all the syntax node types
* The _validator_ scans the syntax tree for a small number of static patterns
  that we can't allow to proceed to runtime. (Currently, we catch references to
  a variable before its declaration in a scope, as well as redeclarations.)
* The _expander_ scans the syntax tree for macro calls, calls the corresponding
  macro, and replaces the call with whatever code the macro returns.
    * It depends on `reify.ts`, which can turn the implementation's syntax
      trees into Mozzarella values, and `absorb.ts`, which transforms
      Mozzarella values into the implementation's syntax trees

```
                             reify
 tokens  syntax              absorb
+-------+-------+----------+--------+
|  lex  | parse | validate | expand |
+-------+-------+----------+--------+
|     C   O   M   P   I   L   E     |
+-----------------------------------+
```

## Runtime

* The runtime, implemented in `evaluate.ts`, takes a (validated) syntax tree
  and executes it. It has the following helper dependencies:
    * `boolify.ts` determines how to convert any value to a boolean value
    * `compare.ts` handles comparison of values, as used by comparison ops
    * `display.ts` converts a value to a string for a REPL
    * `env.ts` declares environments (name/value bindings for variables)
    * `location.ts` handles locations (targets of assignments)
    * `stringify.ts` can convert any value to a Mozzarella string value

```
                                           stringify
                                           location
                                           env
                                           display
                                           compare
                                           boolify
                                          +-----------+
                                          |  evaluate |
                                          +-----------+
                                          |  R  U  N  |
                                          +-----------+
```

