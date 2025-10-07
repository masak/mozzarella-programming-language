import {
    Expr,
    InfixOpExpr,
} from "./syntax";
import {
    Token,
    TokenKind,
} from "./token";
import {
    ArrayValue,
    BoolValue,
    IntValue,
    NoneValue,
    StrValue,
    Value,
} from "./value";

function isComparable(value: Value): boolean {
    return value instanceof IntValue ||
        value instanceof StrValue ||
        value instanceof ArrayValue;
}

function isLessThan(left: Value, right: Value): boolean {
    let comparable = isComparable(left) && isComparable(right);
    let sameType = left.constructor === right.constructor;
    if (!(comparable && sameType)) {
        throw new Error(`Cannot compare ${left.constructor.name} ` +
                        `and ${right.constructor.name}`);
    }

    if (left instanceof IntValue) {
        if (!(right instanceof IntValue)) {
            throw new Error("Precondition failed: not an Int");
        }
        return left.payload < right.payload;
    }
    else if (left instanceof StrValue) {
        if (!(right instanceof StrValue)) {
            throw new Error("Precondition failed: not a Str");
        }
        return left.payload < right.payload;
    }
    else if (left instanceof ArrayValue) {
        if (!(right instanceof ArrayValue)) {
            throw new Error("Precondition failed: not an Array");
        }
        for (let i = 0; i < left.elements.length; i++) {
            if (i >= right.elements.length) {   // left array longer
                return false;
            }
            let l = left.elements[i];
            let r = right.elements[i];
            if (isLessThan(l, r)) {
                return true;
            }
            else if (areEqual(l, r)) {
                continue;
            }
            else {  // different types, or l > r
                return false;
            }
        }
        // For the length of the left array, the elements are pairwise equal
        return left.elements.length < right.elements.length;
    }
    else {
        throw new Error("Precondition failed: unrecognized comparable type");
    }
}

function areEqual(left: Value, right: Value): boolean {
    if (left instanceof IntValue) {
        if (!(right instanceof IntValue)) {
            return false;
        }
        return left.payload === right.payload;
    }
    else if (left instanceof StrValue) {
        if (!(right instanceof StrValue)) {
            return false;
        }
        return left.payload === right.payload;
    }
    else if (left instanceof BoolValue) {
        if (!(right instanceof BoolValue)) {
            return false;
        }
        return left.payload === right.payload;
    }
    else if (left instanceof NoneValue) {
        if (!(right instanceof NoneValue)) {
            return false;
        }
        return true;
    }
    else if (left instanceof ArrayValue) {
        if (!(right instanceof ArrayValue)) {
            return false;
        }
        return left.elements.length === right.elements.length &&
            pairwise(areEqual, left.elements, right.elements);
    }
    else {
        // Generic fallback: reference equality
        return left === right;
    }
}

function pairwise<T>(fn: (x: T, y: T) => boolean, xs: Array<T>, ys: Array<T>) {
    if (xs.length !== ys.length) {
        throw new Error("Precondition failed: lists are of unequal length");
    }
    for (let i = 0; i < xs.length; i++) {
        if (!fn(xs[i], ys[i])) {
            return false;
        }
    }
    return true;
}

export const comparisonOps = new Set([
    TokenKind.Less,
    TokenKind.LessEq,
    TokenKind.Greater,
    TokenKind.GreaterEq,
    TokenKind.EqEq,
    TokenKind.BangEq,
]);

// Traverses down the left leg of an expression tree, collecting all comparison
// operators and their operands, in left-to-right (top-to-bottom) order.
export function findAllChainedOps(root: Expr): [Array<Expr>, Array<Token>] {
    if (!(root instanceof InfixOpExpr)
        || !comparisonOps.has((root.children[1] as Token).kind)) {
        throw new Error("Precondition failed: root must be comparison expr");
    }
    let stack: Array<InfixOpExpr> = [root];
    while (true) {
        let lhs = stack[stack.length - 1].children[0];
        if (lhs instanceof InfixOpExpr
            && comparisonOps.has((lhs.children[1] as Token).kind)) {
            stack.push(lhs);
        }
        else {
            break;
        }
    }
    let firstLhs: Expr = stack[stack.length - 1].children[0] as Expr;
    let exprs: Array<Expr> = [firstLhs];
    let ops: Array<Token> = [];
    while (stack.length > 0) {
        let expr = stack.pop()!;
        let op = expr.children[1] as Token;
        ops.push(op);
        let rhs = expr.children[2] as Expr;
        exprs.push(rhs);
    }
    return [exprs, ops];
}

// Upholds the following rules:
//
// - The != operator doesn't chain with anything (even itself)
// - The (< <= ==) operators go together, as do the (> >= ==) operators, but
//   any other combination of comparison operators is disallowed
export function checkForUnchainableOps(ops: Array<Token>) {
    let hasNotEq = ops.some((op) => op.kind === TokenKind.BangEq);
    if (hasNotEq && ops.length > 1) {
        let notEqOpIndex = ops.findIndex((op) => op.kind === TokenKind.BangEq);
        let otherOp = notEqOpIndex < ops.length
            ? ops[notEqOpIndex + 1]
            : ops[notEqOpIndex - 1];
        throw new Error(`Cannot chain != and ${otherOp.kind.kind}`);
    }

    let hasLessTypeOps = ops.some(
        (op) => op.kind === TokenKind.Less || op.kind === TokenKind.LessEq
    );
    let hasGreaterTypeOps = ops.some(
        (op) => op.kind === TokenKind.Greater
            || op.kind === TokenKind.GreaterEq
    );
    if (hasLessTypeOps && hasGreaterTypeOps) {
        let lessTypeOp = ops.find(
            (op) => op.kind === TokenKind.Less || op.kind === TokenKind.LessEq
        )!;
        let greaterTypeOp = ops.find(
            (op) => op.kind === TokenKind.Greater
                || op.kind === TokenKind.GreaterEq
        )!;
        throw new Error(`Cannot chain ${lessTypeOp.kind.kind} ` +
                        `and ${greaterTypeOp.kind.kind}`);
    }
}

export function evaluateComparison(
    left: Value,
    op: Token,
    right: Value,
): boolean {
    if (op.kind === TokenKind.Less) {
        return isLessThan(left, right);
    }
    else if (op.kind === TokenKind.LessEq) {
        return isLessThan(left, right) || areEqual(left, right);
    }
    else if (op.kind === TokenKind.Greater) {
        return isLessThan(right, left);
    }
    else if (op.kind === TokenKind.GreaterEq) {
        return isLessThan(right, left) || areEqual(left, right);
    }
    else if (op.kind === TokenKind.EqEq) {
        return areEqual(left, right);
    }
    else if (op.kind === TokenKind.BangEq) {
        return !areEqual(left, right);
    }
    else {
        throw new Error(`Unrecognized comparison token kind ${op.kind.kind}`);
    }
}

