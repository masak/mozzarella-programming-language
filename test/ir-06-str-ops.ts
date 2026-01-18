import test from "ava";
import {
    IrBasicBlock,
    IrCompUnit,
    IrFunc,
    IrInstr,
    IrInstrConcat,
    IrInstrGetFalse,
    IrInstrGetInt,
    IrInstrGetNone,
    IrInstrGetStr,
    IrInstrGetTrue,
    IrInstrNegInt,
    IrInstrToStr,
} from "../src/compiler/ir";
import {
    run,
} from "../src/go";
import {
    IntValue,
    StrValue,
} from "../src/runtime/value";

test("IR: string operations", (t) => {
    {
        let i1: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetInt(new IntValue(7n)),
                                new IrInstrToStr(i1),
                            ],
                        }),
                    ],
                }),
            ],
        });

        t.is(run(ir), '"7"');
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
                                new IrInstrToStr(i1),
                            ],
                        }),
                    ],
                }),
            ],
        });

        t.is(run(ir), '"0"');
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
                                i2 = new IrInstrNegInt(i1),
                                new IrInstrToStr(i2),
                            ],
                        }),
                    ],
                }),
            ],
        });

        t.is(run(ir), '"-5"');
    }

    {
        let i1: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetStr(new StrValue("abc")),
                                new IrInstrToStr(i1),
                            ],
                        }),
                    ],
                }),
            ],
        });

        t.is(run(ir), '"abc"');
    }

    {
        let i1: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetStr(new StrValue("  ")),
                                new IrInstrToStr(i1),
                            ],
                        }),
                    ],
                }),
            ],
        });

        t.is(run(ir), '"  "');
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
                                new IrInstrToStr(i1),
                            ],
                        }),
                    ],
                }),
            ],
        });

        t.is(run(ir), '""');
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
                                new IrInstrToStr(i1),
                            ],
                        }),
                    ],
                }),
            ],
        });

        t.is(run(ir), '"true"');
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
                                new IrInstrToStr(i1),
                            ],
                        }),
                    ],
                }),
            ],
        });

        t.is(run(ir), '"false"');
    }

    {
        let i1: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetNone(),
                                new IrInstrToStr(i1),
                            ],
                        }),
                    ],
                }),
            ],
        });

        t.is(run(ir), '"none"');
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let i3: IrInstr;
        let i4: IrInstr;
        let i5: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetTrue(),
                                i2 = new IrInstrGetNone(),
                                i3 = new IrInstrConcat(i1, i2),
                                i4 = new IrInstrGetInt(new IntValue(6n)),
                                i5 = new IrInstrNegInt(i4),
                                new IrInstrConcat(i3, i5),
                            ],
                        }),
                    ],
                }),
            ],
        });

        t.is(run(ir), '"truenone-6"');
    }

    {
        let i1: IrInstr;
        let i2: IrInstr;
        let i3: IrInstr;
        let i4: IrInstr;
        let i5: IrInstr;
        let i6: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetInt(new IntValue(0n)),
                                i2 = new IrInstrGetInt(new IntValue(0n)),
                                i3 = new IrInstrConcat(i1, i2),
                                i4 = new IrInstrGetStr(new StrValue("")),
                                i5 = new IrInstrConcat(i3, i4),
                                i6 = new IrInstrGetFalse(),
                                new IrInstrConcat(i5, i6),
                            ],
                        }),
                    ],
                }),
            ],
        });

        t.is(run(ir), '"00false"');
    }
});

