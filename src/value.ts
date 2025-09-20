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

