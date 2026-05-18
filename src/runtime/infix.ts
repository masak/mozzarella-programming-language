import {
    infixOpExprLhs,
    infixOpExprOpName,
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
    evaluateComparison,
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
            frame.datum2 = left;
            let rhs = infixOpExprRhs(frame.node);
            return recurse(frame, 2, { node: rhs });
        }
        case 2: {
            let left = frame.datum2 as IntValue;
            let right = frame.value;
            if (!(right instanceof IntValue)) {
                throw new E603_TypeError("Expected Int as rhs of +");
            }
            return new IntValue(left.payload + right.payload);
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
            frame.datum2 = left;
            let rhs = infixOpExprRhs(frame.node);
            return recurse(frame, 2, { node: rhs });
        }
        case 2: {
            let left = frame.datum2 as IntValue;
            let right = frame.value;
            if (!(right instanceof IntValue)) {
                throw new E603_TypeError("Expected Int as rhs of +");
            }
            return new IntValue(left.payload - right.payload);
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
            frame.datum2 = left;
            let rhs = infixOpExprRhs(frame.node);
            return recurse(frame, 2, { node: rhs });
        }
        case 2: {
            let left = frame.datum2 as IntValue;
            let right = frame.value;
            if (!(right instanceof IntValue)) {
                throw new E603_TypeError("Expected Int as rhs of +");
            }
            return new IntValue(left.payload * right.payload);
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
            frame.datum2 = left;
            let rhs = infixOpExprRhs(frame.node);
            return recurse(frame, 2, { node: rhs });
        }
        case 2: {
            let left = frame.datum2 as IntValue;
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
            return new IntValue(left.payload / right.payload - diff);
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
            frame.datum2 = left;
            let rhs = infixOpExprRhs(frame.node);
            return recurse(frame, 2, { node: rhs });
        }
        case 2: {
            let left = frame.datum2 as IntValue;
            let right = frame.value;
            if (!(right instanceof IntValue)) {
                throw new E603_TypeError("Expected Int as rhs of %");
            }
            if (right.payload === 0n) {
                throw new E601_ZeroDivisionError("Division by 0");
            }
            return new IntValue(left.payload % right.payload);
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
            frame.datum2 = strLeft;
            let rhs = infixOpExprRhs(frame.node);
            return recurse(frame, 2, { node: rhs });
        }
        case 2: {
            let strLeft = frame.datum2 as StrValue;
            let right = frame.value;
            let strRight = stringify(right);
            return new StrValue(strLeft.payload + strRight.payload);
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
                return left;
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
                return left;
            }
            else {
                return tailRecurse(frame, { node: rhs });
            }
        }
    }
    throw new E000_InternalError("Unreachable state");
});

let comparisonOpHandler: Handler = (frame) => {
    // let left = eval(lhs);
    // let right = eval(rhs);
    // let compareResult = evaluateComparison(left, opName, right);
    // return new BoolValue(compareResult);
    assertNotAssignable(frame);
    let opName = infixOpExprOpName(frame.node).payload as string;
    switch (frame.state) {
        case 0: {
            let lhs = infixOpExprLhs(frame.node);
            return recurse(frame, 1, { node: lhs });
        }
        case 1: {
            let left = frame.value;
            frame.datum2 = left;
            let rhs = infixOpExprRhs(frame.node);
            return recurse(frame, 2, { node: rhs });
        }
        case 2: {
            let left = frame.datum2;
            let right = frame.value;
            let compareResult = evaluateComparison(left, opName, right);
            return new BoolValue(compareResult);
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
            if (frame.mode === Mode.GetCell) {
                return cell;
            }
            else {
                return value;
            }
        }
    }
    throw new E000_InternalError("Unreachable state");
});

