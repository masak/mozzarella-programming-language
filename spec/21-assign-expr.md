## assignment expression

**Context-free syntax**: `AssignExpr ::= Expr "=" Expr ;`

**Precedence and associativity**: Infix assignment is looser than the loosest
infix so far (`||` disjunctive precedence). Infix assignment associates to the
right.

**Evaluation**:

A `Location` is an abstract type which represents a memory cell with a value
that can potentially be updated. It supports an `assign` operation: to assign
a value to a location is to update the memory cell with the new value.

A `VarLocation` represents the memory cell of a variable. It consists of an
environment and a string name.

To "look up an environment for `<name>` in `env`" means to do the following:

* Forever:
    * If `env` contains a binding from `<name>` to `v`, return `env`.
    * Otherwise, if `env` has an outer environment, set `env` to this
      outer environment and continue to the next iteration.
    * Otherwise, issue a runtime error about an undeclared variable.

To "assign a value `v` to a `VarLocation l`" means to do the following:

* Bind the value `v` to the name `l.name` in `l.varEnv`.

An `ArrayElemLocation` represents the memory cell of an array element. It
consists of an `ArrayValue` and an integer index.

To "assign a value `v` to an `ArrayElemLocation l`" means to do the following:

* Assert that `0 <= l.index` and `l.index < l.array.elements.length`.
* Set the element in `l.array` represented by `l.index` to `v`.

To "evaluate an expression `e` (in an environment) for a location`" means to do
the following:

* If `e` is a `VarRefExpr` for a name `<name>`:
    * Look up an environment for `<name>` in the current environment, resulting
      in environment `env`.
    * Return a `VarLocation` with `env` and `<name>`.
* If `e` is an `IndexingExpr` of the form `e1[e2]`:
    * Evaluate `e1` to `v1`.
    * Assert that `v1` has type `ArrayValue`.
    * Evaluate `e2` to `v2`.
    * Assert that `v2` has type `IntValue`.
    * Return an `ArrayElemLocation` with `v1` and `v2.payload`.
* If `e` is a `ParenExpr` of the form `(e1)`:
    * Evaluate `e1` for location `l1`.
    * Return `l1`.
* If `e` is a `DoExpr` containing a statement `s;`:
    * Execute `s` for location `l`.
    * Return `l`.
* Otherwise, issue a runtime error.

To "execute a statement `s` (in an environment) for a location`" means to do
the following:

* If `s` is an `ExprStatement` with an expression `e`:
    * Evaluate `e` for a location `l`.
    * Return `l`.
* If `s` is a `BlockStatement` with a block with a statement list:
    * Run the block for location `l`, and return `l`.
* If `s` is an `IfStatement`:
    * If it's of the form `if e1 { bl1 } [else if e2 { bl2 } ...]`
        * For each clause in turn, do the following:
            * Evaluate the expression `eK` to `vK`.
            * Boolify `vK` to `bK`.
            * If `bK` is true, run the block for a location `l` and return `l`.
        * Issue a runtime error.
    * `if e1 { bl1 } [else if e2 { bl2 } ...] else { blN }`
        * For each clause in turn, do the following:
            * Evaluate the expression `eK` to `vK`.
            * Boolify `vK` to `bK`.
            * If `bK` is true, run the block for a location `l` and return `l`.
        * Run the block `blN` for a location `l` and return `l`.
* Otherwise, issue a runtime error.

To run a block for a location, means to do the following:

* If the statement list is empty, issue a runtime error.
* Otherwise:
    * For each statement `s` in the block's statement list _except the last_:
        * Execute `s` (discarding the result).
    * Execute the last statement for location `l`.
    * Return `l`.

An `AssignExpr` is evaluated as follows:

* `e1 = e2`
    * Evaluate `e1` (in the current environment) to the location `l1`.
    * Evaluate `e2` (in the current environment) to the value `v2`.
    * Assign `v2` to `l1`.

