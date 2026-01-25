import {
    IntValue,
    StrValue,
} from "../runtime/value";

export class IrCompUnit {
    funcs: Array<IrFunc>;

    constructor(options: {
        funcs: Array<IrFunc>,
        fixups?: () => void,
    }) {
        this.funcs = options.funcs;
        if (options.fixups) {
            options.fixups();
        }
    }
}

export class IrFunc {
    blocks: Array<IrBasicBlock>;

    constructor(options: {
        blocks: Array<IrBasicBlock>,
    }) {
        this.blocks = options.blocks;
    }
}

export class IrBasicBlock {
    instrs: Array<IrInstr>;
    jump: IrJump | null;

    constructor(options: {
        instrs: Array<IrInstr>,
        jump?: IrJump,
    }) {
        this.instrs = options.instrs;
        this.jump = options.jump ?? null;
    }
}

export const _b = new IrBasicBlock({ instrs: [] });

export class IrInstr {
}

export const _i = new IrInstr();

export class IrInstrGetInt extends IrInstr {
    value: IntValue;

    constructor(value: IntValue) {
        super();
        this.value = value;
    }
}

export class IrInstrGetStr extends IrInstr {
    value: StrValue;

    constructor(value: StrValue) {
        super();
        this.value = value;
    }
}

export class IrInstrGetFalse extends IrInstr {
}

export class IrInstrGetTrue extends IrInstr {
}

export class IrInstrGetNone extends IrInstr {
}

export class IrInstrAddInts extends IrInstr {
    leftInstr: IrInstr;
    rightInstr: IrInstr;

    constructor(leftInstr: IrInstr, rightInstr: IrInstr) {
        super();
        this.leftInstr = leftInstr;
        this.rightInstr = rightInstr;
    }
}

export class IrInstrPosInt extends IrInstr {
    instr: IrInstr;

    constructor(instr: IrInstr) {
        super();
        this.instr = instr;
    }
}

export class IrInstrSubInts extends IrInstr {
    leftInstr: IrInstr;
    rightInstr: IrInstr;

    constructor(leftInstr: IrInstr, rightInstr: IrInstr) {
        super();
        this.leftInstr = leftInstr;
        this.rightInstr = rightInstr;
    }
}

export class IrInstrNegInt extends IrInstr {
    instr: IrInstr;

    constructor(instr: IrInstr) {
        super();
        this.instr = instr;
    }
}

export class IrInstrMulInts extends IrInstr {
    leftInstr: IrInstr;
    rightInstr: IrInstr;

    constructor(leftInstr: IrInstr, rightInstr: IrInstr) {
        super();
        this.leftInstr = leftInstr;
        this.rightInstr = rightInstr;
    }
}

export class IrInstrFloorDivInts extends IrInstr {
    leftInstr: IrInstr;
    rightInstr: IrInstr;

    constructor(leftInstr: IrInstr, rightInstr: IrInstr) {
        super();
        this.leftInstr = leftInstr;
        this.rightInstr = rightInstr;
    }
}

export class IrInstrModInts extends IrInstr {
    leftInstr: IrInstr;
    rightInstr: IrInstr;

    constructor(leftInstr: IrInstr, rightInstr: IrInstr) {
        super();
        this.leftInstr = leftInstr;
        this.rightInstr = rightInstr;
    }
}

export class IrInstrConcat extends IrInstr {
    leftInstr: IrInstr;
    rightInstr: IrInstr;

    constructor(leftInstr: IrInstr, rightInstr: IrInstr) {
        super();
        this.leftInstr = leftInstr;
        this.rightInstr = rightInstr;
    }
}

export class IrInstrToStr extends IrInstr {
    instr: IrInstr;

    constructor(instr: IrInstr) {
        super();
        this.instr = instr;
    }
}

export class IrInstrToBool extends IrInstr {
    instr: IrInstr;

    constructor(instr: IrInstr) {
        super();
        this.instr = instr;
    }
}

export class IrInstrToNegBool extends IrInstr {
    instr: IrInstr;

    constructor(instr: IrInstr) {
        super();
        this.instr = instr;
    }
}

export class IrInstrUpsilon extends IrInstr {
    instr: IrInstr;
    phi: IrInstr;

    constructor(instr: IrInstr, phi: IrInstr) {
        super();
        this.instr = instr;
        this.phi = phi;
    }
}

export class IrInstrPhi extends IrInstr {
}

export class IrJump {
}

export class IrBranchJump extends IrJump {
    instr: IrInstr;
    trueTarget: IrBasicBlock;
    falseTarget: IrBasicBlock;

    constructor(
        instr: IrInstr,
        trueTarget: IrBasicBlock,
        falseTarget: IrBasicBlock,
    ) {
        super();
        this.instr = instr;
        this.trueTarget = trueTarget;
        this.falseTarget = falseTarget;
    }
}

export class IrDirectJump extends IrJump {
    target: IrBasicBlock;

    constructor(target: IrBasicBlock) {
        super();
        this.target = target;
    }
}

export class IrInstrLess extends IrInstr {
    leftInstr: IrInstr;
    rightInstr: IrInstr;

    constructor(leftInstr: IrInstr, rightInstr: IrInstr) {
        super();
        this.leftInstr = leftInstr;
        this.rightInstr = rightInstr;
    }
}

export class IrInstrLessEq extends IrInstr {
    leftInstr: IrInstr;
    rightInstr: IrInstr;

    constructor(leftInstr: IrInstr, rightInstr: IrInstr) {
        super();
        this.leftInstr = leftInstr;
        this.rightInstr = rightInstr;
    }
}

export class IrInstrGreater extends IrInstr {
    leftInstr: IrInstr;
    rightInstr: IrInstr;

    constructor(leftInstr: IrInstr, rightInstr: IrInstr) {
        super();
        this.leftInstr = leftInstr;
        this.rightInstr = rightInstr;
    }
}

export class IrInstrGreaterEq extends IrInstr {
    leftInstr: IrInstr;
    rightInstr: IrInstr;

    constructor(leftInstr: IrInstr, rightInstr: IrInstr) {
        super();
        this.leftInstr = leftInstr;
        this.rightInstr = rightInstr;
    }
}

export class IrInstrEq extends IrInstr {
    leftInstr: IrInstr;
    rightInstr: IrInstr;

    constructor(leftInstr: IrInstr, rightInstr: IrInstr) {
        super();
        this.leftInstr = leftInstr;
        this.rightInstr = rightInstr;
    }
}

export class IrInstrNotEq extends IrInstr {
    leftInstr: IrInstr;
    rightInstr: IrInstr;

    constructor(leftInstr: IrInstr, rightInstr: IrInstr) {
        super();
        this.leftInstr = leftInstr;
        this.rightInstr = rightInstr;
    }
}

export function dumpIr(irCompUnit: IrCompUnit): void {
    for (let func of irCompUnit.funcs) {
        const instrIndexOf = (soughtInstr: IrInstr) => {
            if (soughtInstr === _i) {
                return "_i";
            }

            let instrIndex = 0;
            for (let block of func.blocks) {
                for (let instr of block.instrs) {
                    if (instr === soughtInstr) {
                        return "i" + instrIndex;
                    }
                    ++instrIndex;
                }
            }
            return "#MISSING#";
        };

        const blockIndexOf = (soughtBlock: IrBasicBlock) => {
            if (soughtBlock === _b) {
                return "_b";
            }

            for (let [blockIndex, block] of func.blocks.entries()) {
                if (block === soughtBlock) {
                    return "b" + blockIndex;
                }
            }
            return "#MISSING#";
        }

        console.log("FUNC:");
        let instrIndex = 0;
        for (let [blockIndex, block] of func.blocks.entries()) {
            console.log(`  BLOCK b${blockIndex}:`);
            for (let instr of block.instrs) {
                let args: string;
                if (instr instanceof IrInstrGetInt) {
                    args = String(instr.value.payload);
                }
                else if (instr instanceof IrInstrLess) {
                    let left = instrIndexOf(instr.leftInstr);
                    let right = instrIndexOf(instr.rightInstr);
                    args = left + ", " + right;
                }
                else if (instr instanceof IrInstrGetTrue ||
                         instr instanceof IrInstrGetFalse ||
                         instr instanceof IrInstrPhi) {
                    args = "";
                }
                else if (instr instanceof IrInstrUpsilon) {
                    let value = instrIndexOf(instr.instr);
                    let phi = instrIndexOf(instr.phi);
                    args = value + ", ^" + phi;
                }
                else if (instr instanceof IrInstrToBool) {
                    args = instrIndexOf(instr.instr);
                }
                else {
                    throw new Error(
                        `Unrecognized instruction ${instr.constructor.name}`
                    );
                }
                console.log(
                    `    i${instrIndex} = ${instr.constructor.name}(${args})`
                );
                ++instrIndex;
            }
            if (block.jump) {
                let jump = block.jump;
                let args: string;
                if (jump instanceof IrDirectJump) {
                    args = blockIndexOf(jump.target);
                }
                else if (jump instanceof IrBranchJump) {
                    let value = instrIndexOf(jump.instr);
                    let trueTarget = blockIndexOf(jump.trueTarget);
                    let falseTarget = blockIndexOf(jump.falseTarget);
                    args = value + ", " + trueTarget + ", " + falseTarget;
                }
                else {
                    throw new Error(
                        `Unrecognized jump ${jump.constructor.name}`
                    );
                }
                console.log(`    -> ${block.jump.constructor.name}(${args})`);
            }
        }
    }
}

