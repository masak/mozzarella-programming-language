import test from "ava";
import {
    _b,
    _i,
    IrBasicBlock,
    IrBranchJump,
    IrCompUnit,
    IrDirectJump,
    IrFunc,
    IrInstr,
    IrInstrEq,
    IrInstrGetFalse,
    IrInstrGetInt,
    IrInstrGetStr,
    IrInstrGreater,
    IrInstrGreaterEq,
    IrInstrLess,
    IrInstrLessEq,
    IrInstrNegInt,
    IrInstrNotEq,
    IrInstrPhi,
    IrInstrUpsilon,
} from "../src/compiler/ir";
import {
    run,
} from "../src/go";
import {
    IntValue,
    StrValue,
} from "../src/runtime/value";

test("IR: boolean operations", (t) => {
    {
        let i1: IrInstr;
        let i2: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetInt(new IntValue(1n)),
                                i2 = new IrInstrGetInt(new IntValue(2n)),
                                new IrInstrLess(i1, i2),
                            ],
                        }),
                    ],
                }),
            ],
        });

        t.is(run(ir), "true");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetInt(new IntValue(2n)),
                                i2 = new IrInstrGetInt(new IntValue(1n)),
                                new IrInstrLess(i1, i2),
                            ],
                        }),
                    ],
                }),
            ],
        });

        t.is(run(ir), "false");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetInt(new IntValue(3n)),
                                i2 = new IrInstrGetInt(new IntValue(3n)),
                                new IrInstrLess(i1, i2),
                            ],
                        }),
                    ],
                }),
            ],
        });

        t.is(run(ir), "false");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let i3: IrInstr;
        let j4: IrBranchJump;
        let b5: IrBasicBlock;
        let i6: IrInstr;
        let i7: IrInstr;
        let i8: IrInstrUpsilon;
        let j9: IrDirectJump;
        let b10: IrBasicBlock;
        let i11: IrInstr;
        let i12: IrInstrUpsilon;
        let j13: IrDirectJump;
        let b14: IrBasicBlock;
        let i15: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetInt(new IntValue(3n)),
                                i2 = new IrInstrGetInt(new IntValue(6n)),
                                i3 = new IrInstrLess(i1, i2),
                            ],
                            jump: j4 = new IrBranchJump(i3, _b, _b),
                        }),
                        b5 = new IrBasicBlock({
                            instrs: [
                                i6 = new IrInstrGetInt(new IntValue(9n)),
                                i7 = new IrInstrLess(i2, i6),
                                i8 = new IrInstrUpsilon(i7, _i),
                            ],
                            jump: j9 = new IrDirectJump(_b),
                        }),
                        b10 = new IrBasicBlock({
                            instrs: [
                                i11 = new IrInstrGetFalse(),
                                i12 = new IrInstrUpsilon(i11, _i),
                            ],
                            jump: j13 = new IrDirectJump(_b),
                        }),
                        b14 = new IrBasicBlock({
                            instrs: [
                                i15 = new IrInstrPhi(),
                            ],
                        }),
                    ],
                }),
            ],
            fixups: () => {
                j4.trueTarget = b5;
                j4.falseTarget = b10;
                i8.phi = i15;
                j9.target = b14;
                i12.phi = i15;
                j13.target = b14;
            },
        });

        t.is(run(ir), "true");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let i3: IrInstr;
        let j4: IrBranchJump;
        let b5: IrBasicBlock;
        let i6: IrInstr;
        let i7: IrInstr;
        let i8: IrInstrUpsilon;
        let j9: IrDirectJump;
        let b10: IrBasicBlock;
        let i11: IrInstr;
        let i12: IrInstrUpsilon;
        let j13: IrDirectJump;
        let b14: IrBasicBlock;
        let i15: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetInt(new IntValue(3n)),
                                i2 = new IrInstrGetInt(new IntValue(9n)),
                                i3 = new IrInstrLess(i1, i2),
                            ],
                            jump: j4 = new IrBranchJump(i3, _b, _b),
                        }),
                        b5 = new IrBasicBlock({
                            instrs: [
                                i6 = new IrInstrGetInt(new IntValue(6n)),
                                i7 = new IrInstrLess(i2, i6),
                                i8 = new IrInstrUpsilon(i7, _i),
                            ],
                            jump: j9 = new IrDirectJump(_b),
                        }),
                        b10 = new IrBasicBlock({
                            instrs: [
                                i11 = new IrInstrGetFalse(),
                                i12 = new IrInstrUpsilon(i11, _i),
                            ],
                            jump: j13 = new IrDirectJump(_b),
                        }),
                        b14 = new IrBasicBlock({
                            instrs: [
                                i15 = new IrInstrPhi(),
                            ],
                        }),
                    ],
                }),
            ],
            fixups: () => {
                j4.trueTarget = b5;
                j4.falseTarget = b10;
                i8.phi = i15;
                j9.target = b14;
                i12.phi = i15;
                j13.target = b14;
            },
        });

        t.is(run(ir), "false");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let i3: IrInstr;
        let j4: IrBranchJump;
        let b5: IrBasicBlock;
        let i6: IrInstr;
        let i7: IrInstr;
        let i8: IrInstrUpsilon;
        let j9: IrDirectJump;
        let b10: IrBasicBlock;
        let i11: IrInstr;
        let i12: IrInstrUpsilon;
        let j13: IrDirectJump;
        let b14: IrBasicBlock;
        let i15: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetInt(new IntValue(6n)),
                                i2 = new IrInstrGetInt(new IntValue(3n)),
                                i3 = new IrInstrLess(i1, i2),
                            ],
                            jump: j4 = new IrBranchJump(i3, _b, _b),
                        }),
                        b5 = new IrBasicBlock({
                            instrs: [
                                i6 = new IrInstrGetInt(new IntValue(9n)),
                                i7 = new IrInstrLess(i2, i6),
                                i8 = new IrInstrUpsilon(i7, _i),
                            ],
                            jump: j9 = new IrDirectJump(_b),
                        }),
                        b10 = new IrBasicBlock({
                            instrs: [
                                i11 = new IrInstrGetFalse(),
                                i12 = new IrInstrUpsilon(i11, _i),
                            ],
                            jump: j13 = new IrDirectJump(_b),
                        }),
                        b14 = new IrBasicBlock({
                            instrs: [
                                i15 = new IrInstrPhi(),
                            ],
                        }),
                    ],
                }),
            ],
            fixups: () => {
                j4.trueTarget = b5;
                j4.falseTarget = b10;
                i8.phi = i15;
                j9.target = b14;
                i12.phi = i15;
                j13.target = b14;
            },
        });

        t.is(run(ir), "false");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let i3: IrInstr;
        let j4: IrBranchJump;
        let b5: IrBasicBlock;
        let i6: IrInstr;
        let i7: IrInstr;
        let i8: IrInstrUpsilon;
        let j9: IrDirectJump;
        let b10: IrBasicBlock;
        let i11: IrInstr;
        let i12: IrInstrUpsilon;
        let j13: IrDirectJump;
        let b14: IrBasicBlock;
        let i15: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetInt(new IntValue(3n)),
                                i2 = new IrInstrGetInt(new IntValue(6n)),
                                i3 = new IrInstrLess(i1, i2),
                            ],
                            jump: j4 = new IrBranchJump(i3, _b, _b),
                        }),
                        b5 = new IrBasicBlock({
                            instrs: [
                                i6 = new IrInstrGetInt(new IntValue(6n)),
                                i7 = new IrInstrLess(i2, i6),
                                i8 = new IrInstrUpsilon(i7, _i),
                            ],
                            jump: j9 = new IrDirectJump(_b),
                        }),
                        b10 = new IrBasicBlock({
                            instrs: [
                                i11 = new IrInstrGetFalse(),
                                i12 = new IrInstrUpsilon(i11, _i),
                            ],
                            jump: j13 = new IrDirectJump(_b),
                        }),
                        b14 = new IrBasicBlock({
                            instrs: [
                                i15 = new IrInstrPhi(),
                            ],
                        }),
                    ],
                }),
            ],
            fixups: () => {
                j4.trueTarget = b5;
                j4.falseTarget = b10;
                i8.phi = i15;
                j9.target = b14;
                i12.phi = i15;
                j13.target = b14;
            },
        });

        t.is(run(ir), "false");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetInt(new IntValue(1n)),
                                i2 = new IrInstrGetInt(new IntValue(2n)),
                                new IrInstrLessEq(i1, i2),
                            ],
                        }),
                    ],
                }),
            ],
        });

        t.is(run(ir), "true");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetInt(new IntValue(2n)),
                                i2 = new IrInstrGetInt(new IntValue(1n)),
                                new IrInstrLessEq(i1, i2),
                            ],
                        }),
                    ],
                }),
            ],
        });

        t.is(run(ir), "false");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetInt(new IntValue(3n)),
                                i2 = new IrInstrGetInt(new IntValue(3n)),
                                new IrInstrLessEq(i1, i2),
                            ],
                        }),
                    ],
                }),
            ],
        });

        t.is(run(ir), "true");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let i3: IrInstr;
        let j4: IrBranchJump;
        let b5: IrBasicBlock;
        let i6: IrInstr;
        let i7: IrInstr;
        let i8: IrInstrUpsilon;
        let j9: IrDirectJump;
        let b10: IrBasicBlock;
        let i11: IrInstr;
        let i12: IrInstrUpsilon;
        let j13: IrDirectJump;
        let b14: IrBasicBlock;
        let i15: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetInt(new IntValue(3n)),
                                i2 = new IrInstrGetInt(new IntValue(6n)),
                                i3 = new IrInstrLessEq(i1, i2),
                            ],
                            jump: j4 = new IrBranchJump(i3, _b, _b),
                        }),
                        b5 = new IrBasicBlock({
                            instrs: [
                                i6 = new IrInstrGetInt(new IntValue(9n)),
                                i7 = new IrInstrLessEq(i2, i6),
                                i8 = new IrInstrUpsilon(i7, _i),
                            ],
                            jump: j9 = new IrDirectJump(_b),
                        }),
                        b10 = new IrBasicBlock({
                            instrs: [
                                i11 = new IrInstrGetFalse(),
                                i12 = new IrInstrUpsilon(i11, _i),
                            ],
                            jump: j13 = new IrDirectJump(_b),
                        }),
                        b14 = new IrBasicBlock({
                            instrs: [
                                i15 = new IrInstrPhi(),
                            ],
                        }),
                    ],
                }),
            ],
            fixups: () => {
                j4.trueTarget = b5;
                j4.falseTarget = b10;
                i8.phi = i15;
                j9.target = b14;
                i12.phi = i15;
                j13.target = b14;
            },
        });

        t.is(run(ir), "true");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let i3: IrInstr;
        let j4: IrBranchJump;
        let b5: IrBasicBlock;
        let i6: IrInstr;
        let i7: IrInstr;
        let i8: IrInstrUpsilon;
        let j9: IrDirectJump;
        let b10: IrBasicBlock;
        let i11: IrInstr;
        let i12: IrInstrUpsilon;
        let j13: IrDirectJump;
        let b14: IrBasicBlock;
        let i15: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetInt(new IntValue(3n)),
                                i2 = new IrInstrGetInt(new IntValue(9n)),
                                i3 = new IrInstrLessEq(i1, i2),
                            ],
                            jump: j4 = new IrBranchJump(i3, _b, _b),
                        }),
                        b5 = new IrBasicBlock({
                            instrs: [
                                i6 = new IrInstrGetInt(new IntValue(6n)),
                                i7 = new IrInstrLessEq(i2, i6),
                                i8 = new IrInstrUpsilon(i7, _i),
                            ],
                            jump: j9 = new IrDirectJump(_b),
                        }),
                        b10 = new IrBasicBlock({
                            instrs: [
                                i11 = new IrInstrGetFalse(),
                                i12 = new IrInstrUpsilon(i11, _i),
                            ],
                            jump: j13 = new IrDirectJump(_b),
                        }),
                        b14 = new IrBasicBlock({
                            instrs: [
                                i15 = new IrInstrPhi(),
                            ],
                        }),
                    ],
                }),
            ],
            fixups: () => {
                j4.trueTarget = b5;
                j4.falseTarget = b10;
                i8.phi = i15;
                j9.target = b14;
                i12.phi = i15;
                j13.target = b14;
            },
        });

        t.is(run(ir), "false");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let i3: IrInstr;
        let j4: IrBranchJump;
        let b5: IrBasicBlock;
        let i6: IrInstr;
        let i7: IrInstr;
        let i8: IrInstrUpsilon;
        let j9: IrDirectJump;
        let b10: IrBasicBlock;
        let i11: IrInstr;
        let i12: IrInstrUpsilon;
        let j13: IrDirectJump;
        let b14: IrBasicBlock;
        let i15: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetInt(new IntValue(6n)),
                                i2 = new IrInstrGetInt(new IntValue(3n)),
                                i3 = new IrInstrLessEq(i1, i2),
                            ],
                            jump: j4 = new IrBranchJump(i3, _b, _b),
                        }),
                        b5 = new IrBasicBlock({
                            instrs: [
                                i6 = new IrInstrGetInt(new IntValue(9n)),
                                i7 = new IrInstrLessEq(i2, i6),
                                i8 = new IrInstrUpsilon(i7, _i),
                            ],
                            jump: j9 = new IrDirectJump(_b),
                        }),
                        b10 = new IrBasicBlock({
                            instrs: [
                                i11 = new IrInstrGetFalse(),
                                i12 = new IrInstrUpsilon(i11, _i),
                            ],
                            jump: j13 = new IrDirectJump(_b),
                        }),
                        b14 = new IrBasicBlock({
                            instrs: [
                                i15 = new IrInstrPhi(),
                            ],
                        }),
                    ],
                }),
            ],
            fixups: () => {
                j4.trueTarget = b5;
                j4.falseTarget = b10;
                i8.phi = i15;
                j9.target = b14;
                i12.phi = i15;
                j13.target = b14;
            },
        });

        t.is(run(ir), "false");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let i3: IrInstr;
        let j4: IrBranchJump;
        let b5: IrBasicBlock;
        let i6: IrInstr;
        let i7: IrInstr;
        let i8: IrInstrUpsilon;
        let j9: IrDirectJump;
        let b10: IrBasicBlock;
        let i11: IrInstr;
        let i12: IrInstrUpsilon;
        let j13: IrDirectJump;
        let b14: IrBasicBlock;
        let i15: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetInt(new IntValue(3n)),
                                i2 = new IrInstrGetInt(new IntValue(6n)),
                                i3 = new IrInstrLessEq(i1, i2),
                            ],
                            jump: j4 = new IrBranchJump(i3, _b, _b),
                        }),
                        b5 = new IrBasicBlock({
                            instrs: [
                                i6 = new IrInstrGetInt(new IntValue(6n)),
                                i7 = new IrInstrLessEq(i2, i6),
                                i8 = new IrInstrUpsilon(i7, _i),
                            ],
                            jump: j9 = new IrDirectJump(_b),
                        }),
                        b10 = new IrBasicBlock({
                            instrs: [
                                i11 = new IrInstrGetFalse(),
                                i12 = new IrInstrUpsilon(i11, _i),
                            ],
                            jump: j13 = new IrDirectJump(_b),
                        }),
                        b14 = new IrBasicBlock({
                            instrs: [
                                i15 = new IrInstrPhi(),
                            ],
                        }),
                    ],
                }),
            ],
            fixups: () => {
                j4.trueTarget = b5;
                j4.falseTarget = b10;
                i8.phi = i15;
                j9.target = b14;
                i12.phi = i15;
                j13.target = b14;
            },
        });

        t.is(run(ir), "true");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let i3: IrInstr;
        let j4: IrBranchJump;
        let b5: IrBasicBlock;
        let i6: IrInstr;
        let i7: IrInstr;
        let i8: IrInstrUpsilon;
        let j9: IrDirectJump;
        let b10: IrBasicBlock;
        let i11: IrInstr;
        let i12: IrInstrUpsilon;
        let j13: IrDirectJump;
        let b14: IrBasicBlock;
        let i15: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetInt(new IntValue(3n)),
                                i2 = new IrInstrGetInt(new IntValue(6n)),
                                i3 = new IrInstrLess(i1, i2),
                            ],
                            jump: j4 = new IrBranchJump(i3, _b, _b),
                        }),
                        b5 = new IrBasicBlock({
                            instrs: [
                                i6 = new IrInstrGetInt(new IntValue(9n)),
                                i7 = new IrInstrLessEq(i2, i6),
                                i8 = new IrInstrUpsilon(i7, _i),
                            ],
                            jump: j9 = new IrDirectJump(_b),
                        }),
                        b10 = new IrBasicBlock({
                            instrs: [
                                i11 = new IrInstrGetFalse(),
                                i12 = new IrInstrUpsilon(i11, _i),
                            ],
                            jump: j13 = new IrDirectJump(_b),
                        }),
                        b14 = new IrBasicBlock({
                            instrs: [
                                i15 = new IrInstrPhi(),
                            ],
                        }),
                    ],
                }),
            ],
            fixups: () => {
                j4.trueTarget = b5;
                j4.falseTarget = b10;
                i8.phi = i15;
                j9.target = b14;
                i12.phi = i15;
                j13.target = b14;
            },
        });

        t.is(run(ir), "true");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let i3: IrInstr;
        let j4: IrBranchJump;
        let b5: IrBasicBlock;
        let i6: IrInstr;
        let i7: IrInstr;
        let i8: IrInstrUpsilon;
        let j9: IrDirectJump;
        let b10: IrBasicBlock;
        let i11: IrInstr;
        let i12: IrInstrUpsilon;
        let j13: IrDirectJump;
        let b14: IrBasicBlock;
        let i15: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetInt(new IntValue(3n)),
                                i2 = new IrInstrGetInt(new IntValue(9n)),
                                i3 = new IrInstrLess(i1, i2),
                            ],
                            jump: j4 = new IrBranchJump(i3, _b, _b),
                        }),
                        b5 = new IrBasicBlock({
                            instrs: [
                                i6 = new IrInstrGetInt(new IntValue(6n)),
                                i7 = new IrInstrLessEq(i2, i6),
                                i8 = new IrInstrUpsilon(i7, _i),
                            ],
                            jump: j9 = new IrDirectJump(_b),
                        }),
                        b10 = new IrBasicBlock({
                            instrs: [
                                i11 = new IrInstrGetFalse(),
                                i12 = new IrInstrUpsilon(i11, _i),
                            ],
                            jump: j13 = new IrDirectJump(_b),
                        }),
                        b14 = new IrBasicBlock({
                            instrs: [
                                i15 = new IrInstrPhi(),
                            ],
                        }),
                    ],
                }),
            ],
            fixups: () => {
                j4.trueTarget = b5;
                j4.falseTarget = b10;
                i8.phi = i15;
                j9.target = b14;
                i12.phi = i15;
                j13.target = b14;
            },
        });

        t.is(run(ir), "false");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let i3: IrInstr;
        let j4: IrBranchJump;
        let b5: IrBasicBlock;
        let i6: IrInstr;
        let i7: IrInstr;
        let i8: IrInstrUpsilon;
        let j9: IrDirectJump;
        let b10: IrBasicBlock;
        let i11: IrInstr;
        let i12: IrInstrUpsilon;
        let j13: IrDirectJump;
        let b14: IrBasicBlock;
        let i15: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetInt(new IntValue(6n)),
                                i2 = new IrInstrGetInt(new IntValue(3n)),
                                i3 = new IrInstrLess(i1, i2),
                            ],
                            jump: j4 = new IrBranchJump(i3, _b, _b),
                        }),
                        b5 = new IrBasicBlock({
                            instrs: [
                                i6 = new IrInstrGetInt(new IntValue(9n)),
                                i7 = new IrInstrLessEq(i2, i6),
                                i8 = new IrInstrUpsilon(i7, _i),
                            ],
                            jump: j9 = new IrDirectJump(_b),
                        }),
                        b10 = new IrBasicBlock({
                            instrs: [
                                i11 = new IrInstrGetFalse(),
                                i12 = new IrInstrUpsilon(i11, _i),
                            ],
                            jump: j13 = new IrDirectJump(_b),
                        }),
                        b14 = new IrBasicBlock({
                            instrs: [
                                i15 = new IrInstrPhi(),
                            ],
                        }),
                    ],
                }),
            ],
            fixups: () => {
                j4.trueTarget = b5;
                j4.falseTarget = b10;
                i8.phi = i15;
                j9.target = b14;
                i12.phi = i15;
                j13.target = b14;
            },
        });

        t.is(run(ir), "false");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let i3: IrInstr;
        let j4: IrBranchJump;
        let b5: IrBasicBlock;
        let i6: IrInstr;
        let i7: IrInstr;
        let i8: IrInstrUpsilon;
        let j9: IrDirectJump;
        let b10: IrBasicBlock;
        let i11: IrInstr;
        let i12: IrInstrUpsilon;
        let j13: IrDirectJump;
        let b14: IrBasicBlock;
        let i15: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetInt(new IntValue(3n)),
                                i2 = new IrInstrGetInt(new IntValue(6n)),
                                i3 = new IrInstrLess(i1, i2),
                            ],
                            jump: j4 = new IrBranchJump(i3, _b, _b),
                        }),
                        b5 = new IrBasicBlock({
                            instrs: [
                                i6 = new IrInstrGetInt(new IntValue(6n)),
                                i7 = new IrInstrLessEq(i2, i6),
                                i8 = new IrInstrUpsilon(i7, _i),
                            ],
                            jump: j9 = new IrDirectJump(_b),
                        }),
                        b10 = new IrBasicBlock({
                            instrs: [
                                i11 = new IrInstrGetFalse(),
                                i12 = new IrInstrUpsilon(i11, _i),
                            ],
                            jump: j13 = new IrDirectJump(_b),
                        }),
                        b14 = new IrBasicBlock({
                            instrs: [
                                i15 = new IrInstrPhi(),
                            ],
                        }),
                    ],
                }),
            ],
            fixups: () => {
                j4.trueTarget = b5;
                j4.falseTarget = b10;
                i8.phi = i15;
                j9.target = b14;
                i12.phi = i15;
                j13.target = b14;
            },
        });

        t.is(run(ir), "true");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetStr(new StrValue("ab")),
                                i2 = new IrInstrGetStr(new StrValue("abc")),
                                new IrInstrLess(i1, i2),
                            ],
                        }),
                    ],
                }),
            ],
        });

        t.is(run(ir), "true");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetStr(new StrValue("abc")),
                                i2 = new IrInstrGetStr(new StrValue("ab")),
                                new IrInstrLess(i1, i2),
                            ],
                        }),
                    ],
                }),
            ],
        });

        t.is(run(ir), "false");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetStr(new StrValue("crab")),
                                i2 = new IrInstrGetStr(new StrValue("crab")),
                                new IrInstrLess(i1, i2),
                            ],
                        }),
                    ],
                }),
            ],
        });

        t.is(run(ir), "false");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let i3: IrInstr;
        let j4: IrBranchJump;
        let b5: IrBasicBlock;
        let i6: IrInstr;
        let i7: IrInstr;
        let i8: IrInstrUpsilon;
        let j9: IrDirectJump;
        let b10: IrBasicBlock;
        let i11: IrInstr;
        let i12: IrInstrUpsilon;
        let j13: IrDirectJump;
        let b14: IrBasicBlock;
        let i15: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetStr(new StrValue("crab")),
                                i2 = new IrInstrGetStr(new StrValue("fusion")),
                                i3 = new IrInstrLess(i1, i2),
                            ],
                            jump: j4 = new IrBranchJump(i3, _b, _b),
                        }),
                        b5 = new IrBasicBlock({
                            instrs: [
                                i6 = new IrInstrGetStr(new StrValue("indigo")),
                                i7 = new IrInstrLess(i2, i6),
                                i8 = new IrInstrUpsilon(i7, _i),
                            ],
                            jump: j9 = new IrDirectJump(_b),
                        }),
                        b10 = new IrBasicBlock({
                            instrs: [
                                i11 = new IrInstrGetFalse(),
                                i12 = new IrInstrUpsilon(i11, _i),
                            ],
                            jump: j13 = new IrDirectJump(_b),
                        }),
                        b14 = new IrBasicBlock({
                            instrs: [
                                i15 = new IrInstrPhi(),
                            ],
                        }),
                    ],
                }),
            ],
            fixups: () => {
                j4.trueTarget = b5;
                j4.falseTarget = b10;
                i8.phi = i15;
                j9.target = b14;
                i12.phi = i15;
                j13.target = b14;
            },
        });

        t.is(run(ir), "true");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let i3: IrInstr;
        let j4: IrBranchJump;
        let b5: IrBasicBlock;
        let i6: IrInstr;
        let i7: IrInstr;
        let i8: IrInstrUpsilon;
        let j9: IrDirectJump;
        let b10: IrBasicBlock;
        let i11: IrInstr;
        let i12: IrInstrUpsilon;
        let j13: IrDirectJump;
        let b14: IrBasicBlock;
        let i15: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetStr(new StrValue("crab")),
                                i2 = new IrInstrGetStr(new StrValue("indigo")),
                                i3 = new IrInstrLess(i1, i2),
                            ],
                            jump: j4 = new IrBranchJump(i3, _b, _b),
                        }),
                        b5 = new IrBasicBlock({
                            instrs: [
                                i6 = new IrInstrGetStr(new StrValue("fusion")),
                                i7 = new IrInstrLess(i2, i6),
                                i8 = new IrInstrUpsilon(i7, _i),
                            ],
                            jump: j9 = new IrDirectJump(_b),
                        }),
                        b10 = new IrBasicBlock({
                            instrs: [
                                i11 = new IrInstrGetFalse(),
                                i12 = new IrInstrUpsilon(i11, _i),
                            ],
                            jump: j13 = new IrDirectJump(_b),
                        }),
                        b14 = new IrBasicBlock({
                            instrs: [
                                i15 = new IrInstrPhi(),
                            ],
                        }),
                    ],
                }),
            ],
            fixups: () => {
                j4.trueTarget = b5;
                j4.falseTarget = b10;
                i8.phi = i15;
                j9.target = b14;
                i12.phi = i15;
                j13.target = b14;
            },
        });

        t.is(run(ir), "false");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let i3: IrInstr;
        let j4: IrBranchJump;
        let b5: IrBasicBlock;
        let i6: IrInstr;
        let i7: IrInstr;
        let i8: IrInstrUpsilon;
        let j9: IrDirectJump;
        let b10: IrBasicBlock;
        let i11: IrInstr;
        let i12: IrInstrUpsilon;
        let j13: IrDirectJump;
        let b14: IrBasicBlock;
        let i15: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetStr(new StrValue("fusion")),
                                i2 = new IrInstrGetStr(new StrValue("crab")),
                                i3 = new IrInstrLess(i1, i2),
                            ],
                            jump: j4 = new IrBranchJump(i3, _b, _b),
                        }),
                        b5 = new IrBasicBlock({
                            instrs: [
                                i6 = new IrInstrGetStr(new StrValue("indigo")),
                                i7 = new IrInstrLess(i2, i6),
                                i8 = new IrInstrUpsilon(i7, _i),
                            ],
                            jump: j9 = new IrDirectJump(_b),
                        }),
                        b10 = new IrBasicBlock({
                            instrs: [
                                i11 = new IrInstrGetFalse(),
                                i12 = new IrInstrUpsilon(i11, _i),
                            ],
                            jump: j13 = new IrDirectJump(_b),
                        }),
                        b14 = new IrBasicBlock({
                            instrs: [
                                i15 = new IrInstrPhi(),
                            ],
                        }),
                    ],
                }),
            ],
            fixups: () => {
                j4.trueTarget = b5;
                j4.falseTarget = b10;
                i8.phi = i15;
                j9.target = b14;
                i12.phi = i15;
                j13.target = b14;
            },
        });

        t.is(run(ir), "false");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let i3: IrInstr;
        let j4: IrBranchJump;
        let b5: IrBasicBlock;
        let i6: IrInstr;
        let i7: IrInstr;
        let i8: IrInstrUpsilon;
        let j9: IrDirectJump;
        let b10: IrBasicBlock;
        let i11: IrInstr;
        let i12: IrInstrUpsilon;
        let j13: IrDirectJump;
        let b14: IrBasicBlock;
        let i15: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetStr(new StrValue("crab")),
                                i2 = new IrInstrGetStr(new StrValue("fusion")),
                                i3 = new IrInstrLess(i1, i2),
                            ],
                            jump: j4 = new IrBranchJump(i3, _b, _b),
                        }),
                        b5 = new IrBasicBlock({
                            instrs: [
                                i6 = new IrInstrGetStr(new StrValue("fusion")),
                                i7 = new IrInstrLess(i2, i6),
                                i8 = new IrInstrUpsilon(i7, _i),
                            ],
                            jump: j9 = new IrDirectJump(_b),
                        }),
                        b10 = new IrBasicBlock({
                            instrs: [
                                i11 = new IrInstrGetFalse(),
                                i12 = new IrInstrUpsilon(i11, _i),
                            ],
                            jump: j13 = new IrDirectJump(_b),
                        }),
                        b14 = new IrBasicBlock({
                            instrs: [
                                i15 = new IrInstrPhi(),
                            ],
                        }),
                    ],
                }),
            ],
            fixups: () => {
                j4.trueTarget = b5;
                j4.falseTarget = b10;
                i8.phi = i15;
                j9.target = b14;
                i12.phi = i15;
                j13.target = b14;
            },
        });

        t.is(run(ir), "false");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetStr(new StrValue("ab")),
                                i2 = new IrInstrGetStr(new StrValue("abc")),
                                new IrInstrLessEq(i1, i2),
                            ],
                        }),
                    ],
                }),
            ],
        });

        t.is(run(ir), "true");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetStr(new StrValue("abc")),
                                i2 = new IrInstrGetStr(new StrValue("ab")),
                                new IrInstrLessEq(i1, i2),
                            ],
                        }),
                    ],
                }),
            ],
        });

        t.is(run(ir), "false");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetStr(new StrValue("crab")),
                                i2 = new IrInstrGetStr(new StrValue("crab")),
                                new IrInstrLessEq(i1, i2),
                            ],
                        }),
                    ],
                }),
            ],
        });

        t.is(run(ir), "true");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let i3: IrInstr;
        let j4: IrBranchJump;
        let b5: IrBasicBlock;
        let i6: IrInstr;
        let i7: IrInstr;
        let i8: IrInstrUpsilon;
        let j9: IrDirectJump;
        let b10: IrBasicBlock;
        let i11: IrInstr;
        let i12: IrInstrUpsilon;
        let j13: IrDirectJump;
        let b14: IrBasicBlock;
        let i15: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetInt(new IntValue(3n)),
                                i2 = new IrInstrGetInt(new IntValue(6n)),
                                i3 = new IrInstrLessEq(i1, i2),
                            ],
                            jump: j4 = new IrBranchJump(i3, _b, _b),
                        }),
                        b5 = new IrBasicBlock({
                            instrs: [
                                i6 = new IrInstrGetInt(new IntValue(9n)),
                                i7 = new IrInstrLessEq(i2, i6),
                                i8 = new IrInstrUpsilon(i7, _i),
                            ],
                            jump: j9 = new IrDirectJump(_b),
                        }),
                        b10 = new IrBasicBlock({
                            instrs: [
                                i11 = new IrInstrGetFalse(),
                                i12 = new IrInstrUpsilon(i11, _i),
                            ],
                            jump: j13 = new IrDirectJump(_b),
                        }),
                        b14 = new IrBasicBlock({
                            instrs: [
                                i15 = new IrInstrPhi(),
                            ],
                        }),
                    ],
                }),
            ],
            fixups: () => {
                j4.trueTarget = b5;
                j4.falseTarget = b10;
                i8.phi = i15;
                j9.target = b14;
                i12.phi = i15;
                j13.target = b14;
            },
        });

        t.is(run(ir), "true");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let i3: IrInstr;
        let j4: IrBranchJump;
        let b5: IrBasicBlock;
        let i6: IrInstr;
        let i7: IrInstr;
        let i8: IrInstrUpsilon;
        let j9: IrDirectJump;
        let b10: IrBasicBlock;
        let i11: IrInstr;
        let i12: IrInstrUpsilon;
        let j13: IrDirectJump;
        let b14: IrBasicBlock;
        let i15: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetStr(new StrValue("crab")),
                                i2 = new IrInstrGetStr(new StrValue("fusion")),
                                i3 = new IrInstrLessEq(i1, i2),
                            ],
                            jump: j4 = new IrBranchJump(i3, _b, _b),
                        }),
                        b5 = new IrBasicBlock({
                            instrs: [
                                i6 = new IrInstrGetStr(new StrValue("indigo")),
                                i7 = new IrInstrLessEq(i2, i6),
                                i8 = new IrInstrUpsilon(i7, _i),
                            ],
                            jump: j9 = new IrDirectJump(_b),
                        }),
                        b10 = new IrBasicBlock({
                            instrs: [
                                i11 = new IrInstrGetFalse(),
                                i12 = new IrInstrUpsilon(i11, _i),
                            ],
                            jump: j13 = new IrDirectJump(_b),
                        }),
                        b14 = new IrBasicBlock({
                            instrs: [
                                i15 = new IrInstrPhi(),
                            ],
                        }),
                    ],
                }),
            ],
            fixups: () => {
                j4.trueTarget = b5;
                j4.falseTarget = b10;
                i8.phi = i15;
                j9.target = b14;
                i12.phi = i15;
                j13.target = b14;
            },
        });

        t.is(run(ir), "true");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let i3: IrInstr;
        let j4: IrBranchJump;
        let b5: IrBasicBlock;
        let i6: IrInstr;
        let i7: IrInstr;
        let i8: IrInstrUpsilon;
        let j9: IrDirectJump;
        let b10: IrBasicBlock;
        let i11: IrInstr;
        let i12: IrInstrUpsilon;
        let j13: IrDirectJump;
        let b14: IrBasicBlock;
        let i15: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetStr(new StrValue("crab")),
                                i2 = new IrInstrGetStr(new StrValue("indigo")),
                                i3 = new IrInstrLessEq(i1, i2),
                            ],
                            jump: j4 = new IrBranchJump(i3, _b, _b),
                        }),
                        b5 = new IrBasicBlock({
                            instrs: [
                                i6 = new IrInstrGetStr(new StrValue("fusion")),
                                i7 = new IrInstrLessEq(i2, i6),
                                i8 = new IrInstrUpsilon(i7, _i),
                            ],
                            jump: j9 = new IrDirectJump(_b),
                        }),
                        b10 = new IrBasicBlock({
                            instrs: [
                                i11 = new IrInstrGetFalse(),
                                i12 = new IrInstrUpsilon(i11, _i),
                            ],
                            jump: j13 = new IrDirectJump(_b),
                        }),
                        b14 = new IrBasicBlock({
                            instrs: [
                                i15 = new IrInstrPhi(),
                            ],
                        }),
                    ],
                }),
            ],
            fixups: () => {
                j4.trueTarget = b5;
                j4.falseTarget = b10;
                i8.phi = i15;
                j9.target = b14;
                i12.phi = i15;
                j13.target = b14;
            },
        });

        t.is(run(ir), "false");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let i3: IrInstr;
        let j4: IrBranchJump;
        let b5: IrBasicBlock;
        let i6: IrInstr;
        let i7: IrInstr;
        let i8: IrInstrUpsilon;
        let j9: IrDirectJump;
        let b10: IrBasicBlock;
        let i11: IrInstr;
        let i12: IrInstrUpsilon;
        let j13: IrDirectJump;
        let b14: IrBasicBlock;
        let i15: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetStr(new StrValue("fusion")),
                                i2 = new IrInstrGetStr(new StrValue("crab")),
                                i3 = new IrInstrLessEq(i1, i2),
                            ],
                            jump: j4 = new IrBranchJump(i3, _b, _b),
                        }),
                        b5 = new IrBasicBlock({
                            instrs: [
                                i6 = new IrInstrGetStr(new StrValue("indigo")),
                                i7 = new IrInstrLessEq(i2, i6),
                                i8 = new IrInstrUpsilon(i7, _i),
                            ],
                            jump: j9 = new IrDirectJump(_b),
                        }),
                        b10 = new IrBasicBlock({
                            instrs: [
                                i11 = new IrInstrGetFalse(),
                                i12 = new IrInstrUpsilon(i11, _i),
                            ],
                            jump: j13 = new IrDirectJump(_b),
                        }),
                        b14 = new IrBasicBlock({
                            instrs: [
                                i15 = new IrInstrPhi(),
                            ],
                        }),
                    ],
                }),
            ],
            fixups: () => {
                j4.trueTarget = b5;
                j4.falseTarget = b10;
                i8.phi = i15;
                j9.target = b14;
                i12.phi = i15;
                j13.target = b14;
            },
        });

        t.is(run(ir), "false");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let i3: IrInstr;
        let j4: IrBranchJump;
        let b5: IrBasicBlock;
        let i6: IrInstr;
        let i7: IrInstr;
        let i8: IrInstrUpsilon;
        let j9: IrDirectJump;
        let b10: IrBasicBlock;
        let i11: IrInstr;
        let i12: IrInstrUpsilon;
        let j13: IrDirectJump;
        let b14: IrBasicBlock;
        let i15: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetStr(new StrValue("crab")),
                                i2 = new IrInstrGetStr(new StrValue("fusion")),
                                i3 = new IrInstrLessEq(i1, i2),
                            ],
                            jump: j4 = new IrBranchJump(i3, _b, _b),
                        }),
                        b5 = new IrBasicBlock({
                            instrs: [
                                i6 = new IrInstrGetStr(new StrValue("fusion")),
                                i7 = new IrInstrLessEq(i2, i6),
                                i8 = new IrInstrUpsilon(i7, _i),
                            ],
                            jump: j9 = new IrDirectJump(_b),
                        }),
                        b10 = new IrBasicBlock({
                            instrs: [
                                i11 = new IrInstrGetFalse(),
                                i12 = new IrInstrUpsilon(i11, _i),
                            ],
                            jump: j13 = new IrDirectJump(_b),
                        }),
                        b14 = new IrBasicBlock({
                            instrs: [
                                i15 = new IrInstrPhi(),
                            ],
                        }),
                    ],
                }),
            ],
            fixups: () => {
                j4.trueTarget = b5;
                j4.falseTarget = b10;
                i8.phi = i15;
                j9.target = b14;
                i12.phi = i15;
                j13.target = b14;
            },
        });

        t.is(run(ir), "true");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let i3: IrInstr;
        let j4: IrBranchJump;
        let b5: IrBasicBlock;
        let i6: IrInstr;
        let i7: IrInstr;
        let i8: IrInstrUpsilon;
        let j9: IrDirectJump;
        let b10: IrBasicBlock;
        let i11: IrInstr;
        let i12: IrInstrUpsilon;
        let j13: IrDirectJump;
        let b14: IrBasicBlock;
        let i15: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetStr(new StrValue("crab")),
                                i2 = new IrInstrGetStr(new StrValue("fusion")),
                                i3 = new IrInstrLess(i1, i2),
                            ],
                            jump: j4 = new IrBranchJump(i3, _b, _b),
                        }),
                        b5 = new IrBasicBlock({
                            instrs: [
                                i6 = new IrInstrGetStr(new StrValue("indigo")),
                                i7 = new IrInstrLessEq(i2, i6),
                                i8 = new IrInstrUpsilon(i7, _i),
                            ],
                            jump: j9 = new IrDirectJump(_b),
                        }),
                        b10 = new IrBasicBlock({
                            instrs: [
                                i11 = new IrInstrGetFalse(),
                                i12 = new IrInstrUpsilon(i11, _i),
                            ],
                            jump: j13 = new IrDirectJump(_b),
                        }),
                        b14 = new IrBasicBlock({
                            instrs: [
                                i15 = new IrInstrPhi(),
                            ],
                        }),
                    ],
                }),
            ],
            fixups: () => {
                j4.trueTarget = b5;
                j4.falseTarget = b10;
                i8.phi = i15;
                j9.target = b14;
                i12.phi = i15;
                j13.target = b14;
            },
        });

        t.is(run(ir), "true");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let i3: IrInstr;
        let j4: IrBranchJump;
        let b5: IrBasicBlock;
        let i6: IrInstr;
        let i7: IrInstr;
        let i8: IrInstrUpsilon;
        let j9: IrDirectJump;
        let b10: IrBasicBlock;
        let i11: IrInstr;
        let i12: IrInstrUpsilon;
        let j13: IrDirectJump;
        let b14: IrBasicBlock;
        let i15: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetStr(new StrValue("crab")),
                                i2 = new IrInstrGetStr(new StrValue("indigo")),
                                i3 = new IrInstrLess(i1, i2),
                            ],
                            jump: j4 = new IrBranchJump(i3, _b, _b),
                        }),
                        b5 = new IrBasicBlock({
                            instrs: [
                                i6 = new IrInstrGetStr(new StrValue("fusion")),
                                i7 = new IrInstrLessEq(i2, i6),
                                i8 = new IrInstrUpsilon(i7, _i),
                            ],
                            jump: j9 = new IrDirectJump(_b),
                        }),
                        b10 = new IrBasicBlock({
                            instrs: [
                                i11 = new IrInstrGetFalse(),
                                i12 = new IrInstrUpsilon(i11, _i),
                            ],
                            jump: j13 = new IrDirectJump(_b),
                        }),
                        b14 = new IrBasicBlock({
                            instrs: [
                                i15 = new IrInstrPhi(),
                            ],
                        }),
                    ],
                }),
            ],
            fixups: () => {
                j4.trueTarget = b5;
                j4.falseTarget = b10;
                i8.phi = i15;
                j9.target = b14;
                i12.phi = i15;
                j13.target = b14;
            },
        });

        t.is(run(ir), "false");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let i3: IrInstr;
        let j4: IrBranchJump;
        let b5: IrBasicBlock;
        let i6: IrInstr;
        let i7: IrInstr;
        let i8: IrInstrUpsilon;
        let j9: IrDirectJump;
        let b10: IrBasicBlock;
        let i11: IrInstr;
        let i12: IrInstrUpsilon;
        let j13: IrDirectJump;
        let b14: IrBasicBlock;
        let i15: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetStr(new StrValue("fusion")),
                                i2 = new IrInstrGetStr(new StrValue("crab")),
                                i3 = new IrInstrLess(i1, i2),
                            ],
                            jump: j4 = new IrBranchJump(i3, _b, _b),
                        }),
                        b5 = new IrBasicBlock({
                            instrs: [
                                i6 = new IrInstrGetStr(new StrValue("indigo")),
                                i7 = new IrInstrLessEq(i2, i6),
                                i8 = new IrInstrUpsilon(i7, _i),
                            ],
                            jump: j9 = new IrDirectJump(_b),
                        }),
                        b10 = new IrBasicBlock({
                            instrs: [
                                i11 = new IrInstrGetFalse(),
                                i12 = new IrInstrUpsilon(i11, _i),
                            ],
                            jump: j13 = new IrDirectJump(_b),
                        }),
                        b14 = new IrBasicBlock({
                            instrs: [
                                i15 = new IrInstrPhi(),
                            ],
                        }),
                    ],
                }),
            ],
            fixups: () => {
                j4.trueTarget = b5;
                j4.falseTarget = b10;
                i8.phi = i15;
                j9.target = b14;
                i12.phi = i15;
                j13.target = b14;
            },
        });

        t.is(run(ir), "false");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let i3: IrInstr;
        let j4: IrBranchJump;
        let b5: IrBasicBlock;
        let i6: IrInstr;
        let i7: IrInstr;
        let i8: IrInstrUpsilon;
        let j9: IrDirectJump;
        let b10: IrBasicBlock;
        let i11: IrInstr;
        let i12: IrInstrUpsilon;
        let j13: IrDirectJump;
        let b14: IrBasicBlock;
        let i15: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetStr(new StrValue("crab")),
                                i2 = new IrInstrGetStr(new StrValue("fusion")),
                                i3 = new IrInstrLess(i1, i2),
                            ],
                            jump: j4 = new IrBranchJump(i3, _b, _b),
                        }),
                        b5 = new IrBasicBlock({
                            instrs: [
                                i6 = new IrInstrGetStr(new StrValue("fusion")),
                                i7 = new IrInstrLessEq(i2, i6),
                                i8 = new IrInstrUpsilon(i7, _i),
                            ],
                            jump: j9 = new IrDirectJump(_b),
                        }),
                        b10 = new IrBasicBlock({
                            instrs: [
                                i11 = new IrInstrGetFalse(),
                                i12 = new IrInstrUpsilon(i11, _i),
                            ],
                            jump: j13 = new IrDirectJump(_b),
                        }),
                        b14 = new IrBasicBlock({
                            instrs: [
                                i15 = new IrInstrPhi(),
                            ],
                        }),
                    ],
                }),
            ],
            fixups: () => {
                j4.trueTarget = b5;
                j4.falseTarget = b10;
                i8.phi = i15;
                j9.target = b14;
                i12.phi = i15;
                j13.target = b14;
            },
        });

        t.is(run(ir), "true");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetInt(new IntValue(2n)),
                                i2 = new IrInstrGetInt(new IntValue(1n)),
                                new IrInstrGreater(i1, i2),
                            ],
                        }),
                    ],
                }),
            ],
        });

        t.is(run(ir), "true");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetInt(new IntValue(1n)),
                                i2 = new IrInstrGetInt(new IntValue(2n)),
                                new IrInstrGreater(i1, i2),
                            ],
                        }),
                    ],
                }),
            ],
        });

        t.is(run(ir), "false");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetInt(new IntValue(3n)),
                                i2 = new IrInstrGetInt(new IntValue(3n)),
                                new IrInstrGreater(i1, i2),
                            ],
                        }),
                    ],
                }),
            ],
        });

        t.is(run(ir), "false");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let i3: IrInstr;
        let j4: IrBranchJump;
        let b5: IrBasicBlock;
        let i6: IrInstr;
        let i7: IrInstr;
        let i8: IrInstrUpsilon;
        let j9: IrDirectJump;
        let b10: IrBasicBlock;
        let i11: IrInstr;
        let i12: IrInstrUpsilon;
        let j13: IrDirectJump;
        let b14: IrBasicBlock;
        let i15: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetInt(new IntValue(9n)),
                                i2 = new IrInstrGetInt(new IntValue(6n)),
                                i3 = new IrInstrGreater(i1, i2),
                            ],
                            jump: j4 = new IrBranchJump(i3, _b, _b),
                        }),
                        b5 = new IrBasicBlock({
                            instrs: [
                                i6 = new IrInstrGetInt(new IntValue(3n)),
                                i7 = new IrInstrGreater(i2, i6),
                                i8 = new IrInstrUpsilon(i7, _i),
                            ],
                            jump: j9 = new IrDirectJump(_b),
                        }),
                        b10 = new IrBasicBlock({
                            instrs: [
                                i11 = new IrInstrGetFalse(),
                                i12 = new IrInstrUpsilon(i11, _i),
                            ],
                            jump: j13 = new IrDirectJump(_b),
                        }),
                        b14 = new IrBasicBlock({
                            instrs: [
                                i15 = new IrInstrPhi(),
                            ],
                        }),
                    ],
                }),
            ],
            fixups: () => {
                j4.trueTarget = b5;
                j4.falseTarget = b10;
                i8.phi = i15;
                j9.target = b14;
                i12.phi = i15;
                j13.target = b14;
            },
        });

        t.is(run(ir), "true");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let i3: IrInstr;
        let j4: IrBranchJump;
        let b5: IrBasicBlock;
        let i6: IrInstr;
        let i7: IrInstr;
        let i8: IrInstrUpsilon;
        let j9: IrDirectJump;
        let b10: IrBasicBlock;
        let i11: IrInstr;
        let i12: IrInstrUpsilon;
        let j13: IrDirectJump;
        let b14: IrBasicBlock;
        let i15: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetInt(new IntValue(6n)),
                                i2 = new IrInstrGetInt(new IntValue(9n)),
                                i3 = new IrInstrGreater(i1, i2),
                            ],
                            jump: j4 = new IrBranchJump(i3, _b, _b),
                        }),
                        b5 = new IrBasicBlock({
                            instrs: [
                                i6 = new IrInstrGetInt(new IntValue(3n)),
                                i7 = new IrInstrGreater(i2, i6),
                                i8 = new IrInstrUpsilon(i7, _i),
                            ],
                            jump: j9 = new IrDirectJump(_b),
                        }),
                        b10 = new IrBasicBlock({
                            instrs: [
                                i11 = new IrInstrGetFalse(),
                                i12 = new IrInstrUpsilon(i11, _i),
                            ],
                            jump: j13 = new IrDirectJump(_b),
                        }),
                        b14 = new IrBasicBlock({
                            instrs: [
                                i15 = new IrInstrPhi(),
                            ],
                        }),
                    ],
                }),
            ],
            fixups: () => {
                j4.trueTarget = b5;
                j4.falseTarget = b10;
                i8.phi = i15;
                j9.target = b14;
                i12.phi = i15;
                j13.target = b14;
            },
        });

        t.is(run(ir), "false");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let i3: IrInstr;
        let j4: IrBranchJump;
        let b5: IrBasicBlock;
        let i6: IrInstr;
        let i7: IrInstr;
        let i8: IrInstrUpsilon;
        let j9: IrDirectJump;
        let b10: IrBasicBlock;
        let i11: IrInstr;
        let i12: IrInstrUpsilon;
        let j13: IrDirectJump;
        let b14: IrBasicBlock;
        let i15: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetInt(new IntValue(9n)),
                                i2 = new IrInstrGetInt(new IntValue(3n)),
                                i3 = new IrInstrGreater(i1, i2),
                            ],
                            jump: j4 = new IrBranchJump(i3, _b, _b),
                        }),
                        b5 = new IrBasicBlock({
                            instrs: [
                                i6 = new IrInstrGetInt(new IntValue(6n)),
                                i7 = new IrInstrGreater(i2, i6),
                                i8 = new IrInstrUpsilon(i7, _i),
                            ],
                            jump: j9 = new IrDirectJump(_b),
                        }),
                        b10 = new IrBasicBlock({
                            instrs: [
                                i11 = new IrInstrGetFalse(),
                                i12 = new IrInstrUpsilon(i11, _i),
                            ],
                            jump: j13 = new IrDirectJump(_b),
                        }),
                        b14 = new IrBasicBlock({
                            instrs: [
                                i15 = new IrInstrPhi(),
                            ],
                        }),
                    ],
                }),
            ],
            fixups: () => {
                j4.trueTarget = b5;
                j4.falseTarget = b10;
                i8.phi = i15;
                j9.target = b14;
                i12.phi = i15;
                j13.target = b14;
            },
        });

        t.is(run(ir), "false");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let i3: IrInstr;
        let j4: IrBranchJump;
        let b5: IrBasicBlock;
        let i6: IrInstr;
        let i7: IrInstr;
        let i8: IrInstrUpsilon;
        let j9: IrDirectJump;
        let b10: IrBasicBlock;
        let i11: IrInstr;
        let i12: IrInstrUpsilon;
        let j13: IrDirectJump;
        let b14: IrBasicBlock;
        let i15: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetInt(new IntValue(6n)),
                                i2 = new IrInstrGetInt(new IntValue(6n)),
                                i3 = new IrInstrGreater(i1, i2),
                            ],
                            jump: j4 = new IrBranchJump(i3, _b, _b),
                        }),
                        b5 = new IrBasicBlock({
                            instrs: [
                                i6 = new IrInstrGetInt(new IntValue(3n)),
                                i7 = new IrInstrGreater(i2, i6),
                                i8 = new IrInstrUpsilon(i7, _i),
                            ],
                            jump: j9 = new IrDirectJump(_b),
                        }),
                        b10 = new IrBasicBlock({
                            instrs: [
                                i11 = new IrInstrGetFalse(),
                                i12 = new IrInstrUpsilon(i11, _i),
                            ],
                            jump: j13 = new IrDirectJump(_b),
                        }),
                        b14 = new IrBasicBlock({
                            instrs: [
                                i15 = new IrInstrPhi(),
                            ],
                        }),
                    ],
                }),
            ],
            fixups: () => {
                j4.trueTarget = b5;
                j4.falseTarget = b10;
                i8.phi = i15;
                j9.target = b14;
                i12.phi = i15;
                j13.target = b14;
            },
        });

        t.is(run(ir), "false");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetInt(new IntValue(2n)),
                                i2 = new IrInstrGetInt(new IntValue(1n)),
                                new IrInstrGreaterEq(i1, i2),
                            ],
                        }),
                    ],
                }),
            ],
        });

        t.is(run(ir), "true");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetInt(new IntValue(1n)),
                                i2 = new IrInstrGetInt(new IntValue(2n)),
                                new IrInstrGreaterEq(i1, i2),
                            ],
                        }),
                    ],
                }),
            ],
        });

        t.is(run(ir), "false");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetInt(new IntValue(3n)),
                                i2 = new IrInstrGetInt(new IntValue(3n)),
                                new IrInstrGreaterEq(i1, i2),
                            ],
                        }),
                    ],
                }),
            ],
        });

        t.is(run(ir), "true");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let i3: IrInstr;
        let j4: IrBranchJump;
        let b5: IrBasicBlock;
        let i6: IrInstr;
        let i7: IrInstr;
        let i8: IrInstrUpsilon;
        let j9: IrDirectJump;
        let b10: IrBasicBlock;
        let i11: IrInstr;
        let i12: IrInstrUpsilon;
        let j13: IrDirectJump;
        let b14: IrBasicBlock;
        let i15: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetInt(new IntValue(9n)),
                                i2 = new IrInstrGetInt(new IntValue(6n)),
                                i3 = new IrInstrGreaterEq(i1, i2),
                            ],
                            jump: j4 = new IrBranchJump(i3, _b, _b),
                        }),
                        b5 = new IrBasicBlock({
                            instrs: [
                                i6 = new IrInstrGetInt(new IntValue(3n)),
                                i7 = new IrInstrGreaterEq(i2, i6),
                                i8 = new IrInstrUpsilon(i7, _i),
                            ],
                            jump: j9 = new IrDirectJump(_b),
                        }),
                        b10 = new IrBasicBlock({
                            instrs: [
                                i11 = new IrInstrGetFalse(),
                                i12 = new IrInstrUpsilon(i11, _i),
                            ],
                            jump: j13 = new IrDirectJump(_b),
                        }),
                        b14 = new IrBasicBlock({
                            instrs: [
                                i15 = new IrInstrPhi(),
                            ],
                        }),
                    ],
                }),
            ],
            fixups: () => {
                j4.trueTarget = b5;
                j4.falseTarget = b10;
                i8.phi = i15;
                j9.target = b14;
                i12.phi = i15;
                j13.target = b14;
            },
        });

        t.is(run(ir), "true");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let i3: IrInstr;
        let j4: IrBranchJump;
        let b5: IrBasicBlock;
        let i6: IrInstr;
        let i7: IrInstr;
        let i8: IrInstrUpsilon;
        let j9: IrDirectJump;
        let b10: IrBasicBlock;
        let i11: IrInstr;
        let i12: IrInstrUpsilon;
        let j13: IrDirectJump;
        let b14: IrBasicBlock;
        let i15: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetInt(new IntValue(6n)),
                                i2 = new IrInstrGetInt(new IntValue(9n)),
                                i3 = new IrInstrGreaterEq(i1, i2),
                            ],
                            jump: j4 = new IrBranchJump(i3, _b, _b),
                        }),
                        b5 = new IrBasicBlock({
                            instrs: [
                                i6 = new IrInstrGetInt(new IntValue(3n)),
                                i7 = new IrInstrGreaterEq(i2, i6),
                                i8 = new IrInstrUpsilon(i7, _i),
                            ],
                            jump: j9 = new IrDirectJump(_b),
                        }),
                        b10 = new IrBasicBlock({
                            instrs: [
                                i11 = new IrInstrGetFalse(),
                                i12 = new IrInstrUpsilon(i11, _i),
                            ],
                            jump: j13 = new IrDirectJump(_b),
                        }),
                        b14 = new IrBasicBlock({
                            instrs: [
                                i15 = new IrInstrPhi(),
                            ],
                        }),
                    ],
                }),
            ],
            fixups: () => {
                j4.trueTarget = b5;
                j4.falseTarget = b10;
                i8.phi = i15;
                j9.target = b14;
                i12.phi = i15;
                j13.target = b14;
            },
        });

        t.is(run(ir), "false");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let i3: IrInstr;
        let j4: IrBranchJump;
        let b5: IrBasicBlock;
        let i6: IrInstr;
        let i7: IrInstr;
        let i8: IrInstrUpsilon;
        let j9: IrDirectJump;
        let b10: IrBasicBlock;
        let i11: IrInstr;
        let i12: IrInstrUpsilon;
        let j13: IrDirectJump;
        let b14: IrBasicBlock;
        let i15: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetInt(new IntValue(9n)),
                                i2 = new IrInstrGetInt(new IntValue(3n)),
                                i3 = new IrInstrGreaterEq(i1, i2),
                            ],
                            jump: j4 = new IrBranchJump(i3, _b, _b),
                        }),
                        b5 = new IrBasicBlock({
                            instrs: [
                                i6 = new IrInstrGetInt(new IntValue(6n)),
                                i7 = new IrInstrGreaterEq(i2, i6),
                                i8 = new IrInstrUpsilon(i7, _i),
                            ],
                            jump: j9 = new IrDirectJump(_b),
                        }),
                        b10 = new IrBasicBlock({
                            instrs: [
                                i11 = new IrInstrGetFalse(),
                                i12 = new IrInstrUpsilon(i11, _i),
                            ],
                            jump: j13 = new IrDirectJump(_b),
                        }),
                        b14 = new IrBasicBlock({
                            instrs: [
                                i15 = new IrInstrPhi(),
                            ],
                        }),
                    ],
                }),
            ],
            fixups: () => {
                j4.trueTarget = b5;
                j4.falseTarget = b10;
                i8.phi = i15;
                j9.target = b14;
                i12.phi = i15;
                j13.target = b14;
            },
        });

        t.is(run(ir), "false");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let i3: IrInstr;
        let j4: IrBranchJump;
        let b5: IrBasicBlock;
        let i6: IrInstr;
        let i7: IrInstr;
        let i8: IrInstrUpsilon;
        let j9: IrDirectJump;
        let b10: IrBasicBlock;
        let i11: IrInstr;
        let i12: IrInstrUpsilon;
        let j13: IrDirectJump;
        let b14: IrBasicBlock;
        let i15: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetInt(new IntValue(6n)),
                                i2 = new IrInstrGetInt(new IntValue(6n)),
                                i3 = new IrInstrGreaterEq(i1, i2),
                            ],
                            jump: j4 = new IrBranchJump(i3, _b, _b),
                        }),
                        b5 = new IrBasicBlock({
                            instrs: [
                                i6 = new IrInstrGetInt(new IntValue(3n)),
                                i7 = new IrInstrGreaterEq(i2, i6),
                                i8 = new IrInstrUpsilon(i7, _i),
                            ],
                            jump: j9 = new IrDirectJump(_b),
                        }),
                        b10 = new IrBasicBlock({
                            instrs: [
                                i11 = new IrInstrGetFalse(),
                                i12 = new IrInstrUpsilon(i11, _i),
                            ],
                            jump: j13 = new IrDirectJump(_b),
                        }),
                        b14 = new IrBasicBlock({
                            instrs: [
                                i15 = new IrInstrPhi(),
                            ],
                        }),
                    ],
                }),
            ],
            fixups: () => {
                j4.trueTarget = b5;
                j4.falseTarget = b10;
                i8.phi = i15;
                j9.target = b14;
                i12.phi = i15;
                j13.target = b14;
            },
        });

        t.is(run(ir), "true");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let i3: IrInstr;
        let j4: IrBranchJump;
        let b5: IrBasicBlock;
        let i6: IrInstr;
        let i7: IrInstr;
        let i8: IrInstrUpsilon;
        let j9: IrDirectJump;
        let b10: IrBasicBlock;
        let i11: IrInstr;
        let i12: IrInstrUpsilon;
        let j13: IrDirectJump;
        let b14: IrBasicBlock;
        let i15: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetInt(new IntValue(9n)),
                                i2 = new IrInstrGetInt(new IntValue(6n)),
                                i3 = new IrInstrGreaterEq(i1, i2),
                            ],
                            jump: j4 = new IrBranchJump(i3, _b, _b),
                        }),
                        b5 = new IrBasicBlock({
                            instrs: [
                                i6 = new IrInstrGetInt(new IntValue(3n)),
                                i7 = new IrInstrGreater(i2, i6),
                                i8 = new IrInstrUpsilon(i7, _i),
                            ],
                            jump: j9 = new IrDirectJump(_b),
                        }),
                        b10 = new IrBasicBlock({
                            instrs: [
                                i11 = new IrInstrGetFalse(),
                                i12 = new IrInstrUpsilon(i11, _i),
                            ],
                            jump: j13 = new IrDirectJump(_b),
                        }),
                        b14 = new IrBasicBlock({
                            instrs: [
                                i15 = new IrInstrPhi(),
                            ],
                        }),
                    ],
                }),
            ],
            fixups: () => {
                j4.trueTarget = b5;
                j4.falseTarget = b10;
                i8.phi = i15;
                j9.target = b14;
                i12.phi = i15;
                j13.target = b14;
            },
        });

        t.is(run(ir), "true");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let i3: IrInstr;
        let j4: IrBranchJump;
        let b5: IrBasicBlock;
        let i6: IrInstr;
        let i7: IrInstr;
        let i8: IrInstrUpsilon;
        let j9: IrDirectJump;
        let b10: IrBasicBlock;
        let i11: IrInstr;
        let i12: IrInstrUpsilon;
        let j13: IrDirectJump;
        let b14: IrBasicBlock;
        let i15: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetInt(new IntValue(6n)),
                                i2 = new IrInstrGetInt(new IntValue(9n)),
                                i3 = new IrInstrGreaterEq(i1, i2),
                            ],
                            jump: j4 = new IrBranchJump(i3, _b, _b),
                        }),
                        b5 = new IrBasicBlock({
                            instrs: [
                                i6 = new IrInstrGetInt(new IntValue(3n)),
                                i7 = new IrInstrGreater(i2, i6),
                                i8 = new IrInstrUpsilon(i7, _i),
                            ],
                            jump: j9 = new IrDirectJump(_b),
                        }),
                        b10 = new IrBasicBlock({
                            instrs: [
                                i11 = new IrInstrGetFalse(),
                                i12 = new IrInstrUpsilon(i11, _i),
                            ],
                            jump: j13 = new IrDirectJump(_b),
                        }),
                        b14 = new IrBasicBlock({
                            instrs: [
                                i15 = new IrInstrPhi(),
                            ],
                        }),
                    ],
                }),
            ],
            fixups: () => {
                j4.trueTarget = b5;
                j4.falseTarget = b10;
                i8.phi = i15;
                j9.target = b14;
                i12.phi = i15;
                j13.target = b14;
            },
        });

        t.is(run(ir), "false");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let i3: IrInstr;
        let j4: IrBranchJump;
        let b5: IrBasicBlock;
        let i6: IrInstr;
        let i7: IrInstr;
        let i8: IrInstrUpsilon;
        let j9: IrDirectJump;
        let b10: IrBasicBlock;
        let i11: IrInstr;
        let i12: IrInstrUpsilon;
        let j13: IrDirectJump;
        let b14: IrBasicBlock;
        let i15: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetInt(new IntValue(9n)),
                                i2 = new IrInstrGetInt(new IntValue(3n)),
                                i3 = new IrInstrGreaterEq(i1, i2),
                            ],
                            jump: j4 = new IrBranchJump(i3, _b, _b),
                        }),
                        b5 = new IrBasicBlock({
                            instrs: [
                                i6 = new IrInstrGetInt(new IntValue(6n)),
                                i7 = new IrInstrGreater(i2, i6),
                                i8 = new IrInstrUpsilon(i7, _i),
                            ],
                            jump: j9 = new IrDirectJump(_b),
                        }),
                        b10 = new IrBasicBlock({
                            instrs: [
                                i11 = new IrInstrGetFalse(),
                                i12 = new IrInstrUpsilon(i11, _i),
                            ],
                            jump: j13 = new IrDirectJump(_b),
                        }),
                        b14 = new IrBasicBlock({
                            instrs: [
                                i15 = new IrInstrPhi(),
                            ],
                        }),
                    ],
                }),
            ],
            fixups: () => {
                j4.trueTarget = b5;
                j4.falseTarget = b10;
                i8.phi = i15;
                j9.target = b14;
                i12.phi = i15;
                j13.target = b14;
            },
        });

        t.is(run(ir), "false");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let i3: IrInstr;
        let j4: IrBranchJump;
        let b5: IrBasicBlock;
        let i6: IrInstr;
        let i7: IrInstr;
        let i8: IrInstrUpsilon;
        let j9: IrDirectJump;
        let b10: IrBasicBlock;
        let i11: IrInstr;
        let i12: IrInstrUpsilon;
        let j13: IrDirectJump;
        let b14: IrBasicBlock;
        let i15: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetInt(new IntValue(6n)),
                                i2 = new IrInstrGetInt(new IntValue(6n)),
                                i3 = new IrInstrGreaterEq(i1, i2),
                            ],
                            jump: j4 = new IrBranchJump(i3, _b, _b),
                        }),
                        b5 = new IrBasicBlock({
                            instrs: [
                                i6 = new IrInstrGetInt(new IntValue(3n)),
                                i7 = new IrInstrGreater(i2, i6),
                                i8 = new IrInstrUpsilon(i7, _i),
                            ],
                            jump: j9 = new IrDirectJump(_b),
                        }),
                        b10 = new IrBasicBlock({
                            instrs: [
                                i11 = new IrInstrGetFalse(),
                                i12 = new IrInstrUpsilon(i11, _i),
                            ],
                            jump: j13 = new IrDirectJump(_b),
                        }),
                        b14 = new IrBasicBlock({
                            instrs: [
                                i15 = new IrInstrPhi(),
                            ],
                        }),
                    ],
                }),
            ],
            fixups: () => {
                j4.trueTarget = b5;
                j4.falseTarget = b10;
                i8.phi = i15;
                j9.target = b14;
                i12.phi = i15;
                j13.target = b14;
            },
        });

        t.is(run(ir), "true");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetStr(new StrValue("abc")),
                                i2 = new IrInstrGetStr(new StrValue("ab")),
                                new IrInstrGreater(i1, i2),
                            ],
                        }),
                    ],
                }),
            ],
        });

        t.is(run(ir), "true");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetStr(new StrValue("ab")),
                                i2 = new IrInstrGetStr(new StrValue("abc")),
                                new IrInstrGreater(i1, i2),
                            ],
                        }),
                    ],
                }),
            ],
        });

        t.is(run(ir), "false");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetStr(new StrValue("crab")),
                                i2 = new IrInstrGetStr(new StrValue("crab")),
                                new IrInstrGreater(i1, i2),
                            ],
                        }),
                    ],
                }),
            ],
        });

        t.is(run(ir), "false");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let i3: IrInstr;
        let j4: IrBranchJump;
        let b5: IrBasicBlock;
        let i6: IrInstr;
        let i7: IrInstr;
        let i8: IrInstrUpsilon;
        let j9: IrDirectJump;
        let b10: IrBasicBlock;
        let i11: IrInstr;
        let i12: IrInstrUpsilon;
        let j13: IrDirectJump;
        let b14: IrBasicBlock;
        let i15: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetStr(new StrValue("indigo")),
                                i2 = new IrInstrGetStr(new StrValue("fusion")),
                                i3 = new IrInstrGreater(i1, i2),
                            ],
                            jump: j4 = new IrBranchJump(i3, _b, _b),
                        }),
                        b5 = new IrBasicBlock({
                            instrs: [
                                i6 = new IrInstrGetStr(new StrValue("crab")),
                                i7 = new IrInstrGreater(i2, i6),
                                i8 = new IrInstrUpsilon(i7, _i),
                            ],
                            jump: j9 = new IrDirectJump(_b),
                        }),
                        b10 = new IrBasicBlock({
                            instrs: [
                                i11 = new IrInstrGetFalse(),
                                i12 = new IrInstrUpsilon(i11, _i),
                            ],
                            jump: j13 = new IrDirectJump(_b),
                        }),
                        b14 = new IrBasicBlock({
                            instrs: [
                                i15 = new IrInstrPhi(),
                            ],
                        }),
                    ],
                }),
            ],
            fixups: () => {
                j4.trueTarget = b5;
                j4.falseTarget = b10;
                i8.phi = i15;
                j9.target = b14;
                i12.phi = i15;
                j13.target = b14;
            },
        });

        t.is(run(ir), "true");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let i3: IrInstr;
        let j4: IrBranchJump;
        let b5: IrBasicBlock;
        let i6: IrInstr;
        let i7: IrInstr;
        let i8: IrInstrUpsilon;
        let j9: IrDirectJump;
        let b10: IrBasicBlock;
        let i11: IrInstr;
        let i12: IrInstrUpsilon;
        let j13: IrDirectJump;
        let b14: IrBasicBlock;
        let i15: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetStr(new StrValue("fusion")),
                                i2 = new IrInstrGetStr(new StrValue("indigo")),
                                i3 = new IrInstrGreater(i1, i2),
                            ],
                            jump: j4 = new IrBranchJump(i3, _b, _b),
                        }),
                        b5 = new IrBasicBlock({
                            instrs: [
                                i6 = new IrInstrGetStr(new StrValue("crab")),
                                i7 = new IrInstrGreater(i2, i6),
                                i8 = new IrInstrUpsilon(i7, _i),
                            ],
                            jump: j9 = new IrDirectJump(_b),
                        }),
                        b10 = new IrBasicBlock({
                            instrs: [
                                i11 = new IrInstrGetFalse(),
                                i12 = new IrInstrUpsilon(i11, _i),
                            ],
                            jump: j13 = new IrDirectJump(_b),
                        }),
                        b14 = new IrBasicBlock({
                            instrs: [
                                i15 = new IrInstrPhi(),
                            ],
                        }),
                    ],
                }),
            ],
            fixups: () => {
                j4.trueTarget = b5;
                j4.falseTarget = b10;
                i8.phi = i15;
                j9.target = b14;
                i12.phi = i15;
                j13.target = b14;
            },
        });

        t.is(run(ir), "false");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let i3: IrInstr;
        let j4: IrBranchJump;
        let b5: IrBasicBlock;
        let i6: IrInstr;
        let i7: IrInstr;
        let i8: IrInstrUpsilon;
        let j9: IrDirectJump;
        let b10: IrBasicBlock;
        let i11: IrInstr;
        let i12: IrInstrUpsilon;
        let j13: IrDirectJump;
        let b14: IrBasicBlock;
        let i15: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetStr(new StrValue("indigo")),
                                i2 = new IrInstrGetStr(new StrValue("crab")),
                                i3 = new IrInstrGreater(i1, i2),
                            ],
                            jump: j4 = new IrBranchJump(i3, _b, _b),
                        }),
                        b5 = new IrBasicBlock({
                            instrs: [
                                i6 = new IrInstrGetStr(new StrValue("fusion")),
                                i7 = new IrInstrGreater(i2, i6),
                                i8 = new IrInstrUpsilon(i7, _i),
                            ],
                            jump: j9 = new IrDirectJump(_b),
                        }),
                        b10 = new IrBasicBlock({
                            instrs: [
                                i11 = new IrInstrGetFalse(),
                                i12 = new IrInstrUpsilon(i11, _i),
                            ],
                            jump: j13 = new IrDirectJump(_b),
                        }),
                        b14 = new IrBasicBlock({
                            instrs: [
                                i15 = new IrInstrPhi(),
                            ],
                        }),
                    ],
                }),
            ],
            fixups: () => {
                j4.trueTarget = b5;
                j4.falseTarget = b10;
                i8.phi = i15;
                j9.target = b14;
                i12.phi = i15;
                j13.target = b14;
            },
        });

        t.is(run(ir), "false");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let i3: IrInstr;
        let j4: IrBranchJump;
        let b5: IrBasicBlock;
        let i6: IrInstr;
        let i7: IrInstr;
        let i8: IrInstrUpsilon;
        let j9: IrDirectJump;
        let b10: IrBasicBlock;
        let i11: IrInstr;
        let i12: IrInstrUpsilon;
        let j13: IrDirectJump;
        let b14: IrBasicBlock;
        let i15: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetStr(new StrValue("fusion")),
                                i2 = new IrInstrGetStr(new StrValue("fusion")),
                                i3 = new IrInstrGreater(i1, i2),
                            ],
                            jump: j4 = new IrBranchJump(i3, _b, _b),
                        }),
                        b5 = new IrBasicBlock({
                            instrs: [
                                i6 = new IrInstrGetStr(new StrValue("crab")),
                                i7 = new IrInstrGreater(i2, i6),
                                i8 = new IrInstrUpsilon(i7, _i),
                            ],
                            jump: j9 = new IrDirectJump(_b),
                        }),
                        b10 = new IrBasicBlock({
                            instrs: [
                                i11 = new IrInstrGetFalse(),
                                i12 = new IrInstrUpsilon(i11, _i),
                            ],
                            jump: j13 = new IrDirectJump(_b),
                        }),
                        b14 = new IrBasicBlock({
                            instrs: [
                                i15 = new IrInstrPhi(),
                            ],
                        }),
                    ],
                }),
            ],
            fixups: () => {
                j4.trueTarget = b5;
                j4.falseTarget = b10;
                i8.phi = i15;
                j9.target = b14;
                i12.phi = i15;
                j13.target = b14;
            },
        });

        t.is(run(ir), "false");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetStr(new StrValue("abc")),
                                i2 = new IrInstrGetStr(new StrValue("ab")),
                                new IrInstrGreaterEq(i1, i2),
                            ],
                        }),
                    ],
                }),
            ],
        });

        t.is(run(ir), "true");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetStr(new StrValue("ab")),
                                i2 = new IrInstrGetStr(new StrValue("abc")),
                                new IrInstrGreaterEq(i1, i2),
                            ],
                        }),
                    ],
                }),
            ],
        });

        t.is(run(ir), "false");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetStr(new StrValue("crab")),
                                i2 = new IrInstrGetStr(new StrValue("crab")),
                                new IrInstrGreaterEq(i1, i2),
                            ],
                        }),
                    ],
                }),
            ],
        });

        t.is(run(ir), "true");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let i3: IrInstr;
        let j4: IrBranchJump;
        let b5: IrBasicBlock;
        let i6: IrInstr;
        let i7: IrInstr;
        let i8: IrInstrUpsilon;
        let j9: IrDirectJump;
        let b10: IrBasicBlock;
        let i11: IrInstr;
        let i12: IrInstrUpsilon;
        let j13: IrDirectJump;
        let b14: IrBasicBlock;
        let i15: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetStr(new StrValue("indigo")),
                                i2 = new IrInstrGetStr(new StrValue("fusion")),
                                i3 = new IrInstrGreaterEq(i1, i2),
                            ],
                            jump: j4 = new IrBranchJump(i3, _b, _b),
                        }),
                        b5 = new IrBasicBlock({
                            instrs: [
                                i6 = new IrInstrGetStr(new StrValue("crab")),
                                i7 = new IrInstrGreaterEq(i2, i6),
                                i8 = new IrInstrUpsilon(i7, _i),
                            ],
                            jump: j9 = new IrDirectJump(_b),
                        }),
                        b10 = new IrBasicBlock({
                            instrs: [
                                i11 = new IrInstrGetFalse(),
                                i12 = new IrInstrUpsilon(i11, _i),
                            ],
                            jump: j13 = new IrDirectJump(_b),
                        }),
                        b14 = new IrBasicBlock({
                            instrs: [
                                i15 = new IrInstrPhi(),
                            ],
                        }),
                    ],
                }),
            ],
            fixups: () => {
                j4.trueTarget = b5;
                j4.falseTarget = b10;
                i8.phi = i15;
                j9.target = b14;
                i12.phi = i15;
                j13.target = b14;
            },
        });

        t.is(run(ir), "true");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let i3: IrInstr;
        let j4: IrBranchJump;
        let b5: IrBasicBlock;
        let i6: IrInstr;
        let i7: IrInstr;
        let i8: IrInstrUpsilon;
        let j9: IrDirectJump;
        let b10: IrBasicBlock;
        let i11: IrInstr;
        let i12: IrInstrUpsilon;
        let j13: IrDirectJump;
        let b14: IrBasicBlock;
        let i15: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetStr(new StrValue("fusion")),
                                i2 = new IrInstrGetStr(new StrValue("indigo")),
                                i3 = new IrInstrGreaterEq(i1, i2),
                            ],
                            jump: j4 = new IrBranchJump(i3, _b, _b),
                        }),
                        b5 = new IrBasicBlock({
                            instrs: [
                                i6 = new IrInstrGetStr(new StrValue("crab")),
                                i7 = new IrInstrGreaterEq(i2, i6),
                                i8 = new IrInstrUpsilon(i7, _i),
                            ],
                            jump: j9 = new IrDirectJump(_b),
                        }),
                        b10 = new IrBasicBlock({
                            instrs: [
                                i11 = new IrInstrGetFalse(),
                                i12 = new IrInstrUpsilon(i11, _i),
                            ],
                            jump: j13 = new IrDirectJump(_b),
                        }),
                        b14 = new IrBasicBlock({
                            instrs: [
                                i15 = new IrInstrPhi(),
                            ],
                        }),
                    ],
                }),
            ],
            fixups: () => {
                j4.trueTarget = b5;
                j4.falseTarget = b10;
                i8.phi = i15;
                j9.target = b14;
                i12.phi = i15;
                j13.target = b14;
            },
        });

        t.is(run(ir), "false");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let i3: IrInstr;
        let j4: IrBranchJump;
        let b5: IrBasicBlock;
        let i6: IrInstr;
        let i7: IrInstr;
        let i8: IrInstrUpsilon;
        let j9: IrDirectJump;
        let b10: IrBasicBlock;
        let i11: IrInstr;
        let i12: IrInstrUpsilon;
        let j13: IrDirectJump;
        let b14: IrBasicBlock;
        let i15: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetStr(new StrValue("indigo")),
                                i2 = new IrInstrGetStr(new StrValue("crab")),
                                i3 = new IrInstrGreaterEq(i1, i2),
                            ],
                            jump: j4 = new IrBranchJump(i3, _b, _b),
                        }),
                        b5 = new IrBasicBlock({
                            instrs: [
                                i6 = new IrInstrGetStr(new StrValue("fusion")),
                                i7 = new IrInstrGreaterEq(i2, i6),
                                i8 = new IrInstrUpsilon(i7, _i),
                            ],
                            jump: j9 = new IrDirectJump(_b),
                        }),
                        b10 = new IrBasicBlock({
                            instrs: [
                                i11 = new IrInstrGetFalse(),
                                i12 = new IrInstrUpsilon(i11, _i),
                            ],
                            jump: j13 = new IrDirectJump(_b),
                        }),
                        b14 = new IrBasicBlock({
                            instrs: [
                                i15 = new IrInstrPhi(),
                            ],
                        }),
                    ],
                }),
            ],
            fixups: () => {
                j4.trueTarget = b5;
                j4.falseTarget = b10;
                i8.phi = i15;
                j9.target = b14;
                i12.phi = i15;
                j13.target = b14;
            },
        });

        t.is(run(ir), "false");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let i3: IrInstr;
        let j4: IrBranchJump;
        let b5: IrBasicBlock;
        let i6: IrInstr;
        let i7: IrInstr;
        let i8: IrInstrUpsilon;
        let j9: IrDirectJump;
        let b10: IrBasicBlock;
        let i11: IrInstr;
        let i12: IrInstrUpsilon;
        let j13: IrDirectJump;
        let b14: IrBasicBlock;
        let i15: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetStr(new StrValue("fusion")),
                                i2 = new IrInstrGetStr(new StrValue("fusion")),
                                i3 = new IrInstrGreaterEq(i1, i2),
                            ],
                            jump: j4 = new IrBranchJump(i3, _b, _b),
                        }),
                        b5 = new IrBasicBlock({
                            instrs: [
                                i6 = new IrInstrGetStr(new StrValue("crab")),
                                i7 = new IrInstrGreaterEq(i2, i6),
                                i8 = new IrInstrUpsilon(i7, _i),
                            ],
                            jump: j9 = new IrDirectJump(_b),
                        }),
                        b10 = new IrBasicBlock({
                            instrs: [
                                i11 = new IrInstrGetFalse(),
                                i12 = new IrInstrUpsilon(i11, _i),
                            ],
                            jump: j13 = new IrDirectJump(_b),
                        }),
                        b14 = new IrBasicBlock({
                            instrs: [
                                i15 = new IrInstrPhi(),
                            ],
                        }),
                    ],
                }),
            ],
            fixups: () => {
                j4.trueTarget = b5;
                j4.falseTarget = b10;
                i8.phi = i15;
                j9.target = b14;
                i12.phi = i15;
                j13.target = b14;
            },
        });

        t.is(run(ir), "true");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let i3: IrInstr;
        let j4: IrBranchJump;
        let b5: IrBasicBlock;
        let i6: IrInstr;
        let i7: IrInstr;
        let i8: IrInstrUpsilon;
        let j9: IrDirectJump;
        let b10: IrBasicBlock;
        let i11: IrInstr;
        let i12: IrInstrUpsilon;
        let j13: IrDirectJump;
        let b14: IrBasicBlock;
        let i15: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetStr(new StrValue("indigo")),
                                i2 = new IrInstrGetStr(new StrValue("fusion")),
                                i3 = new IrInstrGreaterEq(i1, i2),
                            ],
                            jump: j4 = new IrBranchJump(i3, _b, _b),
                        }),
                        b5 = new IrBasicBlock({
                            instrs: [
                                i6 = new IrInstrGetStr(new StrValue("crab")),
                                i7 = new IrInstrGreater(i2, i6),
                                i8 = new IrInstrUpsilon(i7, _i),
                            ],
                            jump: j9 = new IrDirectJump(_b),
                        }),
                        b10 = new IrBasicBlock({
                            instrs: [
                                i11 = new IrInstrGetFalse(),
                                i12 = new IrInstrUpsilon(i11, _i),
                            ],
                            jump: j13 = new IrDirectJump(_b),
                        }),
                        b14 = new IrBasicBlock({
                            instrs: [
                                i15 = new IrInstrPhi(),
                            ],
                        }),
                    ],
                }),
            ],
            fixups: () => {
                j4.trueTarget = b5;
                j4.falseTarget = b10;
                i8.phi = i15;
                j9.target = b14;
                i12.phi = i15;
                j13.target = b14;
            },
        });

        t.is(run(ir), "true");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let i3: IrInstr;
        let j4: IrBranchJump;
        let b5: IrBasicBlock;
        let i6: IrInstr;
        let i7: IrInstr;
        let i8: IrInstrUpsilon;
        let j9: IrDirectJump;
        let b10: IrBasicBlock;
        let i11: IrInstr;
        let i12: IrInstrUpsilon;
        let j13: IrDirectJump;
        let b14: IrBasicBlock;
        let i15: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetStr(new StrValue("fusion")),
                                i2 = new IrInstrGetStr(new StrValue("indigo")),
                                i3 = new IrInstrGreaterEq(i1, i2),
                            ],
                            jump: j4 = new IrBranchJump(i3, _b, _b),
                        }),
                        b5 = new IrBasicBlock({
                            instrs: [
                                i6 = new IrInstrGetStr(new StrValue("crab")),
                                i7 = new IrInstrGreater(i2, i6),
                                i8 = new IrInstrUpsilon(i7, _i),
                            ],
                            jump: j9 = new IrDirectJump(_b),
                        }),
                        b10 = new IrBasicBlock({
                            instrs: [
                                i11 = new IrInstrGetFalse(),
                                i12 = new IrInstrUpsilon(i11, _i),
                            ],
                            jump: j13 = new IrDirectJump(_b),
                        }),
                        b14 = new IrBasicBlock({
                            instrs: [
                                i15 = new IrInstrPhi(),
                            ],
                        }),
                    ],
                }),
            ],
            fixups: () => {
                j4.trueTarget = b5;
                j4.falseTarget = b10;
                i8.phi = i15;
                j9.target = b14;
                i12.phi = i15;
                j13.target = b14;
            },
        });

        t.is(run(ir), "false");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let i3: IrInstr;
        let j4: IrBranchJump;
        let b5: IrBasicBlock;
        let i6: IrInstr;
        let i7: IrInstr;
        let i8: IrInstrUpsilon;
        let j9: IrDirectJump;
        let b10: IrBasicBlock;
        let i11: IrInstr;
        let i12: IrInstrUpsilon;
        let j13: IrDirectJump;
        let b14: IrBasicBlock;
        let i15: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetStr(new StrValue("indigo")),
                                i2 = new IrInstrGetStr(new StrValue("crab")),
                                i3 = new IrInstrGreaterEq(i1, i2),
                            ],
                            jump: j4 = new IrBranchJump(i3, _b, _b),
                        }),
                        b5 = new IrBasicBlock({
                            instrs: [
                                i6 = new IrInstrGetStr(new StrValue("fusion")),
                                i7 = new IrInstrGreater(i2, i6),
                                i8 = new IrInstrUpsilon(i7, _i),
                            ],
                            jump: j9 = new IrDirectJump(_b),
                        }),
                        b10 = new IrBasicBlock({
                            instrs: [
                                i11 = new IrInstrGetFalse(),
                                i12 = new IrInstrUpsilon(i11, _i),
                            ],
                            jump: j13 = new IrDirectJump(_b),
                        }),
                        b14 = new IrBasicBlock({
                            instrs: [
                                i15 = new IrInstrPhi(),
                            ],
                        }),
                    ],
                }),
            ],
            fixups: () => {
                j4.trueTarget = b5;
                j4.falseTarget = b10;
                i8.phi = i15;
                j9.target = b14;
                i12.phi = i15;
                j13.target = b14;
            },
        });

        t.is(run(ir), "false");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let i3: IrInstr;
        let j4: IrBranchJump;
        let b5: IrBasicBlock;
        let i6: IrInstr;
        let i7: IrInstr;
        let i8: IrInstrUpsilon;
        let j9: IrDirectJump;
        let b10: IrBasicBlock;
        let i11: IrInstr;
        let i12: IrInstrUpsilon;
        let j13: IrDirectJump;
        let b14: IrBasicBlock;
        let i15: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetStr(new StrValue("fusion")),
                                i2 = new IrInstrGetStr(new StrValue("fusion")),
                                i3 = new IrInstrGreaterEq(i1, i2),
                            ],
                            jump: j4 = new IrBranchJump(i3, _b, _b),
                        }),
                        b5 = new IrBasicBlock({
                            instrs: [
                                i6 = new IrInstrGetStr(new StrValue("crab")),
                                i7 = new IrInstrGreater(i2, i6),
                                i8 = new IrInstrUpsilon(i7, _i),
                            ],
                            jump: j9 = new IrDirectJump(_b),
                        }),
                        b10 = new IrBasicBlock({
                            instrs: [
                                i11 = new IrInstrGetFalse(),
                                i12 = new IrInstrUpsilon(i11, _i),
                            ],
                            jump: j13 = new IrDirectJump(_b),
                        }),
                        b14 = new IrBasicBlock({
                            instrs: [
                                i15 = new IrInstrPhi(),
                            ],
                        }),
                    ],
                }),
            ],
            fixups: () => {
                j4.trueTarget = b5;
                j4.falseTarget = b10;
                i8.phi = i15;
                j9.target = b14;
                i12.phi = i15;
                j13.target = b14;
            },
        });

        t.is(run(ir), "true");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetInt(new IntValue(5n)),
                                i2 = new IrInstrGetInt(new IntValue(5n)),
                                new IrInstrEq(i1, i2),
                            ],
                        }),
                    ],
                }),
            ],
        });

        t.is(run(ir), "true");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let i3: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetInt(new IntValue(5n)),
                                i2 = new IrInstrGetInt(new IntValue(5n)),
                                i3 = new IrInstrNegInt(i2),
                                new IrInstrEq(i1, i3),
                            ],
                        }),
                    ],
                }),
            ],
        });

        t.is(run(ir), "false");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetInt(new IntValue(5n)),
                                i2 = new IrInstrGetInt(new IntValue(42n)),
                                new IrInstrEq(i1, i2),
                            ],
                        }),
                    ],
                }),
            ],
        });

        t.is(run(ir), "false");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let i3: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetInt(new IntValue(0n)),
                                i2 = new IrInstrGetInt(new IntValue(0n)),
                                i3 = new IrInstrNegInt(i2),
                                new IrInstrEq(i1, i3),
                            ],
                        }),
                    ],
                }),
            ],
        });

        t.is(run(ir), "true");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetStr(new StrValue("foo")),
                                i2 = new IrInstrGetStr(new StrValue("foo")),
                                new IrInstrEq(i1, i2),
                            ],
                        }),
                    ],
                }),
            ],
        });

        t.is(run(ir), "true");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetStr(new StrValue("")),
                                i2 = new IrInstrGetStr(new StrValue("")),
                                new IrInstrEq(i1, i2),
                            ],
                        }),
                    ],
                }),
            ],
        });

        t.is(run(ir), "true");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetStr(new StrValue("foo")),
                                i2 = new IrInstrGetStr(new StrValue("")),
                                new IrInstrEq(i1, i2),
                            ],
                        }),
                    ],
                }),
            ],
        });

        t.is(run(ir), "false");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetStr(new StrValue("foo")),
                                i2 = new IrInstrGetStr(new StrValue("bar")),
                                new IrInstrEq(i1, i2),
                            ],
                        }),
                    ],
                }),
            ],
        });

        t.is(run(ir), "false");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetInt(new IntValue(5n)),
                                i2 = new IrInstrGetStr(new StrValue("5")),
                                new IrInstrEq(i1, i2),
                            ],
                        }),
                    ],
                }),
            ],
        });

        t.is(run(ir), "false");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetInt(new IntValue(5n)),
                                i2 = new IrInstrGetStr(new StrValue("foo")),
                                new IrInstrEq(i1, i2),
                            ],
                        }),
                    ],
                }),
            ],
        });

        t.is(run(ir), "false");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetInt(new IntValue(0n)),
                                i2 = new IrInstrGetStr(new StrValue("")),
                                new IrInstrEq(i1, i2),
                            ],
                        }),
                    ],
                }),
            ],
        });

        t.is(run(ir), "false");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetInt(new IntValue(5n)),
                                i2 = new IrInstrGetInt(new IntValue(5n)),
                                new IrInstrNotEq(i1, i2),
                            ],
                        }),
                    ],
                }),
            ],
        });

        t.is(run(ir), "false");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let i3: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetInt(new IntValue(5n)),
                                i2 = new IrInstrGetInt(new IntValue(5n)),
                                i3 = new IrInstrNegInt(i2),
                                new IrInstrNotEq(i1, i3),
                            ],
                        }),
                    ],
                }),
            ],
        });

        t.is(run(ir), "true");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetInt(new IntValue(5n)),
                                i2 = new IrInstrGetInt(new IntValue(42n)),
                                new IrInstrNotEq(i1, i2),
                            ],
                        }),
                    ],
                }),
            ],
        });

        t.is(run(ir), "true");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let i3: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetInt(new IntValue(0n)),
                                i2 = new IrInstrGetInt(new IntValue(0n)),
                                i3 = new IrInstrNegInt(i2),
                                new IrInstrNotEq(i1, i3),
                            ],
                        }),
                    ],
                }),
            ],
        });

        t.is(run(ir), "false");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetStr(new StrValue("foo")),
                                i2 = new IrInstrGetStr(new StrValue("foo")),
                                new IrInstrNotEq(i1, i2),
                            ],
                        }),
                    ],
                }),
            ],
        });

        t.is(run(ir), "false");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetStr(new StrValue("")),
                                i2 = new IrInstrGetStr(new StrValue("")),
                                new IrInstrNotEq(i1, i2),
                            ],
                        }),
                    ],
                }),
            ],
        });

        t.is(run(ir), "false");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetStr(new StrValue("foo")),
                                i2 = new IrInstrGetStr(new StrValue("")),
                                new IrInstrNotEq(i1, i2),
                            ],
                        }),
                    ],
                }),
            ],
        });

        t.is(run(ir), "true");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetStr(new StrValue("foo")),
                                i2 = new IrInstrGetStr(new StrValue("bar")),
                                new IrInstrNotEq(i1, i2),
                            ],
                        }),
                    ],
                }),
            ],
        });

        t.is(run(ir), "true");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetInt(new IntValue(5n)),
                                i2 = new IrInstrGetStr(new StrValue("5")),
                                new IrInstrNotEq(i1, i2),
                            ],
                        }),
                    ],
                }),
            ],
        });

        t.is(run(ir), "true");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetInt(new IntValue(5n)),
                                i2 = new IrInstrGetStr(new StrValue("foo")),
                                new IrInstrNotEq(i1, i2),
                            ],
                        }),
                    ],
                }),
            ],
        });

        t.is(run(ir), "true");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetInt(new IntValue(0n)),
                                i2 = new IrInstrGetStr(new StrValue("")),
                                new IrInstrNotEq(i1, i2),
                            ],
                        }),
                    ],
                }),
            ],
        });

        t.is(run(ir), "true");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let i3: IrInstr;
        let j4: IrBranchJump;
        let b5: IrBasicBlock;
        let i6: IrInstr;
        let i7: IrInstr;
        let j8: IrBranchJump;
        let b9: IrBasicBlock;
        let i10: IrInstr;
        let i11: IrInstr;
        let i12: IrInstrUpsilon;
        let j13: IrDirectJump;
        let b14: IrBasicBlock;
        let i15: IrInstr;
        let i16: IrInstrUpsilon;
        let j17: IrDirectJump;
        let b18: IrBasicBlock;
        let i19: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetInt(new IntValue(3n)),
                                i2 = new IrInstrGetInt(new IntValue(6n)),
                                i3 = new IrInstrLess(i1, i2),
                            ],
                            jump: j4 = new IrBranchJump(i3, _b, _b),
                        }),
                        b5 = new IrBasicBlock({
                            instrs: [
                                i6 = new IrInstrGetInt(new IntValue(6n)),
                                i7 = new IrInstrEq(i2, i6),
                            ],
                            jump: j8 = new IrBranchJump(i7, _b, _b),
                        }),
                        b9 = new IrBasicBlock({
                            instrs: [
                                i10 = new IrInstrGetInt(new IntValue(9n)),
                                i11 = new IrInstrLess(i6, i10),
                                i12 = new IrInstrUpsilon(i11, _i),
                            ],
                            jump: j13 = new IrDirectJump(_b),
                        }),
                        b14 = new IrBasicBlock({
                            instrs: [
                                i15 = new IrInstrGetFalse(),
                                i16 = new IrInstrUpsilon(i15, _i),
                            ],
                            jump: j17 = new IrDirectJump(_b),
                        }),
                        b18 = new IrBasicBlock({
                            instrs: [
                                i19 = new IrInstrPhi(),
                            ],
                        }),
                    ],
                }),
            ],
            fixups: () => {
                j4.trueTarget = b5;
                j4.falseTarget = b14;
                j8.trueTarget = b9;
                j8.falseTarget = b14;
                i12.phi = i19;
                j13.target = b18;
                i16.phi = i19;
                j17.target = b18;
            },
        });

        t.is(run(ir), "true");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let i3: IrInstr;
        let j4: IrBranchJump;
        let b5: IrBasicBlock;
        let i6: IrInstr;
        let i7: IrInstr;
        let j8: IrBranchJump;
        let b9: IrBasicBlock;
        let i10: IrInstr;
        let i11: IrInstr;
        let i12: IrInstrUpsilon;
        let j13: IrDirectJump;
        let b14: IrBasicBlock;
        let i15: IrInstr;
        let i16: IrInstrUpsilon;
        let j17: IrDirectJump;
        let b18: IrBasicBlock;
        let i19: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetInt(new IntValue(3n)),
                                i2 = new IrInstrGetInt(new IntValue(6n)),
                                i3 = new IrInstrLess(i1, i2),
                            ],
                            jump: j4 = new IrBranchJump(i3, _b, _b),
                        }),
                        b5 = new IrBasicBlock({
                            instrs: [
                                i6 = new IrInstrGetInt(new IntValue(9n)),
                                i7 = new IrInstrEq(i2, i6),
                            ],
                            jump: j8 = new IrBranchJump(i7, _b, _b),
                        }),
                        b9 = new IrBasicBlock({
                            instrs: [
                                i10 = new IrInstrGetInt(new IntValue(9n)),
                                i11 = new IrInstrLess(i6, i10),
                                i12 = new IrInstrUpsilon(i11, _i),
                            ],
                            jump: j13 = new IrDirectJump(_b),
                        }),
                        b14 = new IrBasicBlock({
                            instrs: [
                                i15 = new IrInstrGetFalse(),
                                i16 = new IrInstrUpsilon(i15, _i),
                            ],
                            jump: j17 = new IrDirectJump(_b),
                        }),
                        b18 = new IrBasicBlock({
                            instrs: [
                                i19 = new IrInstrPhi(),
                            ],
                        }),
                    ],
                }),
            ],
            fixups: () => {
                j4.trueTarget = b5;
                j4.falseTarget = b14;
                j8.trueTarget = b9;
                j8.falseTarget = b14;
                i12.phi = i19;
                j13.target = b18;
                i16.phi = i19;
                j17.target = b18;
            },
        });

        t.is(run(ir), "false");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let i3: IrInstr;
        let j4: IrBranchJump;
        let b5: IrBasicBlock;
        let i6: IrInstr;
        let i7: IrInstr;
        let j8: IrBranchJump;
        let b9: IrBasicBlock;
        let i10: IrInstr;
        let i11: IrInstr;
        let i12: IrInstrUpsilon;
        let j13: IrDirectJump;
        let b14: IrBasicBlock;
        let i15: IrInstr;
        let i16: IrInstrUpsilon;
        let j17: IrDirectJump;
        let b18: IrBasicBlock;
        let i19: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetInt(new IntValue(3n)),
                                i2 = new IrInstrGetInt(new IntValue(6n)),
                                i3 = new IrInstrLessEq(i1, i2),
                            ],
                            jump: j4 = new IrBranchJump(i3, _b, _b),
                        }),
                        b5 = new IrBasicBlock({
                            instrs: [
                                i6 = new IrInstrGetInt(new IntValue(6n)),
                                i7 = new IrInstrEq(i2, i6),
                            ],
                            jump: j8 = new IrBranchJump(i7, _b, _b),
                        }),
                        b9 = new IrBasicBlock({
                            instrs: [
                                i10 = new IrInstrGetInt(new IntValue(9n)),
                                i11 = new IrInstrLessEq(i6, i10),
                                i12 = new IrInstrUpsilon(i11, _i),
                            ],
                            jump: j13 = new IrDirectJump(_b),
                        }),
                        b14 = new IrBasicBlock({
                            instrs: [
                                i15 = new IrInstrGetFalse(),
                                i16 = new IrInstrUpsilon(i15, _i),
                            ],
                            jump: j17 = new IrDirectJump(_b),
                        }),
                        b18 = new IrBasicBlock({
                            instrs: [
                                i19 = new IrInstrPhi(),
                            ],
                        }),
                    ],
                }),
            ],
            fixups: () => {
                j4.trueTarget = b5;
                j4.falseTarget = b14;
                j8.trueTarget = b9;
                j8.falseTarget = b14;
                i12.phi = i19;
                j13.target = b18;
                i16.phi = i19;
                j17.target = b18;
            },
        });

        t.is(run(ir), "true");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let i3: IrInstr;
        let j4: IrBranchJump;
        let b5: IrBasicBlock;
        let i6: IrInstr;
        let i7: IrInstr;
        let j8: IrBranchJump;
        let b9: IrBasicBlock;
        let i10: IrInstr;
        let i11: IrInstr;
        let i12: IrInstrUpsilon;
        let j13: IrDirectJump;
        let b14: IrBasicBlock;
        let i15: IrInstr;
        let i16: IrInstrUpsilon;
        let j17: IrDirectJump;
        let b18: IrBasicBlock;
        let i19: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetInt(new IntValue(3n)),
                                i2 = new IrInstrGetInt(new IntValue(6n)),
                                i3 = new IrInstrLessEq(i1, i2),
                            ],
                            jump: j4 = new IrBranchJump(i3, _b, _b),
                        }),
                        b5 = new IrBasicBlock({
                            instrs: [
                                i6 = new IrInstrGetInt(new IntValue(9n)),
                                i7 = new IrInstrEq(i2, i6),
                            ],
                            jump: j8 = new IrBranchJump(i7, _b, _b),
                        }),
                        b9 = new IrBasicBlock({
                            instrs: [
                                i10 = new IrInstrGetInt(new IntValue(6n)),
                                i11 = new IrInstrLessEq(i6, i10),
                                i12 = new IrInstrUpsilon(i11, _i),
                            ],
                            jump: j13 = new IrDirectJump(_b),
                        }),
                        b14 = new IrBasicBlock({
                            instrs: [
                                i15 = new IrInstrGetFalse(),
                                i16 = new IrInstrUpsilon(i15, _i),
                            ],
                            jump: j17 = new IrDirectJump(_b),
                        }),
                        b18 = new IrBasicBlock({
                            instrs: [
                                i19 = new IrInstrPhi(),
                            ],
                        }),
                    ],
                }),
            ],
            fixups: () => {
                j4.trueTarget = b5;
                j4.falseTarget = b14;
                j8.trueTarget = b9;
                j8.falseTarget = b14;
                i12.phi = i19;
                j13.target = b18;
                i16.phi = i19;
                j17.target = b18;
            },
        });

        t.is(run(ir), "false");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let i3: IrInstr;
        let j4: IrBranchJump;
        let b5: IrBasicBlock;
        let i6: IrInstr;
        let i7: IrInstr;
        let j8: IrBranchJump;
        let b9: IrBasicBlock;
        let i10: IrInstr;
        let i11: IrInstr;
        let i12: IrInstrUpsilon;
        let j13: IrDirectJump;
        let b14: IrBasicBlock;
        let i15: IrInstr;
        let i16: IrInstrUpsilon;
        let j17: IrDirectJump;
        let b18: IrBasicBlock;
        let i19: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetStr(new StrValue("crab")),
                                i2 = new IrInstrGetStr(new StrValue("fusion")),
                                i3 = new IrInstrLess(i1, i2),
                            ],
                            jump: j4 = new IrBranchJump(i3, _b, _b),
                        }),
                        b5 = new IrBasicBlock({
                            instrs: [
                                i6 = new IrInstrGetStr(new StrValue("fusion")),
                                i7 = new IrInstrEq(i2, i6),
                            ],
                            jump: j8 = new IrBranchJump(i7, _b, _b),
                        }),
                        b9 = new IrBasicBlock({
                            instrs: [
                                i10 = new IrInstrGetStr(
                                    new StrValue("indigo")
                                ),
                                i11 = new IrInstrLess(i6, i10),
                                i12 = new IrInstrUpsilon(i11, _i),
                            ],
                            jump: j13 = new IrDirectJump(_b),
                        }),
                        b14 = new IrBasicBlock({
                            instrs: [
                                i15 = new IrInstrGetFalse(),
                                i16 = new IrInstrUpsilon(i15, _i),
                            ],
                            jump: j17 = new IrDirectJump(_b),
                        }),
                        b18 = new IrBasicBlock({
                            instrs: [
                                i19 = new IrInstrPhi(),
                            ],
                        }),
                    ],
                }),
            ],
            fixups: () => {
                j4.trueTarget = b5;
                j4.falseTarget = b14;
                j8.trueTarget = b9;
                j8.falseTarget = b14;
                i12.phi = i19;
                j13.target = b18;
                i16.phi = i19;
                j17.target = b18;
            },
        });

        t.is(run(ir), "true");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let i3: IrInstr;
        let j4: IrBranchJump;
        let b5: IrBasicBlock;
        let i6: IrInstr;
        let i7: IrInstr;
        let j8: IrBranchJump;
        let b9: IrBasicBlock;
        let i10: IrInstr;
        let i11: IrInstr;
        let i12: IrInstrUpsilon;
        let j13: IrDirectJump;
        let b14: IrBasicBlock;
        let i15: IrInstr;
        let i16: IrInstrUpsilon;
        let j17: IrDirectJump;
        let b18: IrBasicBlock;
        let i19: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetStr(new StrValue("crab")),
                                i2 = new IrInstrGetStr(new StrValue("fusion")),
                                i3 = new IrInstrLess(i1, i2),
                            ],
                            jump: j4 = new IrBranchJump(i3, _b, _b),
                        }),
                        b5 = new IrBasicBlock({
                            instrs: [
                                i6 = new IrInstrGetStr(new StrValue("indigo")),
                                i7 = new IrInstrEq(i2, i6),
                            ],
                            jump: j8 = new IrBranchJump(i7, _b, _b),
                        }),
                        b9 = new IrBasicBlock({
                            instrs: [
                                i10 = new IrInstrGetStr(
                                    new StrValue("indigo")
                                ),
                                i11 = new IrInstrLess(i6, i10),
                                i12 = new IrInstrUpsilon(i11, _i),
                            ],
                            jump: j13 = new IrDirectJump(_b),
                        }),
                        b14 = new IrBasicBlock({
                            instrs: [
                                i15 = new IrInstrGetFalse(),
                                i16 = new IrInstrUpsilon(i15, _i),
                            ],
                            jump: j17 = new IrDirectJump(_b),
                        }),
                        b18 = new IrBasicBlock({
                            instrs: [
                                i19 = new IrInstrPhi(),
                            ],
                        }),
                    ],
                }),
            ],
            fixups: () => {
                j4.trueTarget = b5;
                j4.falseTarget = b14;
                j8.trueTarget = b9;
                j8.falseTarget = b14;
                i12.phi = i19;
                j13.target = b18;
                i16.phi = i19;
                j17.target = b18;
            },
        });

        t.is(run(ir), "false");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let i3: IrInstr;
        let j4: IrBranchJump;
        let b5: IrBasicBlock;
        let i6: IrInstr;
        let i7: IrInstr;
        let j8: IrBranchJump;
        let b9: IrBasicBlock;
        let i10: IrInstr;
        let i11: IrInstr;
        let i12: IrInstrUpsilon;
        let j13: IrDirectJump;
        let b14: IrBasicBlock;
        let i15: IrInstr;
        let i16: IrInstrUpsilon;
        let j17: IrDirectJump;
        let b18: IrBasicBlock;
        let i19: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetStr(new StrValue("crab")),
                                i2 = new IrInstrGetStr(new StrValue("fusion")),
                                i3 = new IrInstrLessEq(i1, i2),
                            ],
                            jump: j4 = new IrBranchJump(i3, _b, _b),
                        }),
                        b5 = new IrBasicBlock({
                            instrs: [
                                i6 = new IrInstrGetStr(new StrValue("fusion")),
                                i7 = new IrInstrEq(i2, i6),
                            ],
                            jump: j8 = new IrBranchJump(i7, _b, _b),
                        }),
                        b9 = new IrBasicBlock({
                            instrs: [
                                i10 = new IrInstrGetStr(
                                    new StrValue("indigo")
                                ),
                                i11 = new IrInstrLessEq(i6, i10),
                                i12 = new IrInstrUpsilon(i11, _i),
                            ],
                            jump: j13 = new IrDirectJump(_b),
                        }),
                        b14 = new IrBasicBlock({
                            instrs: [
                                i15 = new IrInstrGetFalse(),
                                i16 = new IrInstrUpsilon(i15, _i),
                            ],
                            jump: j17 = new IrDirectJump(_b),
                        }),
                        b18 = new IrBasicBlock({
                            instrs: [
                                i19 = new IrInstrPhi(),
                            ],
                        }),
                    ],
                }),
            ],
            fixups: () => {
                j4.trueTarget = b5;
                j4.falseTarget = b14;
                j8.trueTarget = b9;
                j8.falseTarget = b14;
                i12.phi = i19;
                j13.target = b18;
                i16.phi = i19;
                j17.target = b18;
            },
        });

        t.is(run(ir), "true");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let i3: IrInstr;
        let j4: IrBranchJump;
        let b5: IrBasicBlock;
        let i6: IrInstr;
        let i7: IrInstr;
        let j8: IrBranchJump;
        let b9: IrBasicBlock;
        let i10: IrInstr;
        let i11: IrInstr;
        let i12: IrInstrUpsilon;
        let j13: IrDirectJump;
        let b14: IrBasicBlock;
        let i15: IrInstr;
        let i16: IrInstrUpsilon;
        let j17: IrDirectJump;
        let b18: IrBasicBlock;
        let i19: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetStr(new StrValue("crab")),
                                i2 = new IrInstrGetStr(new StrValue("fusion")),
                                i3 = new IrInstrLessEq(i1, i2),
                            ],
                            jump: j4 = new IrBranchJump(i3, _b, _b),
                        }),
                        b5 = new IrBasicBlock({
                            instrs: [
                                i6 = new IrInstrGetStr(new StrValue("indigo")),
                                i7 = new IrInstrEq(i2, i6),
                            ],
                            jump: j8 = new IrBranchJump(i7, _b, _b),
                        }),
                        b9 = new IrBasicBlock({
                            instrs: [
                                i10 = new IrInstrGetStr(
                                    new StrValue("fusion")
                                ),
                                i11 = new IrInstrLessEq(i6, i10),
                                i12 = new IrInstrUpsilon(i11, _i),
                            ],
                            jump: j13 = new IrDirectJump(_b),
                        }),
                        b14 = new IrBasicBlock({
                            instrs: [
                                i15 = new IrInstrGetFalse(),
                                i16 = new IrInstrUpsilon(i15, _i),
                            ],
                            jump: j17 = new IrDirectJump(_b),
                        }),
                        b18 = new IrBasicBlock({
                            instrs: [
                                i19 = new IrInstrPhi(),
                            ],
                        }),
                    ],
                }),
            ],
            fixups: () => {
                j4.trueTarget = b5;
                j4.falseTarget = b14;
                j8.trueTarget = b9;
                j8.falseTarget = b14;
                i12.phi = i19;
                j13.target = b18;
                i16.phi = i19;
                j17.target = b18;
            },
        });

        t.is(run(ir), "false");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let i3: IrInstr;
        let j4: IrBranchJump;
        let b5: IrBasicBlock;
        let i6: IrInstr;
        let i7: IrInstr;
        let j8: IrBranchJump;
        let b9: IrBasicBlock;
        let i10: IrInstr;
        let i11: IrInstr;
        let i12: IrInstrUpsilon;
        let j13: IrDirectJump;
        let b14: IrBasicBlock;
        let i15: IrInstr;
        let i16: IrInstrUpsilon;
        let j17: IrDirectJump;
        let b18: IrBasicBlock;
        let i19: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetInt(new IntValue(9n)),
                                i2 = new IrInstrGetInt(new IntValue(6n)),
                                i3 = new IrInstrGreater(i1, i2),
                            ],
                            jump: j4 = new IrBranchJump(i3, _b, _b),
                        }),
                        b5 = new IrBasicBlock({
                            instrs: [
                                i6 = new IrInstrGetInt(new IntValue(6n)),
                                i7 = new IrInstrEq(i2, i6),
                            ],
                            jump: j8 = new IrBranchJump(i7, _b, _b),
                        }),
                        b9 = new IrBasicBlock({
                            instrs: [
                                i10 = new IrInstrGetInt(new IntValue(3n)),
                                i11 = new IrInstrGreater(i6, i10),
                                i12 = new IrInstrUpsilon(i11, _i),
                            ],
                            jump: j13 = new IrDirectJump(_b),
                        }),
                        b14 = new IrBasicBlock({
                            instrs: [
                                i15 = new IrInstrGetFalse(),
                                i16 = new IrInstrUpsilon(i15, _i),
                            ],
                            jump: j17 = new IrDirectJump(_b),
                        }),
                        b18 = new IrBasicBlock({
                            instrs: [
                                i19 = new IrInstrPhi(),
                            ],
                        }),
                    ],
                }),
            ],
            fixups: () => {
                j4.trueTarget = b5;
                j4.falseTarget = b14;
                j8.trueTarget = b9;
                j8.falseTarget = b14;
                i12.phi = i19;
                j13.target = b18;
                i16.phi = i19;
                j17.target = b18;
            },
        });

        t.is(run(ir), "true");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let i3: IrInstr;
        let j4: IrBranchJump;
        let b5: IrBasicBlock;
        let i6: IrInstr;
        let i7: IrInstr;
        let j8: IrBranchJump;
        let b9: IrBasicBlock;
        let i10: IrInstr;
        let i11: IrInstr;
        let i12: IrInstrUpsilon;
        let j13: IrDirectJump;
        let b14: IrBasicBlock;
        let i15: IrInstr;
        let i16: IrInstrUpsilon;
        let j17: IrDirectJump;
        let b18: IrBasicBlock;
        let i19: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetInt(new IntValue(9n)),
                                i2 = new IrInstrGetInt(new IntValue(9n)),
                                i3 = new IrInstrGreater(i1, i2),
                            ],
                            jump: j4 = new IrBranchJump(i3, _b, _b),
                        }),
                        b5 = new IrBasicBlock({
                            instrs: [
                                i6 = new IrInstrGetInt(new IntValue(6n)),
                                i7 = new IrInstrEq(i2, i6),
                            ],
                            jump: j8 = new IrBranchJump(i7, _b, _b),
                        }),
                        b9 = new IrBasicBlock({
                            instrs: [
                                i10 = new IrInstrGetInt(new IntValue(3n)),
                                i11 = new IrInstrGreater(i6, i10),
                                i12 = new IrInstrUpsilon(i11, _i),
                            ],
                            jump: j13 = new IrDirectJump(_b),
                        }),
                        b14 = new IrBasicBlock({
                            instrs: [
                                i15 = new IrInstrGetFalse(),
                                i16 = new IrInstrUpsilon(i15, _i),
                            ],
                            jump: j17 = new IrDirectJump(_b),
                        }),
                        b18 = new IrBasicBlock({
                            instrs: [
                                i19 = new IrInstrPhi(),
                            ],
                        }),
                    ],
                }),
            ],
            fixups: () => {
                j4.trueTarget = b5;
                j4.falseTarget = b14;
                j8.trueTarget = b9;
                j8.falseTarget = b14;
                i12.phi = i19;
                j13.target = b18;
                i16.phi = i19;
                j17.target = b18;
            },
        });

        t.is(run(ir), "false");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let i3: IrInstr;
        let j4: IrBranchJump;
        let b5: IrBasicBlock;
        let i6: IrInstr;
        let i7: IrInstr;
        let j8: IrBranchJump;
        let b9: IrBasicBlock;
        let i10: IrInstr;
        let i11: IrInstr;
        let i12: IrInstrUpsilon;
        let j13: IrDirectJump;
        let b14: IrBasicBlock;
        let i15: IrInstr;
        let i16: IrInstrUpsilon;
        let j17: IrDirectJump;
        let b18: IrBasicBlock;
        let i19: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetInt(new IntValue(9n)),
                                i2 = new IrInstrGetInt(new IntValue(6n)),
                                i3 = new IrInstrGreaterEq(i1, i2),
                            ],
                            jump: j4 = new IrBranchJump(i3, _b, _b),
                        }),
                        b5 = new IrBasicBlock({
                            instrs: [
                                i6 = new IrInstrGetInt(new IntValue(6n)),
                                i7 = new IrInstrEq(i2, i6),
                            ],
                            jump: j8 = new IrBranchJump(i7, _b, _b),
                        }),
                        b9 = new IrBasicBlock({
                            instrs: [
                                i10 = new IrInstrGetInt(new IntValue(3n)),
                                i11 = new IrInstrGreaterEq(i6, i10),
                                i12 = new IrInstrUpsilon(i11, _i),
                            ],
                            jump: j13 = new IrDirectJump(_b),
                        }),
                        b14 = new IrBasicBlock({
                            instrs: [
                                i15 = new IrInstrGetFalse(),
                                i16 = new IrInstrUpsilon(i15, _i),
                            ],
                            jump: j17 = new IrDirectJump(_b),
                        }),
                        b18 = new IrBasicBlock({
                            instrs: [
                                i19 = new IrInstrPhi(),
                            ],
                        }),
                    ],
                }),
            ],
            fixups: () => {
                j4.trueTarget = b5;
                j4.falseTarget = b14;
                j8.trueTarget = b9;
                j8.falseTarget = b14;
                i12.phi = i19;
                j13.target = b18;
                i16.phi = i19;
                j17.target = b18;
            },
        });

        t.is(run(ir), "true");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let i3: IrInstr;
        let j4: IrBranchJump;
        let b5: IrBasicBlock;
        let i6: IrInstr;
        let i7: IrInstr;
        let j8: IrBranchJump;
        let b9: IrBasicBlock;
        let i10: IrInstr;
        let i11: IrInstr;
        let i12: IrInstrUpsilon;
        let j13: IrDirectJump;
        let b14: IrBasicBlock;
        let i15: IrInstr;
        let i16: IrInstrUpsilon;
        let j17: IrDirectJump;
        let b18: IrBasicBlock;
        let i19: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetInt(new IntValue(6n)),
                                i2 = new IrInstrGetInt(new IntValue(9n)),
                                i3 = new IrInstrGreaterEq(i1, i2),
                            ],
                            jump: j4 = new IrBranchJump(i3, _b, _b),
                        }),
                        b5 = new IrBasicBlock({
                            instrs: [
                                i6 = new IrInstrGetInt(new IntValue(6n)),
                                i7 = new IrInstrEq(i2, i6),
                            ],
                            jump: j8 = new IrBranchJump(i7, _b, _b),
                        }),
                        b9 = new IrBasicBlock({
                            instrs: [
                                i10 = new IrInstrGetInt(new IntValue(3n)),
                                i11 = new IrInstrGreaterEq(i6, i10),
                                i12 = new IrInstrUpsilon(i11, _i),
                            ],
                            jump: j13 = new IrDirectJump(_b),
                        }),
                        b14 = new IrBasicBlock({
                            instrs: [
                                i15 = new IrInstrGetFalse(),
                                i16 = new IrInstrUpsilon(i15, _i),
                            ],
                            jump: j17 = new IrDirectJump(_b),
                        }),
                        b18 = new IrBasicBlock({
                            instrs: [
                                i19 = new IrInstrPhi(),
                            ],
                        }),
                    ],
                }),
            ],
            fixups: () => {
                j4.trueTarget = b5;
                j4.falseTarget = b14;
                j8.trueTarget = b9;
                j8.falseTarget = b14;
                i12.phi = i19;
                j13.target = b18;
                i16.phi = i19;
                j17.target = b18;
            },
        });

        t.is(run(ir), "false");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let i3: IrInstr;
        let j4: IrBranchJump;
        let b5: IrBasicBlock;
        let i6: IrInstr;
        let i7: IrInstr;
        let j8: IrBranchJump;
        let b9: IrBasicBlock;
        let i10: IrInstr;
        let i11: IrInstr;
        let i12: IrInstrUpsilon;
        let j13: IrDirectJump;
        let b14: IrBasicBlock;
        let i15: IrInstr;
        let i16: IrInstrUpsilon;
        let j17: IrDirectJump;
        let b18: IrBasicBlock;
        let i19: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetStr(new StrValue("indigo")),
                                i2 = new IrInstrGetStr(new StrValue("fusion")),
                                i3 = new IrInstrGreater(i1, i2),
                            ],
                            jump: j4 = new IrBranchJump(i3, _b, _b),
                        }),
                        b5 = new IrBasicBlock({
                            instrs: [
                                i6 = new IrInstrGetStr(new StrValue("fusion")),
                                i7 = new IrInstrEq(i2, i6),
                            ],
                            jump: j8 = new IrBranchJump(i7, _b, _b),
                        }),
                        b9 = new IrBasicBlock({
                            instrs: [
                                i10 = new IrInstrGetStr(
                                    new StrValue("crab")
                                ),
                                i11 = new IrInstrGreater(i6, i10),
                                i12 = new IrInstrUpsilon(i11, _i),
                            ],
                            jump: j13 = new IrDirectJump(_b),
                        }),
                        b14 = new IrBasicBlock({
                            instrs: [
                                i15 = new IrInstrGetFalse(),
                                i16 = new IrInstrUpsilon(i15, _i),
                            ],
                            jump: j17 = new IrDirectJump(_b),
                        }),
                        b18 = new IrBasicBlock({
                            instrs: [
                                i19 = new IrInstrPhi(),
                            ],
                        }),
                    ],
                }),
            ],
            fixups: () => {
                j4.trueTarget = b5;
                j4.falseTarget = b14;
                j8.trueTarget = b9;
                j8.falseTarget = b14;
                i12.phi = i19;
                j13.target = b18;
                i16.phi = i19;
                j17.target = b18;
            },
        });

        t.is(run(ir), "true");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let i3: IrInstr;
        let j4: IrBranchJump;
        let b5: IrBasicBlock;
        let i6: IrInstr;
        let i7: IrInstr;
        let j8: IrBranchJump;
        let b9: IrBasicBlock;
        let i10: IrInstr;
        let i11: IrInstr;
        let i12: IrInstrUpsilon;
        let j13: IrDirectJump;
        let b14: IrBasicBlock;
        let i15: IrInstr;
        let i16: IrInstrUpsilon;
        let j17: IrDirectJump;
        let b18: IrBasicBlock;
        let i19: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetStr(new StrValue("indigo")),
                                i2 = new IrInstrGetStr(new StrValue("fusion")),
                                i3 = new IrInstrGreater(i1, i2),
                            ],
                            jump: j4 = new IrBranchJump(i3, _b, _b),
                        }),
                        b5 = new IrBasicBlock({
                            instrs: [
                                i6 = new IrInstrGetStr(new StrValue("indigo")),
                                i7 = new IrInstrEq(i2, i6),
                            ],
                            jump: j8 = new IrBranchJump(i7, _b, _b),
                        }),
                        b9 = new IrBasicBlock({
                            instrs: [
                                i10 = new IrInstrGetStr(
                                    new StrValue("crab")
                                ),
                                i11 = new IrInstrGreater(i6, i10),
                                i12 = new IrInstrUpsilon(i11, _i),
                            ],
                            jump: j13 = new IrDirectJump(_b),
                        }),
                        b14 = new IrBasicBlock({
                            instrs: [
                                i15 = new IrInstrGetFalse(),
                                i16 = new IrInstrUpsilon(i15, _i),
                            ],
                            jump: j17 = new IrDirectJump(_b),
                        }),
                        b18 = new IrBasicBlock({
                            instrs: [
                                i19 = new IrInstrPhi(),
                            ],
                        }),
                    ],
                }),
            ],
            fixups: () => {
                j4.trueTarget = b5;
                j4.falseTarget = b14;
                j8.trueTarget = b9;
                j8.falseTarget = b14;
                i12.phi = i19;
                j13.target = b18;
                i16.phi = i19;
                j17.target = b18;
            },
        });

        t.is(run(ir), "false");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let i3: IrInstr;
        let j4: IrBranchJump;
        let b5: IrBasicBlock;
        let i6: IrInstr;
        let i7: IrInstr;
        let j8: IrBranchJump;
        let b9: IrBasicBlock;
        let i10: IrInstr;
        let i11: IrInstr;
        let i12: IrInstrUpsilon;
        let j13: IrDirectJump;
        let b14: IrBasicBlock;
        let i15: IrInstr;
        let i16: IrInstrUpsilon;
        let j17: IrDirectJump;
        let b18: IrBasicBlock;
        let i19: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetStr(new StrValue("indigo")),
                                i2 = new IrInstrGetStr(new StrValue("fusion")),
                                i3 = new IrInstrGreaterEq(i1, i2),
                            ],
                            jump: j4 = new IrBranchJump(i3, _b, _b),
                        }),
                        b5 = new IrBasicBlock({
                            instrs: [
                                i6 = new IrInstrGetStr(new StrValue("fusion")),
                                i7 = new IrInstrEq(i2, i6),
                            ],
                            jump: j8 = new IrBranchJump(i7, _b, _b),
                        }),
                        b9 = new IrBasicBlock({
                            instrs: [
                                i10 = new IrInstrGetStr(
                                    new StrValue("crab")
                                ),
                                i11 = new IrInstrGreaterEq(i6, i10),
                                i12 = new IrInstrUpsilon(i11, _i),
                            ],
                            jump: j13 = new IrDirectJump(_b),
                        }),
                        b14 = new IrBasicBlock({
                            instrs: [
                                i15 = new IrInstrGetFalse(),
                                i16 = new IrInstrUpsilon(i15, _i),
                            ],
                            jump: j17 = new IrDirectJump(_b),
                        }),
                        b18 = new IrBasicBlock({
                            instrs: [
                                i19 = new IrInstrPhi(),
                            ],
                        }),
                    ],
                }),
            ],
            fixups: () => {
                j4.trueTarget = b5;
                j4.falseTarget = b14;
                j8.trueTarget = b9;
                j8.falseTarget = b14;
                i12.phi = i19;
                j13.target = b18;
                i16.phi = i19;
                j17.target = b18;
            },
        });

        t.is(run(ir), "true");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let i3: IrInstr;
        let j4: IrBranchJump;
        let b5: IrBasicBlock;
        let i6: IrInstr;
        let i7: IrInstr;
        let j8: IrBranchJump;
        let b9: IrBasicBlock;
        let i10: IrInstr;
        let i11: IrInstr;
        let i12: IrInstrUpsilon;
        let j13: IrDirectJump;
        let b14: IrBasicBlock;
        let i15: IrInstr;
        let i16: IrInstrUpsilon;
        let j17: IrDirectJump;
        let b18: IrBasicBlock;
        let i19: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetStr(new StrValue("fusion")),
                                i2 = new IrInstrGetStr(new StrValue("indigo")),
                                i3 = new IrInstrGreaterEq(i1, i2),
                            ],
                            jump: j4 = new IrBranchJump(i3, _b, _b),
                        }),
                        b5 = new IrBasicBlock({
                            instrs: [
                                i6 = new IrInstrGetStr(new StrValue("fusion")),
                                i7 = new IrInstrEq(i2, i6),
                            ],
                            jump: j8 = new IrBranchJump(i7, _b, _b),
                        }),
                        b9 = new IrBasicBlock({
                            instrs: [
                                i10 = new IrInstrGetStr(
                                    new StrValue("crab")
                                ),
                                i11 = new IrInstrGreaterEq(i6, i10),
                                i12 = new IrInstrUpsilon(i11, _i),
                            ],
                            jump: j13 = new IrDirectJump(_b),
                        }),
                        b14 = new IrBasicBlock({
                            instrs: [
                                i15 = new IrInstrGetFalse(),
                                i16 = new IrInstrUpsilon(i15, _i),
                            ],
                            jump: j17 = new IrDirectJump(_b),
                        }),
                        b18 = new IrBasicBlock({
                            instrs: [
                                i19 = new IrInstrPhi(),
                            ],
                        }),
                    ],
                }),
            ],
            fixups: () => {
                j4.trueTarget = b5;
                j4.falseTarget = b14;
                j8.trueTarget = b9;
                j8.falseTarget = b14;
                i12.phi = i19;
                j13.target = b18;
                i16.phi = i19;
                j17.target = b18;
            },
        });

        t.is(run(ir), "false");
    }
});

