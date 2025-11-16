import {
    Block,
} from "../compiler/syntax";
import {
    Env,
} from "./env";

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
    outerEnv: Env;
    parameters: Array<string>;
    body: Block;

    constructor(
        name: string,
        outerEnv: Env,
        parameters: Array<string>,
        body: Block,
    ) {
        this.name = name;
        this.outerEnv = outerEnv;
        this.parameters = parameters;
        this.body = body;
    }
}

export class MacroValue {
    name: string;
    outerEnv: Env;
    parameters: Array<string>;
    body: Block;

    constructor(
        name: string,
        outerEnv: Env,
        parameters: Array<string>,
        body: Block,
    ) {
        this.name = name;
        this.outerEnv = outerEnv;
        this.parameters = parameters;
        this.body = body;
    }
}

export class SyntaxNodeValue {
    kind: IntValue;
    children: Array<SyntaxNodeValue | NoneValue>;
    payload: IntValue | StrValue | BoolValue | NoneValue;

    constructor(
        kind: IntValue,
        children: Array<SyntaxNodeValue | NoneValue>,
        payload: IntValue | StrValue | BoolValue | NoneValue,
    ) {
        this.kind = kind;
        this.children = children;
        this.payload = payload;
    }
}

export class UninitValue {
}

