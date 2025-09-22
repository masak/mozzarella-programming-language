export abstract class Value {
}

export class IntValue {
    payload: bigint;

    constructor(payload: bigint) {
        this.payload = payload;
    }

    toString(): string {
        return String(this.payload);
    }
}

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

export class StrValue {
    payload: string;

    constructor(payload: string) {
        this.payload = payload;
    }

    toString(): string {
        return ['"', escapeString(this.payload), '"'].join("");
    }
}

export class BoolValue {
    payload: boolean;

    constructor(payload: boolean) {
        this.payload = payload;
    }

    toString(): string {
        return this.payload ? "true" : "false";
    }
}

