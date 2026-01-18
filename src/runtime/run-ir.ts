import {
    IrCompUnit,
    IrInstrGetFalse,
    IrInstrGetInt,
    IrInstrGetStr,
    IrInstrGetTrue,
} from "../compiler/ir";
import {
    E000_InternalError,
} from "./error";
import {
    BoolValue,
    Value,
} from "./value";

export function runIr(irCompUnit: IrCompUnit): Value {
    let initFunc = irCompUnit.funcs[0];
    if (initFunc === undefined) {
        throw new E000_InternalError("No init func");
    }

    let block = initFunc.blocks[0];
    if (block === undefined) {
        throw new E000_InternalError("No basic block");
    }

    let instrs = block.instrs;
    let registers: Array<Value> = Array.from({ length: instrs.length });
    for (let [index, instr] of instrs.entries()) {
        if (instr instanceof IrInstrGetInt) {
            registers[index] = instr.value;
        }
        else if (instr instanceof IrInstrGetStr) {
            registers[index] = instr.value;
        }
        else if (instr instanceof IrInstrGetFalse) {
            registers[index] = new BoolValue(false);
        }
        else if (instr instanceof IrInstrGetTrue) {
            registers[index] = new BoolValue(true);
        }
        else {
            throw new E000_InternalError(
                `Unrecognized instruction ${instr.constructor.name}`
            );
        }
    }

    let lastValue = registers[registers.length - 1];
    if (lastValue === undefined) {
        throw new E000_InternalError("No last value set");
    }
    return lastValue;
}

