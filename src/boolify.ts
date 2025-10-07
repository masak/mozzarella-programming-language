import {
    ArrayValue,
    BoolValue,
    IntValue,
    NoneValue,
    StrValue,
    Value,
} from "./value";

export function boolify(value: Value): boolean {
    if (value instanceof IntValue) {
        return value.payload !== 0n;
    }
    else if (value instanceof StrValue) {
        return value.payload !== "";
    }
    else if (value instanceof BoolValue) {
        return value.payload;
    }
    else if (value instanceof NoneValue) {
        return false;
    }
    else if (value instanceof ArrayValue) {
        return value.elements.length !== 0;
    }
    else { // generic fallback
        return true;
    }
}

