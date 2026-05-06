import {
    prefixOpExprOperand,
} from "../compiler/syntax";
import {
    boolify,
} from "./boolify";
import {
    E000_InternalError,
    E603_TypeError,
} from "./error";
import {
    Frame,
    Mode,
    recurse,
} from "./frame";
import {
    stringify,
} from "./stringify";
import {
    BoolValue,
    IntValue,
    NoneValue,
    Value,
} from "./value";

type Handler = (frame: Frame) => Frame | Value;
export let prefixOpMap = new Map<string, Handler>();

prefixOpMap.set("+", (frame) => {
    switch (frame.state) {
        case 0: {
            let operand = prefixOpExprOperand(frame.node);
            return recurse(frame, 1, { node: operand });
        }
        case 1: {
            let value = frame.value;
            if (!(value instanceof IntValue)) {
                throw new E603_TypeError("Expected Int as operand of +");
            }
            return frame.mode === Mode.Ignore
                ? new NoneValue()
                : new IntValue(value.payload);
        }
    }
    throw new E000_InternalError("Unreachable state");
});

prefixOpMap.set("-", (frame) => {
    switch (frame.state) {
        case 0: {
            let operand = prefixOpExprOperand(frame.node);
            return recurse(frame, 1, { node: operand });
        }
        case 1: {
            let value = frame.value;
            if (!(value instanceof IntValue)) {
                throw new E603_TypeError("Expected Int as operand of -");
            }
            return frame.mode === Mode.Ignore
                ? new NoneValue()
                : new IntValue(-value.payload);
        }
    }
    throw new E000_InternalError("Unreachable state");
});

prefixOpMap.set("~", (frame) => {
    switch (frame.state) {
        case 0: {
            let operand = prefixOpExprOperand(frame.node);
            return recurse(frame, 1, { node: operand });
        }
        case 1: {
            let value = frame.value;
            return frame.mode === Mode.Ignore
                ? new NoneValue()
                : stringify(value);
        }
    }
    throw new E000_InternalError("Unreachable state");
});

prefixOpMap.set("?", (frame) => {
    switch (frame.state) {
        case 0: {
            let operand = prefixOpExprOperand(frame.node);
            return recurse(frame, 1, { node: operand });
        }
        case 1: {
            let value = frame.value;
            return frame.mode === Mode.Ignore
                ? new NoneValue()
                : new BoolValue(boolify(value));
        }
    }
    throw new E000_InternalError("Unreachable state");
});

prefixOpMap.set("!", (frame) => {
    switch (frame.state) {
        case 0: {
            let operand = prefixOpExprOperand(frame.node);
            return recurse(frame, 1, { node: operand });
        }
        case 1: {
            let value = frame.value;
            return frame.mode === Mode.Ignore
                ? new NoneValue()
                : new BoolValue(!boolify(value));
        }
    }
    throw new E000_InternalError("Unreachable state");
});

