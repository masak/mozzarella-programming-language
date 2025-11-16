import {
    displayValue,
} from "./display";
import {
    E000_InternalError,
} from "./error";
import {
    ArrayValue,
    BoolValue,
    FuncValue,
    IntValue,
    MacroValue,
    NoneValue,
    StrValue,
    SyntaxNodeValue,
    Value,
} from "./value";

export function stringify(value: Value): StrValue {
    if (value instanceof IntValue) {
        return new StrValue(String(value.payload));
    }
    else if (value instanceof StrValue) {
        return new StrValue(value.payload);
    }
    else if (value instanceof BoolValue) {
        return new StrValue(value.payload ? "true" : "false");
    }
    else if (value instanceof NoneValue) {
        return new StrValue("none");
    }
    else if (value instanceof ArrayValue) {
        let seen = new Set([value]);
        let elements = value.elements.map(
            (v) => displayValue(v, seen)
        ).join(", ");
        return new StrValue(["[", elements, "]"].join(""));
    }
    else if (value instanceof FuncValue
                || value instanceof MacroValue
                || value instanceof SyntaxNodeValue) {
        let s = displayValue(value, new Set());
        return new StrValue(s);
    }
    else {
        throw new E000_InternalError("Unknown value type in stringify");
    }
}

