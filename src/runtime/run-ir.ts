import {
    IrBranchJump,
    IrCompUnit,
    IrDirectJump,
    IrInstr,
    IrInstrAddInts,
    IrInstrConcat,
    IrInstrEq,
    IrInstrFloorDivInts,
    IrInstrGetFalse,
    IrInstrGetInt,
    IrInstrGetNone,
    IrInstrGetStr,
    IrInstrGetTrue,
    IrInstrGreater,
    IrInstrGreaterEq,
    IrInstrLess,
    IrInstrLessEq,
    IrInstrModInts,
    IrInstrMulInts,
    IrInstrNegInt,
    IrInstrNotEq,
    IrInstrPhi,
    IrInstrPosInt,
    IrInstrSubInts,
    IrInstrToBool,
    IrInstrToNegBool,
    IrInstrToStr,
    IrInstrUpsilon,
} from "../compiler/ir";
import {
    boolify,
} from "./boolify";
import {
    areEqual,
    isLessThan,
} from "./compare";
import {
    E000_InternalError,
    E601_ZeroDivisionError,
    E603_TypeError,
} from "./error";
import {
    stringify,
} from "./stringify";
import {
    BoolValue,
    IntValue,
    NoneValue,
    StrValue,
    Value,
} from "./value";

export function runIr(irCompUnit: IrCompUnit): Value {
    let initFunc = irCompUnit.funcs[0];
    if (initFunc === undefined) {
        throw new E000_InternalError("No init func");
    }

    let blocks = initFunc.blocks;
    let registers: Array<Array<Value>> = Array.from(
        { length: blocks.length },
        (_, index) => Array.from( { length: blocks[index].instrs.length }),
    );
    let phiStorage: Array<Array<Value>> = Array.from(
        { length: blocks.length },
        (_, index) => Array.from( { length: blocks[index].instrs.length }),
    );

    function computedValueOf(instr: IrInstr): Value {
        for (let [blockIndex, block] of blocks.entries()) {
            let instrIndex = block.instrs.indexOf(instr);
            if (instrIndex !== -1) {
                let value = registers[blockIndex][instrIndex];
                if (value === undefined) {
                    throw new E000_InternalError("Uninitialized value");
                }
                return value;
            }
        }
        throw new E000_InternalError("Instruction not found");
    }

    function runInstr(instr: IrInstr): Value {
        if (instr instanceof IrInstrGetInt) {
            return instr.value;
        }
        else if (instr instanceof IrInstrGetStr) {
            return instr.value;
        }
        else if (instr instanceof IrInstrGetFalse) {
            return new BoolValue(false);
        }
        else if (instr instanceof IrInstrGetTrue) {
            return new BoolValue(true);
        }
        else if (instr instanceof IrInstrGetNone) {
            return new NoneValue();
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
            return new IntValue(left.payload + right.payload);
        }
        else if (instr instanceof IrInstrPosInt) {
            let operandValue = computedValueOf(instr.instr);
            if (!(operandValue instanceof IntValue)) {
                throw new E603_TypeError("Expected Int as operand of +");
            }
            return new IntValue(operandValue.payload);
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
            return new IntValue(left.payload - right.payload);
        }
        else if (instr instanceof IrInstrNegInt) {
            let operandValue = computedValueOf(instr.instr);
            if (!(operandValue instanceof IntValue)) {
                throw new E603_TypeError("Expected Int as operand of -");
            }
            return new IntValue(-operandValue.payload);
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
            return new IntValue(left.payload * right.payload);
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
            return new IntValue(left.payload / right.payload - diff);
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
            return new IntValue(left.payload % right.payload);
        }
        else if (instr instanceof IrInstrConcat) {
            let left = computedValueOf(instr.leftInstr);
            let strLeft = stringify(left);
            let right = computedValueOf(instr.rightInstr);
            let strRight = stringify(right);
            return new StrValue(strLeft.payload + strRight.payload);
        }
        else if (instr instanceof IrInstrToStr) {
            let operandValue = computedValueOf(instr.instr);
            return stringify(operandValue);
        }
        else if (instr instanceof IrInstrToBool) {
            let operandValue = computedValueOf(instr.instr);
            return new BoolValue(boolify(operandValue));
        }
        else if (instr instanceof IrInstrToNegBool) {
            let operandValue = computedValueOf(instr.instr);
            return new BoolValue(!boolify(operandValue));
        }
        else if (instr instanceof IrInstrUpsilon) {
            let value = computedValueOf(instr.instr);
            for (let [blockIndex, block] of blocks.entries()) {
                let instrIndex = block.instrs.indexOf(instr.phi);
                if (instrIndex !== -1) {
                    phiStorage[blockIndex][instrIndex] = value;
                    return value;
                }
            }
            throw new E000_InternalError("Phi instruction not found");
        }
        else if (instr instanceof IrInstrPhi) {
            for (let [blockIndex, block] of blocks.entries()) {
                let instrIndex = block.instrs.indexOf(instr);
                if (instrIndex !== -1) {
                    let value = phiStorage[blockIndex][instrIndex];
                    if (value === undefined) {
                        throw new E000_InternalError("Phi value not set");
                    }
                    return value;
                }
            }
            throw new E000_InternalError("Phi instruction not found");
        }
        else if (instr instanceof IrInstrLess) {
            let left = computedValueOf(instr.leftInstr);
            let right = computedValueOf(instr.rightInstr);
            return new BoolValue(isLessThan(left, right));
        }
        else if (instr instanceof IrInstrLessEq) {
            let left = computedValueOf(instr.leftInstr);
            let right = computedValueOf(instr.rightInstr);
            return new BoolValue(
                areEqual(left, right) || isLessThan(left, right)
            );
        }
        else if (instr instanceof IrInstrGreater) {
            let left = computedValueOf(instr.leftInstr);
            let right = computedValueOf(instr.rightInstr);
            return new BoolValue(isLessThan(right, left));
        }
        else if (instr instanceof IrInstrGreaterEq) {
            let left = computedValueOf(instr.leftInstr);
            let right = computedValueOf(instr.rightInstr);
            return new BoolValue(
                areEqual(right, left) || isLessThan(right, left)
            );
        }
        else if (instr instanceof IrInstrEq) {
            let left = computedValueOf(instr.leftInstr);
            let right = computedValueOf(instr.rightInstr);
            return new BoolValue(areEqual(left, right));
        }
        else if (instr instanceof IrInstrNotEq) {
            let left = computedValueOf(instr.leftInstr);
            let right = computedValueOf(instr.rightInstr);
            return new BoolValue(!areEqual(left, right));
        }
        else {
            throw new E000_InternalError(
                `Unrecognized instruction ${instr.constructor.name}`
            );
        }
    }

    let blockIndex = 0;
    let currentBlock = initFunc.blocks[0];
    if (currentBlock === undefined) {
        throw new E000_InternalError("No basic block");
    }

    BLOCK:
    while (true) {
        let instrs = currentBlock.instrs;

        for (let [instrIndex, instr] of instrs.entries()) {
            registers[blockIndex][instrIndex] = runInstr(instr);
        }

        let jump = currentBlock.jump;
        if (jump instanceof IrBranchJump) {
            let value = computedValueOf(jump.instr);
            if (!(value instanceof BoolValue)) {
                throw new E000_InternalError("Not a Bool in branch jump");
            }
            currentBlock = value.payload ? jump.trueTarget : jump.falseTarget;
            blockIndex = blocks.indexOf(currentBlock);
            if (blockIndex === -1) {
                throw new E000_InternalError("Block index not found");
            }
            continue BLOCK;
        }
        else if (jump instanceof IrDirectJump) {
            currentBlock = jump.target;
            blockIndex = blocks.indexOf(currentBlock);
            if (blockIndex === -1) {
                throw new E000_InternalError("Block index not found");
            }
            continue BLOCK;
        }
        else if (jump === null) {
            let lastInstrIndex = currentBlock.instrs.length - 1;
            let lastValue = registers[blockIndex][lastInstrIndex];
            if (lastValue === undefined) {
                throw new E000_InternalError("No last value set");
            }
            return lastValue;
        }
        else {
            throw new Error(`Unknown jump type ${jump.constructor.name}`);
        }
    }
}

