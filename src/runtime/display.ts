import {
    ArrayValue,
    BoolValue,
    FuncValue,
    IntValue,
    NoneValue,
    StrValue,
    UninitValue,
    Value,
} from "./value";

function escapeString(input: string): string {
    let result: Array<string> = [];
    for (let char of input.split("")) {
        if (char === "\n") {
            result.push("\\n");
        }
        else if (char === "\r") {
            result.push("\\r");
        }
        else if (char === "\t") {
            result.push("\\t");
        }
        else if (char === '"') {
            result.push('\\"');
        }
        else if (char === "\\") {
            result.push("\\\\");
        }
        else {
            result.push(char);
        }
    }
    return result.join("");
}

export function displayValue(value: Value, seen: Set<Value>): string {
    if (value instanceof IntValue) {
        return String(value.payload);
    }
    else if (value instanceof StrValue) {
        return ['"', escapeString(value.payload), '"'].join("");
    }
    else if (value instanceof BoolValue) {
        return value.payload ? "true" : "false";
    }
    else if (value instanceof NoneValue) {
        return "none";
    }
    else if (value instanceof ArrayValue) {
        if (seen.has(value)) {
            return "[...]";
        }
        else {
            seen.add(value);
            let elements = value.elements.map(
                (v) => displayValue(v, seen)
            ).join(", ");
            seen.delete(value);
            return ["[", elements, "]"].join("");
        }
    }
    else if (value instanceof FuncValue) {
        return ["<func ", value.name, "()>"].join("");
    }
    else if (value instanceof UninitValue) {
        throw new Error("Precondition failed: uninitialized pseudo-value");
    }
    else {
        throw new Error(`Unknown value type '${value.constructor.name}'`);
    }
}

