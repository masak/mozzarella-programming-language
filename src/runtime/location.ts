import {
    bindMutable,
    Env,
} from "./env";
import {
    ArrayValue,
    Value,
} from "./value";

export abstract class Location {
}

export class VarLocation extends Location {
    varEnv: Env;
    name: string;

    constructor(varEnv: Env, name: string) {
        super();
        this.varEnv = varEnv;
        this.name = name;
    }
}

export class ArrayElementLocation extends Location {
    array: ArrayValue;
    index: number;

    constructor(array: ArrayValue, index: number) {
        super();
        this.array = array;
        this.index = index;
    }
}

export function assign(location: Location, value: Value): void {
    if (location instanceof VarLocation) {
        bindMutable(location.varEnv, location.name, value);
    }
    else if (location instanceof ArrayElementLocation) {
        let array = location.array;
        let index = location.index;
        if (index < 0 || index >= array.elements.length) {
            throw new Error("Index out of bounds");
        }
        array.elements[index] = value;
    }
    else {
        throw new Error("Precondition failed: unrecognized Location");
    }
}

