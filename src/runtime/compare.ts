import {
    Token,
    TokenKind,
} from "../compiler/token";
import {
    E000_InternalError,
    E603_TypeError,
} from "./error";
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

export function isLessThan(left: Value, right: Value): boolean {
    let comparable = isComparable(left) && isComparable(right);
    let sameType = left.constructor === right.constructor;
    if (!(comparable && sameType)) {
        throw new E603_TypeError(
            `Cannot compare ${left.constructor.name} ` +
                `and ${right.constructor.name}`
        );
    }

    if (left instanceof IntValue) {
        if (!(right instanceof IntValue)) {
            throw new E000_InternalError("Precondition failed: not an Int");
        }
        return left.payload < right.payload;
    }
    else if (left instanceof StrValue) {
        if (!(right instanceof StrValue)) {
            throw new E000_InternalError("Precondition failed: not a Str");
        }
        return left.payload < right.payload;
    }
    else if (left instanceof ArrayValue) {
        if (!(right instanceof ArrayValue)) {
            throw new E000_InternalError("Precondition failed: not an Array");
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
        throw new E000_InternalError(
            "Precondition failed: unrecognized comparable type"
        );
    }
}

export function areEqual(left: Value, right: Value): boolean {
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
        throw new E000_InternalError(
            "Precondition failed: lists are of unequal length"
        );
    }
    for (let i = 0; i < xs.length; i++) {
        if (!fn(xs[i], ys[i])) {
            return false;
        }
    }
    return true;
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
        throw new E000_InternalError(
            `Unrecognized comparison token kind ${op.kind.kind}`
        );
    }
}

