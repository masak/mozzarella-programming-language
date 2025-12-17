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

## Features

There's a
[spec/](https://github.com/masak/mozzarella-programming-language/tree/main/spec)
directory with individual specification files describing each incremental
feature in fairly-precise human-targeted prose. The specification text in those
files is not meant to be completely formal, but enough for a human implementor
to be able to correctly guess the intended implementation.

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
- [x] [`last` statements](https://github.com/masak/mozzarella-programming-language/blob/main/spec/23-last-stmt.md)
- [x] [`next` statements](https://github.com/masak/mozzarella-programming-language/blob/main/spec/24-next-stmt.md)
- [x] [functions](https://github.com/masak/mozzarella-programming-language/blob/main/spec/25-func-decl.md)
- [x] [calls](https://github.com/masak/mozzarella-programming-language/blob/main/spec/26-call-expr.md)
- [x] [parameters](https://github.com/masak/mozzarella-programming-language/blob/main/spec/27-params.md)
- [x] [`return` statements](https://github.com/masak/mozzarella-programming-language/blob/main/spec/28-return-stmt.md)
- [x] [macros](https://github.com/masak/mozzarella-programming-language/blob/main/spec/29-macro-decl.md)
- [x] [quote expressions](https://github.com/masak/mozzarella-programming-language/blob/main/spec/30-quote-expr.md)
- [x] [quote interpolation](https://github.com/masak/mozzarella-programming-language/blob/main/spec/31-unquote-expr.md)
- [ ] macro hygiene

## Design documents

- [Example](https://github.com/masak/mozzarella-programming-language/blob/main/docs/01-example.md)
- [Code quoting](https://github.com/masak/mozzarella-programming-language/blob/main/docs/02-code-quoting.md)
- [The outer of the injectile](https://github.com/masak/mozzarella-programming-language/blob/main/docs/03-injectile.md)
- [Grammophone grammar](https://github.com/masak/mozzarella-programming-language/blob/main/docs/04-grammar.md)
- [Types](https://github.com/masak/mozzarella-programming-language/blob/main/docs/05-types.md)
- [Syntax node types](https://github.com/masak/mozzarella-programming-language/blob/main/docs/06-syntax.md)
- [Near-future plans](https://github.com/masak/mozzarella-programming-language/blob/main/docs/07-plans.md)

