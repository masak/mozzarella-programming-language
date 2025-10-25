# The outer of the injectile

Consider this example:

```
macro dubious(x) {
    code`
        print(x)
    `;
}
```

This example will fail with a certainty, because the `x` in `print(x)` is
unbound, and at the time it's incorporated in place of the macro call, this
will be discovered. Note that the presence of the `x` parameter to the macro
does not change the situation.

However, the `print` in the code quote should be fine, and so the outer
scope of the code that gets inserted cannot just be the empty scope.

In light of this, we decide the following:

> The outer scope of the injectile is the "standard scope" (containing
> readonly bindings to builtins like `print`).

It does mean the following:

* If `print` was redefined/shadowed in the environment of the macro, this
  redefinition will not be seen/used by the expanded code.
* It is not possible to read/write a global variable that's in the macro's
  module (whether or not this module is the same as the macro call).

These restrictions are known, and the decision is nevertheless made as
above.

The restrictions also eliminate the possibility of "Type II accidental
capture", which is when surrounding context at the caller influences
the meaning of names in the injectile in ways that the macro author
never intended. But since the surrounding context at the caller cannot
influence the injectile at all, this kind of accidental capture can never
happen.

