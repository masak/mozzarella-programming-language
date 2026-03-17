import {
    bindMutable,
    Env,
} from "./env";
import {
    E000_InternalError,
    E604_IndexError,
} from "./error";
import {
    ArrayValue,
    Value,
} from "./value";

export abstract class Cell {
}

export class VarCell extends Cell {
    varEnv: Env;
    name: string;

    constructor(varEnv: Env, name: string) {
        super();
        this.varEnv = varEnv;
        this.name = name;
    }
}

export class ArrayElementCell extends Cell {
    array: ArrayValue;
    index: number;

    constructor(array: ArrayValue, index: number) {
        super();
        this.array = array;
        this.index = index;
    }
}

export function assign(cell: Cell, value: Value): void {
    if (cell instanceof VarCell) {
        bindMutable(cell.varEnv, cell.name, value);
    }
    else if (cell instanceof ArrayElementCell) {
        let array = cell.array;
        let index = cell.index;
        if (index < 0 || index >= array.elements.length) {
            throw new E604_IndexError("Index out of bounds");
        }
        array.elements[index] = value;
    }
    else {
        throw new E000_InternalError(
            "Precondition failed: unrecognized Cell"
        );
    }
}

