import {
    displayValue,
} from "./display";
import {
    ArrayValue,
    BoolValue,
    IntValue,
    NoneValue,
    StrValue,
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
    else { // generic fallback
        let typeName = value.constructor.name;
        if (!/Value$/.test(typeName)) {
            throw new Error("Type name doesn't end in 'Value'");
        }
        let shortTypeName = typeName.replace(/Value$/, "");
        return new StrValue("<" + shortTypeName + ">");
    }
}

