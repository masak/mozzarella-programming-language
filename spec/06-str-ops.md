## string operations

**New token**: `Tilde` (`~`).

**Context-free syntax**:

* `ConcatExpr ::= Expr "~" Expr ;`
* `PrefixExpr ::= "~" Expr ;`

**Precedence and associativity**: The new prefix op has the same precedence as
previous prefix ops. The new infix op is looser than the previous loosest
(additive) infix ops.

**Evaluation**:

When "stringifying" a value, the following procedure is used:

* An `IntValue` stringifies to its decimal representation. A negative value
  has a `"-"` prefix; zero and positive values have no prefix.
* A `StrValue` stringifies to itself.
* A `BoolValue` stringifies to `"true"` or `"false"`.
* A `NoneValue` stringifies to `"none"`.
* For any other value type, unless they specify their own stringification, do
  the following:
    * Take the name of the type, and remove the suffix `"Value"`.
        * Fail with an error if there is no suffix `"Value"`.
    * Return the string `"<"`, concatenated with the shortened type name,
      concatenated with `">"`.

* `e1 ~ e2`:
    * Evaluate `e1` to `v1`.
    * Stringify `v1` to `s1`.
    * Evaluate `e2` to `v2`.
    * Stringify `v2` to `s2`.
    * Return a `StrValue` with payload `s1.payload` concatenated with
      `s2.payload`.
* `~e`:
    * Evaluate `e` to `v`.
    * Stringify `v` to `s`.
    * Return a `StrValue` with payload `s.payload`.

