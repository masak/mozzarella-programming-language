import {
    infixOpExprLhs,
    infixOpExprRhs,
} from "../compiler/syntax";
import {
    boolify,
} from "./boolify";
import {
    assign,
    Cell,
} from "./cell";
import {
    checkForUnchainableOps,
    evaluateComparison,
    findAllChainedOps,
} from "./compare";
import {
    E000_InternalError,
    E601_ZeroDivisionError,
    E603_TypeError,
} from "./error";
import {
    assertNotAssignable,
    Frame,
    Mode,
    recurse,
    tailRecurse,
} from "./frame";
import {
    stringify,
} from "./stringify";
import {
    BoolValue,
    IntValue,
    NoneValue,
    StrValue,
    Value,
} from "./value";

type Handler = (frame: Frame) => Frame | Value | Cell;
export let infixOpMap = new Map<string, Handler>();

infixOpMap.set("+", (frame) => {
    assertNotAssignable(frame);
    switch (frame.state) {
        case 0: {
            let lhs = infixOpExprLhs(frame.node);
            return recurse(frame, 1, { node: lhs });
        }
        case 1: {
            let left = frame.value;
            if (!(left instanceof IntValue)) {
                throw new E603_TypeError("Expected Int as lhs of +");
            }
            frame.v1 = left;
            let rhs = infixOpExprRhs(frame.node);
            return recurse(frame, 2, { node: rhs });
        }
        case 2: {
            let left = frame.v1 as IntValue;
            let right = frame.value;
            if (!(right instanceof IntValue)) {
                throw new E603_TypeError("Expected Int as rhs of +");
            }
            return frame.mode === Mode.Ignore
                ? new NoneValue()
                : new IntValue(left.payload + right.payload);
        }
    }
    throw new E000_InternalError("Unreachable state");
});

infixOpMap.set("-", (frame) => {
    assertNotAssignable(frame);
    switch (frame.state) {
        case 0: {
            let lhs = infixOpExprLhs(frame.node);
            return recurse(frame, 1, { node: lhs });
        }
        case 1: {
            let left = frame.value;
            if (!(left instanceof IntValue)) {
                throw new E603_TypeError("Expected Int as lhs of +");
            }
            frame.v1 = left;
            let rhs = infixOpExprRhs(frame.node);
            return recurse(frame, 2, { node: rhs });
        }
        case 2: {
            let left = frame.v1 as IntValue;
            let right = frame.value;
            if (!(right instanceof IntValue)) {
                throw new E603_TypeError("Expected Int as rhs of +");
            }
            return frame.mode === Mode.Ignore
                ? new NoneValue()
                : new IntValue(left.payload - right.payload);
        }
    }
    throw new E000_InternalError("Unreachable state");
});

infixOpMap.set("*", (frame) => {
    assertNotAssignable(frame);
    switch (frame.state) {
        case 0: {
            let lhs = infixOpExprLhs(frame.node);
            return recurse(frame, 1, { node: lhs });
        }
        case 1: {
            let left = frame.value;
            if (!(left instanceof IntValue)) {
                throw new E603_TypeError("Expected Int as lhs of +");
            }
            frame.v1 = left;
            let rhs = infixOpExprRhs(frame.node);
            return recurse(frame, 2, { node: rhs });
        }
        case 2: {
            let left = frame.v1 as IntValue;
            let right = frame.value;
            if (!(right instanceof IntValue)) {
                throw new E603_TypeError("Expected Int as rhs of +");
            }
            return frame.mode === Mode.Ignore
                ? new NoneValue()
                : new IntValue(left.payload * right.payload);
        }
    }
    throw new E000_InternalError("Unreachable state");
});

infixOpMap.set("//", (frame) => {
    assertNotAssignable(frame);
    switch (frame.state) {
        case 0: {
            let lhs = infixOpExprLhs(frame.node);
            return recurse(frame, 1, { node: lhs });
        }
        case 1: {
            let left = frame.value;
            if (!(left instanceof IntValue)) {
                throw new E603_TypeError("Expected Int as lhs of +");
            }
            frame.v1 = left;
            let rhs = infixOpExprRhs(frame.node);
            return recurse(frame, 2, { node: rhs });
        }
        case 2: {
            let left = frame.v1 as IntValue;
            let right = frame.value;
            if (!(right instanceof IntValue)) {
                throw new E603_TypeError("Expected Int as rhs of //");
            }
            if (right.payload === 0n) {
                throw new E601_ZeroDivisionError("Division by 0");
            }
            let negative = left.payload < 0n !== right.payload < 0n;
            let nonZeroMod = left.payload % right.payload !== 0n;
            let diff = negative && nonZeroMod ? 1n : 0n;
            return frame.mode === Mode.Ignore
                ? new NoneValue()
                : new IntValue(left.payload / right.payload - diff);
        }
    }
    throw new E000_InternalError("Unreachable state");
});

infixOpMap.set("%", (frame) => {
    assertNotAssignable(frame);
    switch (frame.state) {
        case 0: {
            let lhs = infixOpExprLhs(frame.node);
            return recurse(frame, 1, { node: lhs });
        }
        case 1: {
            let left = frame.value;
            if (!(left instanceof IntValue)) {
                throw new E603_TypeError("Expected Int as lhs of +");
            }
            frame.v1 = left;
            let rhs = infixOpExprRhs(frame.node);
            return recurse(frame, 2, { node: rhs });
        }
        case 2: {
            let left = frame.v1 as IntValue;
            let right = frame.value;
            if (!(right instanceof IntValue)) {
                throw new E603_TypeError("Expected Int as rhs of %");
            }
            if (right.payload === 0n) {
                throw new E601_ZeroDivisionError("Division by 0");
            }
            return frame.mode === Mode.Ignore
                ? new NoneValue()
                : new IntValue(left.payload % right.payload);
        }
    }
    throw new E000_InternalError("Unreachable state");
});

infixOpMap.set("~", (frame) => {
    assertNotAssignable(frame);
    switch (frame.state) {
        case 0: {
            let lhs = infixOpExprLhs(frame.node);
            return recurse(frame, 1, { node: lhs });
        }
        case 1: {
            let left = frame.value;
            let strLeft = stringify(left);
            frame.v1 = strLeft;
            let rhs = infixOpExprRhs(frame.node);
            return recurse(frame, 2, { node: rhs });
        }
        case 2: {
            let strLeft = frame.v1 as StrValue;
            let right = frame.value;
            let strRight = stringify(right);
            return frame.mode === Mode.Ignore
                ? new NoneValue()
                : new StrValue(strLeft.payload + strRight.payload);
        }
    }
    throw new E000_InternalError("Unreachable state");
});

infixOpMap.set("&&", (frame) => {
    assertNotAssignable(frame);
    switch (frame.state) {
        case 0: {
            let lhs = infixOpExprLhs(frame.node);
            return recurse(frame, 1, { node: lhs });
        }
        case 1: {
            let left = frame.value;
            let rhs = infixOpExprRhs(frame.node);
            if (boolify(left)) {
                return tailRecurse(frame, { node: rhs });
            }
            else {
                return frame.mode === Mode.Ignore
                    ? new NoneValue()
                    : left;
            }
        }
    }
    throw new E000_InternalError("Unreachable state");
});

infixOpMap.set("||", (frame) => {
    assertNotAssignable(frame);
    switch (frame.state) {
        case 0: {
            let lhs = infixOpExprLhs(frame.node);
            return recurse(frame, 1, { node: lhs });
        }
        case 1: {
            let left = frame.value;
            let rhs = infixOpExprRhs(frame.node);
            if (boolify(left)) {
                return frame.mode === Mode.Ignore
                    ? new NoneValue()
                    : left;
            }
            else {
                return tailRecurse(frame, { node: rhs });
            }
        }
    }
    throw new E000_InternalError("Unreachable state");
});

let comparisonOpHandler: Handler = (frame) => {
    assertNotAssignable(frame);
    switch (frame.state) {
        case 0: {
            let [exprs, ops] = findAllChainedOps(frame.node);
            frame.nn = exprs;
            frame.ss = ops;
            checkForUnchainableOps(ops);
            return recurse(frame, 1, { node: exprs[0] });
        }
        case 1: {
            let prevValue = frame.value;
            frame.v1 = prevValue;
            if (frame.index < frame.nn.length - 1) {
                let next = frame.nn[frame.index + 1];
                return recurse(frame, 2, { node: next });
            }
            else {
                return frame.mode === Mode.Ignore
                    ? new NoneValue()
                    : new BoolValue(true);
            }
        }
        case 2: {
            let nextValue = frame.value;
            let prevValue = frame.v1;
            let op = frame.ss[frame.index];
            if (!evaluateComparison(prevValue, op, nextValue)) {
                return frame.mode === Mode.Ignore
                    ? new NoneValue()
                    : new BoolValue(false);
            }
            frame.v1 = nextValue;
            frame.index++;
            return new Frame(frame, { state: 1 });
        }
    }
    throw new E000_InternalError("Unreachable state");
};

infixOpMap.set("<", comparisonOpHandler);
infixOpMap.set("<=", comparisonOpHandler);
infixOpMap.set(">", comparisonOpHandler);
infixOpMap.set(">=", comparisonOpHandler);
infixOpMap.set("==", comparisonOpHandler);
infixOpMap.set("!=", comparisonOpHandler);

infixOpMap.set("=", (frame) => {
    switch (frame.state) {
        case 0: {
            let lhs = infixOpExprLhs(frame.node);
            return recurse(frame, 1, { node: lhs, mode: Mode.GetCell });
        }
        case 1: {
            let rhs = infixOpExprRhs(frame.node);
            return recurse(frame, 2, { node: rhs });
        }
        case 2: {
            let cell = frame.cell!;
            let value = frame.value;
            assign(cell, value);
            if (frame.mode === Mode.GetValue) {
                return value;
            }
            else if (frame.mode === Mode.GetCell) {
                return cell;
            }
            else {  // Mode.Ignore
                return new NoneValue();
            }
        }
    }
    throw new E000_InternalError("Unreachable state");
});

