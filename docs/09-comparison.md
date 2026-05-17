# The comparison operators

This document is to explain the change to the layout of the syntax tree for
chained comparison operators. Something like `1 < 2 < 3` used to be represented
by this syntax tree:

```
    <
   / \
  <   3
 / \
1   2
```

Where `<` are `InfixOp` nodes with a `<` opName. The new representation is
this:

```
   C
  / \
 1   L
    / \
   /   \
  E     E
 / \   / \
<   2 <   3
```

Where `C` is a `ChainedOpExpr`, `L` is a `ChainList`, and `E` are
`ChainElement` nodes. `ChainList` and `ChainElement` are new node types, but
they are "just structure" to be able to hold the leaf nodes.

The reason for the change is subtle, and didn't become evident until the
evaluator got rationalized enough. In the old representation, the evaluation of
a comparison operator involves the _structural analysis_ of non-child
descendant nodes. In the new representation, the evaluation of a comparison
operator only involves the evaluation of "direct" child expression nodes...
where "direct" means we consider the `ChainList` and all its descendants to be
direct children.

There is a little bit of extra structure there, but if you squint a bit, the
difference is that (opName, expr) pairs are now "flat" and owned directly by
the `ChainedOpExpr` node. In the old evaluation, there was a "traversal down
the left spine" of the expression tree which is now no longer necessary. The
traversal down the left spine acts as a "last-minute flattening" of the chain
elements; the new representation does the flattening up-front.

The fact that evaluation of the node only requires evaluation of expressions
"directly owned" by the node is desirable, and is related to the Principle of
Compositionality in denotational semantics: an expression node's denotation is
determined only by the expression node's own structure, and the _denotations_
of any direct subexpressions. We're allowed to use neither the structure of
subexpressions, nor the denotations of "indirect" subexpressions.

After some deliberation, an expression like `x < y` (with only one comparison
operator) now counts as an `InfixOpExpr`, not a `ChainedOpExpr`; the latter is
reserved for when there is actual need for the chained operator behavior. This
choice is arbitrary, in the sense that we could have decided to consider
`x < y` a `ChainedOpExpr`, and the evaluation would have worked fine and given
the right result (but not substantially made use of the "chaining" behavior,
since there's only one comparison operator).

There's even a well-defined, reasonable semantics for a `ChainedOpExpr` with
_zero_ comparison operators, like `x`. The evaluation of the `ChainedOpExpr`
would evaluate the `x` expression, discard the result, and return `true`
(because all the comparison operators vacuously succeed).

While `ChainedOpExpr` nodes with zero or one comparison operator will never be
produced by the Mozzarella parser, code generation and metaprogramming can
produce such nodes.

