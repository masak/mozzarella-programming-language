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
    IrInstrGetFalse,
    IrInstrGetInt,
    IrInstrGetStr,
    IrInstrGetTrue,
    IrInstrPhi,
    IrInstrToBool,
    IrInstrToNegBool,
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
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetInt(new IntValue(0n)),
                                new IrInstrToBool(i1),
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
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetInt(new IntValue(5n)),
                                new IrInstrToBool(i1),
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
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetStr(new StrValue("")),
                                new IrInstrToBool(i1),
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
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetStr(
                                    new StrValue("gorgonzola")
                                ),
                                new IrInstrToBool(i1),
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
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetFalse(),
                                new IrInstrToBool(i1),
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
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetTrue(),
                                new IrInstrToBool(i1),
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
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetInt(new IntValue(0n)),
                                new IrInstrToNegBool(i1),
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
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetInt(new IntValue(5n)),
                                new IrInstrToNegBool(i1),
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
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetStr(new StrValue("")),
                                new IrInstrToNegBool(i1),
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
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetStr(
                                    new StrValue("gorgonzola")
                                ),
                                new IrInstrToNegBool(i1),
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
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetFalse(),
                                new IrInstrToNegBool(i1),
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
        let j3: IrBranchJump;
        let b4: IrBasicBlock;
        let i5: IrInstr;
        let i6: IrInstrUpsilon;
        let j7: IrDirectJump;
        let b8: IrBasicBlock;
        let i9: IrInstrUpsilon;
        let j10: IrDirectJump;
        let b11: IrBasicBlock;
        let i12: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetInt(new IntValue(5n)),
                                i2 = new IrInstrToBool(i1),
                            ],
                            jump: j3 = new IrBranchJump(i2, _b, _b),
                        }),
                        b4 = new IrBasicBlock({
                            instrs: [
                                i5 = new IrInstrGetInt(new IntValue(0n)),
                                i6 = new IrInstrUpsilon(i5, _i),
                            ],
                            jump: j7 = new IrDirectJump(_b),
                        }),
                        b8 = new IrBasicBlock({
                            instrs: [
                                i9 = new IrInstrUpsilon(i1, _i),
                            ],
                            jump: j10 = new IrDirectJump(_b),
                        }),
                        b11 = new IrBasicBlock({
                            instrs: [
                                i12 = new IrInstrPhi(),
                            ],
                        }),
                    ],
                }),
            ],
            fixups: () => {
                j3.trueTarget = b4;
                j3.falseTarget = b8;
                i6.phi = i12;
                j7.target = b11;
                i9.phi = i12;
                j10.target = b11;
            },
        });

        t.is(run(ir), "0");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let j3: IrBranchJump;
        let b4: IrBasicBlock;
        let i5: IrInstr;
        let i6: IrInstrUpsilon;
        let j7: IrDirectJump;
        let b8: IrBasicBlock;
        let i9: IrInstrUpsilon;
        let j10: IrDirectJump;
        let b11: IrBasicBlock;
        let i12: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetInt(new IntValue(0n)),
                                i2 = new IrInstrToBool(i1),
                            ],
                            jump: j3 = new IrBranchJump(i2, _b, _b),
                        }),
                        b4 = new IrBasicBlock({
                            instrs: [
                                i5 = new IrInstrGetInt(new IntValue(5n)),
                                i6 = new IrInstrUpsilon(i5, _i),
                            ],
                            jump: j7 = new IrDirectJump(_b),
                        }),
                        b8 = new IrBasicBlock({
                            instrs: [
                                i9 = new IrInstrUpsilon(i1, _i),
                            ],
                            jump: j10 = new IrDirectJump(_b),
                        }),
                        b11 = new IrBasicBlock({
                            instrs: [
                                i12 = new IrInstrPhi(),
                            ],
                        }),
                    ],
                }),
            ],
            fixups: () => {
                j3.trueTarget = b4;
                j3.falseTarget = b8;
                i6.phi = i12;
                j7.target = b11;
                i9.phi = i12;
                j10.target = b11;
            },
        });

        t.is(run(ir), "0");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let j3: IrBranchJump;
        let b4: IrBasicBlock;
        let i5: IrInstr;
        let i6: IrInstrUpsilon;
        let j7: IrDirectJump;
        let b8: IrBasicBlock;
        let i9: IrInstrUpsilon;
        let j10: IrDirectJump;
        let b11: IrBasicBlock;
        let i12: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetTrue(),
                                i2 = new IrInstrToBool(i1),
                            ],
                            jump: j3 = new IrBranchJump(i2, _b, _b),
                        }),
                        b4 = new IrBasicBlock({
                            instrs: [
                                i5 = new IrInstrGetStr(new StrValue("moo")),
                                i6 = new IrInstrUpsilon(i5, _i),
                            ],
                            jump: j7 = new IrDirectJump(_b),
                        }),
                        b8 = new IrBasicBlock({
                            instrs: [
                                i9 = new IrInstrUpsilon(i1, _i),
                            ],
                            jump: j10 = new IrDirectJump(_b),
                        }),
                        b11 = new IrBasicBlock({
                            instrs: [
                                i12 = new IrInstrPhi(),
                            ],
                        }),
                    ],
                }),
            ],
            fixups: () => {
                j3.trueTarget = b4;
                j3.falseTarget = b8;
                i6.phi = i12;
                j7.target = b11;
                i9.phi = i12;
                j10.target = b11;
            },
        });

        t.is(run(ir), '"moo"');
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let j3: IrBranchJump;
        let b4: IrBasicBlock;
        let i5: IrInstr;
        let i6: IrInstrUpsilon;
        let j7: IrDirectJump;
        let b8: IrBasicBlock;
        let i9: IrInstrUpsilon;
        let j10: IrDirectJump;
        let b11: IrBasicBlock;
        let i12: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetStr(new StrValue("moo")),
                                i2 = new IrInstrToBool(i1),
                            ],
                            jump: j3 = new IrBranchJump(i2, _b, _b),
                        }),
                        b4 = new IrBasicBlock({
                            instrs: [
                                i5 = new IrInstrGetTrue(),
                                i6 = new IrInstrUpsilon(i5, _i),
                            ],
                            jump: j7 = new IrDirectJump(_b),
                        }),
                        b8 = new IrBasicBlock({
                            instrs: [
                                i9 = new IrInstrUpsilon(i1, _i),
                            ],
                            jump: j10 = new IrDirectJump(_b),
                        }),
                        b11 = new IrBasicBlock({
                            instrs: [
                                i12 = new IrInstrPhi(),
                            ],
                        }),
                    ],
                }),
            ],
            fixups: () => {
                j3.trueTarget = b4;
                j3.falseTarget = b8;
                i6.phi = i12;
                j7.target = b11;
                i9.phi = i12;
                j10.target = b11;
            },
        });

        t.is(run(ir), "true");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let j3: IrBranchJump;
        let b4: IrBasicBlock;
        let i5: IrInstr;
        let i6: IrInstrUpsilon;
        let j7: IrDirectJump;
        let b8: IrBasicBlock;
        let i9: IrInstrUpsilon;
        let j10: IrDirectJump;
        let b11: IrBasicBlock;
        let i12: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetFalse(),
                                i2 = new IrInstrToBool(i1),
                            ],
                            jump: j3 = new IrBranchJump(i2, _b, _b),
                        }),
                        b4 = new IrBasicBlock({
                            instrs: [
                                i5 = new IrInstrGetStr(new StrValue("blue")),
                                i6 = new IrInstrUpsilon(i5, _i),
                            ],
                            jump: j7 = new IrDirectJump(_b),
                        }),
                        b8 = new IrBasicBlock({
                            instrs: [
                                i9 = new IrInstrUpsilon(i1, _i),
                            ],
                            jump: j10 = new IrDirectJump(_b),
                        }),
                        b11 = new IrBasicBlock({
                            instrs: [
                                i12 = new IrInstrPhi(),
                            ],
                        }),
                    ],
                }),
            ],
            fixups: () => {
                j3.trueTarget = b4;
                j3.falseTarget = b8;
                i6.phi = i12;
                j7.target = b11;
                i9.phi = i12;
                j10.target = b11;
            },
        });

        t.is(run(ir), "false");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let j3: IrBranchJump;
        let b4: IrBasicBlock;
        let i5: IrInstr;
        let i6: IrInstrUpsilon;
        let j7: IrDirectJump;
        let b8: IrBasicBlock;
        let i9: IrInstrUpsilon;
        let j10: IrDirectJump;
        let b11: IrBasicBlock;
        let i12: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetStr(new StrValue("blue")),
                                i2 = new IrInstrToBool(i1),
                            ],
                            jump: j3 = new IrBranchJump(i2, _b, _b),
                        }),
                        b4 = new IrBasicBlock({
                            instrs: [
                                i5 = new IrInstrGetFalse(),
                                i6 = new IrInstrUpsilon(i5, _i),
                            ],
                            jump: j7 = new IrDirectJump(_b),
                        }),
                        b8 = new IrBasicBlock({
                            instrs: [
                                i9 = new IrInstrUpsilon(i1, _i),
                            ],
                            jump: j10 = new IrDirectJump(_b),
                        }),
                        b11 = new IrBasicBlock({
                            instrs: [
                                i12 = new IrInstrPhi(),
                            ],
                        }),
                    ],
                }),
            ],
            fixups: () => {
                j3.trueTarget = b4;
                j3.falseTarget = b8;
                i6.phi = i12;
                j7.target = b11;
                i9.phi = i12;
                j10.target = b11;
            },
        });

        t.is(run(ir), "false");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let j3: IrBranchJump;
        let b4: IrBasicBlock;
        let i5: IrInstrUpsilon;
        let j6: IrDirectJump;
        let b7: IrBasicBlock;
        let i8: IrInstr;
        let i9: IrInstrUpsilon;
        let j10: IrDirectJump;
        let b11: IrBasicBlock;
        let i12: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetInt(new IntValue(5n)),
                                i2 = new IrInstrToBool(i1),
                            ],
                            jump: j3 = new IrBranchJump(i2, _b, _b),
                        }),
                        b4 = new IrBasicBlock({
                            instrs: [
                                i5 = new IrInstrUpsilon(i1, _i),
                            ],
                            jump: j6 = new IrDirectJump(_b),
                        }),
                        b7 = new IrBasicBlock({
                            instrs: [
                                i8 = new IrInstrGetInt(new IntValue(0n)),
                                i9 = new IrInstrUpsilon(i8, _i),
                            ],
                            jump: j10 = new IrDirectJump(_b),
                        }),
                        b11 = new IrBasicBlock({
                            instrs: [
                                i12 = new IrInstrPhi(),
                            ],
                        }),
                    ],
                }),
            ],
            fixups: () => {
                j3.trueTarget = b4;
                j3.falseTarget = b7;
                i5.phi = i12;
                j6.target = b11;
                i9.phi = i12;
                j10.target = b11;
            },
        });

        t.is(run(ir), "5");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let j3: IrBranchJump;
        let b4: IrBasicBlock;
        let i5: IrInstrUpsilon;
        let j6: IrDirectJump;
        let b7: IrBasicBlock;
        let i8: IrInstr;
        let i9: IrInstrUpsilon;
        let j10: IrDirectJump;
        let b11: IrBasicBlock;
        let i12: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetTrue(),
                                i2 = new IrInstrToBool(i1),
                            ],
                            jump: j3 = new IrBranchJump(i2, _b, _b),
                        }),
                        b4 = new IrBasicBlock({
                            instrs: [
                                i5 = new IrInstrUpsilon(i1, _i),
                            ],
                            jump: j6 = new IrDirectJump(_b),
                        }),
                        b7 = new IrBasicBlock({
                            instrs: [
                                i8 = new IrInstrGetStr(new StrValue("moo")),
                                i9 = new IrInstrUpsilon(i8, _i),
                            ],
                            jump: j10 = new IrDirectJump(_b),
                        }),
                        b11 = new IrBasicBlock({
                            instrs: [
                                i12 = new IrInstrPhi(),
                            ],
                        }),
                    ],
                }),
            ],
            fixups: () => {
                j3.trueTarget = b4;
                j3.falseTarget = b7;
                i5.phi = i12;
                j6.target = b11;
                i9.phi = i12;
                j10.target = b11;
            },
        });

        t.is(run(ir), "true");
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let j3: IrBranchJump;
        let b4: IrBasicBlock;
        let i5: IrInstrUpsilon;
        let j6: IrDirectJump;
        let b7: IrBasicBlock;
        let i8: IrInstr;
        let i9: IrInstrUpsilon;
        let j10: IrDirectJump;
        let b11: IrBasicBlock;
        let i12: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetStr(new StrValue("moo")),
                                i2 = new IrInstrToBool(i1),
                            ],
                            jump: j3 = new IrBranchJump(i2, _b, _b),
                        }),
                        b4 = new IrBasicBlock({
                            instrs: [
                                i5 = new IrInstrUpsilon(i1, _i),
                            ],
                            jump: j6 = new IrDirectJump(_b),
                        }),
                        b7 = new IrBasicBlock({
                            instrs: [
                                i8 = new IrInstrGetTrue(),
                                i9 = new IrInstrUpsilon(i8, _i),
                            ],
                            jump: j10 = new IrDirectJump(_b),
                        }),
                        b11 = new IrBasicBlock({
                            instrs: [
                                i12 = new IrInstrPhi(),
                            ],
                        }),
                    ],
                }),
            ],
            fixups: () => {
                j3.trueTarget = b4;
                j3.falseTarget = b7;
                i5.phi = i12;
                j6.target = b11;
                i9.phi = i12;
                j10.target = b11;
            },
        });

        t.is(run(ir), '"moo"');
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let j3: IrBranchJump;
        let b4: IrBasicBlock;
        let i5: IrInstrUpsilon;
        let j6: IrDirectJump;
        let b7: IrBasicBlock;
        let i8: IrInstr;
        let i9: IrInstrUpsilon;
        let j10: IrDirectJump;
        let b11: IrBasicBlock;
        let i12: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetFalse(),
                                i2 = new IrInstrToBool(i1),
                            ],
                            jump: j3 = new IrBranchJump(i2, _b, _b),
                        }),
                        b4 = new IrBasicBlock({
                            instrs: [
                                i5 = new IrInstrUpsilon(i1, _i),
                            ],
                            jump: j6 = new IrDirectJump(_b),
                        }),
                        b7 = new IrBasicBlock({
                            instrs: [
                                i8 = new IrInstrGetStr(new StrValue("blue")),
                                i9 = new IrInstrUpsilon(i8, _i),
                            ],
                            jump: j10 = new IrDirectJump(_b),
                        }),
                        b11 = new IrBasicBlock({
                            instrs: [
                                i12 = new IrInstrPhi(),
                            ],
                        }),
                    ],
                }),
            ],
            fixups: () => {
                j3.trueTarget = b4;
                j3.falseTarget = b7;
                i5.phi = i12;
                j6.target = b11;
                i9.phi = i12;
                j10.target = b11;
            },
        });

        t.is(run(ir), '"blue"');
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let j3: IrBranchJump;
        let b4: IrBasicBlock;
        let i5: IrInstrUpsilon;
        let j6: IrDirectJump;
        let b7: IrBasicBlock;
        let i8: IrInstr;
        let i9: IrInstrUpsilon;
        let j10: IrDirectJump;
        let b11: IrBasicBlock;
        let i12: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetStr(new StrValue("blue")),
                                i2 = new IrInstrToBool(i1),
                            ],
                            jump: j3 = new IrBranchJump(i2, _b, _b),
                        }),
                        b4 = new IrBasicBlock({
                            instrs: [
                                i5 = new IrInstrUpsilon(i1, _i),
                            ],
                            jump: j6 = new IrDirectJump(_b),
                        }),
                        b7 = new IrBasicBlock({
                            instrs: [
                                i8 = new IrInstrGetFalse(),
                                i9 = new IrInstrUpsilon(i8, _i),
                            ],
                            jump: j10 = new IrDirectJump(_b),
                        }),
                        b11 = new IrBasicBlock({
                            instrs: [
                                i12 = new IrInstrPhi(),
                            ],
                        }),
                    ],
                }),
            ],
            fixups: () => {
                j3.trueTarget = b4;
                j3.falseTarget = b7;
                i5.phi = i12;
                j6.target = b11;
                i9.phi = i12;
                j10.target = b11;
            },
        });

        t.is(run(ir), '"blue"');
    }
});

