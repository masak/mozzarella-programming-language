export abstract class Value {
}

export class IntValue {
    payload: bigint;

    constructor(payload: bigint) {
        this.payload = payload;
    }
}

export class StrValue {
    payload: string;

    constructor(payload: string) {
        this.payload = payload;
    }
}

export class BoolValue {
    payload: boolean;

    constructor(payload: boolean) {
        this.payload = payload;
    }
}

export class NoneValue {
}

export class ArrayValue {
    elements: Array<Value>;

    constructor(elements: Array<Value>) {
        this.elements = elements;
    }
}

export class FuncValue {
    name: string;

    constructor(name: string) {
        this.name = name;
    }
}

export class UninitValue {
}

