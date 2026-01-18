import {
    IrCompUnit,
    IrInstr,
    IrInstrAddInts,
    IrInstrFloorDivInts,
    IrInstrGetFalse,
    IrInstrGetInt,
    IrInstrGetNone,
    IrInstrGetStr,
    IrInstrGetTrue,
    IrInstrModInts,
    IrInstrMulInts,
    IrInstrNegInt,
    IrInstrPosInt,
    IrInstrSubInts,
} from "../compiler/ir";
import {
    E000_InternalError,
    E601_ZeroDivisionError,
    E603_TypeError,
} from "./error";
import {
    BoolValue,
    IntValue,
    NoneValue,
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

    function computedValueOf(instr: IrInstr): Value {
        let index = instrs.indexOf(instr);
        if (index === -1) {
            throw new E000_InternalError("Instruction not found");
        }
        let value = registers[index];
        if (value === undefined) {
            throw new E000_InternalError("Uninitialized value");
        }
        return value;
    }

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
        else if (instr instanceof IrInstrGetNone) {
            registers[index] = new NoneValue();
        }
        else if (instr instanceof IrInstrAddInts) {
            let left = computedValueOf(instr.leftInstr);
            if (!(left instanceof IntValue)) {
                throw new E603_TypeError("Expected Int as lhs of +");
            }
            let right = computedValueOf(instr.rightInstr);
            if (!(right instanceof IntValue)) {
                throw new E603_TypeError("Expected Int as rhs of +");
            }
            registers[index] = new IntValue(left.payload + right.payload);
        }
        else if (instr instanceof IrInstrPosInt) {
            let operandValue = computedValueOf(instr.instr);
            if (!(operandValue instanceof IntValue)) {
                throw new E603_TypeError("Expected Int as operand of +");
            }
            registers[index] = new IntValue(operandValue.payload);
        }
        else if (instr instanceof IrInstrSubInts) {
            let left = computedValueOf(instr.leftInstr);
            if (!(left instanceof IntValue)) {
                throw new E603_TypeError("Expected Int as lhs of -");
            }
            let right = computedValueOf(instr.rightInstr);
            if (!(right instanceof IntValue)) {
                throw new E603_TypeError("Expected Int as rhs of -");
            }
            registers[index] = new IntValue(left.payload - right.payload);
        }
        else if (instr instanceof IrInstrNegInt) {
            let operandValue = computedValueOf(instr.instr);
            if (!(operandValue instanceof IntValue)) {
                throw new E603_TypeError("Expected Int as operand of -");
            }
            registers[index] = new IntValue(-operandValue.payload);
        }
        else if (instr instanceof IrInstrMulInts) {
            let left = computedValueOf(instr.leftInstr);
            if (!(left instanceof IntValue)) {
                throw new E603_TypeError("Expected Int as lhs of *");
            }
            let right = computedValueOf(instr.rightInstr);
            if (!(right instanceof IntValue)) {
                throw new E603_TypeError("Expected Int as rhs of *");
            }
            registers[index] = new IntValue(left.payload * right.payload);
        }
        else if (instr instanceof IrInstrFloorDivInts) {
            let left = computedValueOf(instr.leftInstr);
            if (!(left instanceof IntValue)) {
                throw new E603_TypeError("Expected Int as lhs of //");
            }
            let right = computedValueOf(instr.rightInstr);
            if (!(right instanceof IntValue)) {
                throw new E603_TypeError("Expected Int as rhs of //");
            }
            if (right.payload === 0n) {
                throw new E601_ZeroDivisionError("Division by 0");
            }
            let negative = left.payload < 0n !== right.payload < 0n;
            let nonZeroMod = left.payload % right.payload !== 0n;
            let diff = negative && nonZeroMod ? 1n : 0n;
            registers[index]
                = new IntValue(left.payload / right.payload - diff);
        }
        else if (instr instanceof IrInstrModInts) {
            let left = computedValueOf(instr.leftInstr);
            if (!(left instanceof IntValue)) {
                throw new E603_TypeError("Expected Int as lhs of %");
            }
            let right = computedValueOf(instr.rightInstr);
            if (!(right instanceof IntValue)) {
                throw new E603_TypeError("Expected Int as rhs of %");
            }
            if (right.payload === 0n) {
                throw new E601_ZeroDivisionError("Division by 0");
            }
            registers[index] = new IntValue(left.payload % right.payload);
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

