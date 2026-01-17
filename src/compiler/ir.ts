import {
    IntValue,
} from "../runtime/value";

export class IrCompUnit {
    funcs: Array<IrFunc>;

    constructor(options: {
        funcs: Array<IrFunc>,
    }) {
        this.funcs = options.funcs;
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

    constructor(options: {
        instrs: Array<IrInstr>,
    }) {
        this.instrs = options.instrs;
    }
}

export class IrInstr {
}

export class IrInstrGetInt extends IrInstr {
    value: IntValue;

    constructor(value: IntValue) {
        super();
        this.value = value;
    }
}

