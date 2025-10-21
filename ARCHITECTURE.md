# Architecture

Currently, the whole implementation has two parts:

* The _compiler_ takes a source string and produces a syntax tree
* The _runtime_ takes a syntax tree and executes it as a program

All this is pulled together in `run.ts`, which invokes first the compiler and
then the runtime.

```
+----------+    +---------+
| compiler |    | runtime |
+----------+    +---------+
      ^              ^
      |              |
+-------------------------+
|          run.ts         |
+-------------------------+
```

## Compiler

* The _lexer_ takes a source string and (lazily) produces a sequence of tokens
    * It depends on `tokens.ts`, which declares all the token types
* The _parser_ takes a sequence of tokens and produces a syntax tree
    * It depends on `syntax.ts`, which declares all the syntax node types
* The _validator_ scans the syntax tree for a small number of static patterns
  that we can't allow to proceed to runtime. (Currently, that only involves
  referencing a variable before it's declared in a scope.)

```
+----------+  +-----------+
| token.ts |  | syntax.ts |
+----------+  +-----------+
     ^              ^
     |              |
 +--------+    +----------+    +-------------+
 | lex.ts |    | parse.ts |    | validate.ts |
 +--------+    +----------+    +-------------+
     ^              ^                 ^
     |              |                 |
+--------------------------------------------+
|                compiler                    |
+--------------------------------------------+
```

## Runtime

* The runtime, implemented in `evaluate.ts`, takes a (validated) syntax tree
  and executes it. It has the following helper dependencies:
    * `boolify.ts` determines how to convert any value to a boolean value
    * `compare.ts` handles comparison of values, as used by comparison ops
    * `display.ts` converts values to string in order to show them in a REPL
    * `env.ts` declares environments (name/value bindings for variables)
    * `location.ts` handles locations (used for assignments)
    * `stringify.ts` determines how to convert any value to a string value

All of these also depend on `value.ts`, which declares all the built-in value
types.

```
              +----------+
              | value.ts |
              +----------+
                    ^
                    |
+------------+ +------------+ +------------+
| boolify.ts | | compare.ts | | display.ts |
+------------+ +------------+ +------------+
       ^            ^               ^
 +--------+ +-------------+ +--------------+
 | env.ts | | location.ts | | stringify.ts |
 +--------+ +-------------+ +--------------+
      ^|           ^|              ^|
      ||           ||              ||
+--------------------------------------------+
|               evaluate.ts                  |
+--------------------------------------------+
                     ^
                     |
+--------------------------------------------+
|                 runtime                    |
+--------------------------------------------+
```

