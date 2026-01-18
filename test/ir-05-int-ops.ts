import test from "ava";
import {
    IrBasicBlock,
    IrCompUnit,
    IrFunc,
    IrInstr,
    IrInstrAddInts,
    IrInstrFloorDivInts,
    IrInstrGetInt,
    IrInstrModInts,
    IrInstrMulInts,
    IrInstrNegInt,
    IrInstrPosInt,
    IrInstrSubInts,
} from "../src/compiler/ir";
import {
    E601_ZeroDivisionError,
    run,
} from "../src/go";
import {
    IntValue,
} from "../src/runtime/value";

test("IR: integer operations", (t) => {
    {
        let i1: IrInstr;
        let i2: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetInt(new IntValue(10203n)),
                                i2 = new IrInstrGetInt(new IntValue(4050n)),
                                new IrInstrAddInts(i1, i2),
                            ],
                        }),
                    ],
                }),
            ],
        });

        t.is(run(ir), "14253");
    }

    {
        let i1: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetInt(new IntValue(777n)),
                                new IrInstrPosInt(i1),
                            ],
                        }),
                    ],
                }),
            ],
        });

        t.is(run(ir), "777");
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
                                i1 = new IrInstrGetInt(new IntValue(1000n)),
                                i2 = new IrInstrGetInt(new IntValue(400n)),
                                new IrInstrSubInts(i1, i2),
                            ],
                        }),
                    ],
                }),
            ],
        });

        t.is(run(ir), "600");
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
                                i1 = new IrInstrGetInt(new IntValue(200n)),
                                i2 = new IrInstrGetInt(new IntValue(700n)),
                                new IrInstrSubInts(i1, i2),
                            ],
                        }),
                    ],
                }),
            ],
        });

        t.is(run(ir), "-500");
    }

    {
        let i1: IrInstr;
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                i1 = new IrInstrGetInt(new IntValue(54321n)),
                                new IrInstrNegInt(i1),
                            ],
                        }),
                    ],
                }),
            ],
        });

        t.is(run(ir), "-54321");
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
                                i1 = new IrInstrGetInt(new IntValue(111n)),
                                i2 = new IrInstrGetInt(new IntValue(111n)),
                                new IrInstrMulInts(i1, i2),
                            ],
                        }),
                    ],
                }),
            ],
        });

        t.is(run(ir), "12321");
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
                                i1 = new IrInstrGetInt(new IntValue(100n)),
                                i2 = new IrInstrGetInt(new IntValue(5n)),
                                new IrInstrFloorDivInts(i1, i2),
                            ],
                        }),
                    ],
                }),
            ],
        });

        t.is(run(ir), "20");
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
                                i1 = new IrInstrGetInt(new IntValue(102n)),
                                i2 = new IrInstrGetInt(new IntValue(5n)),
                                new IrInstrFloorDivInts(i1, i2),
                            ],
                        }),
                    ],
                }),
            ],
        });

        t.is(run(ir), "20");
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
                                i1 = new IrInstrGetInt(new IntValue(97n)),
                                i2 = new IrInstrGetInt(new IntValue(5n)),
                                new IrInstrFloorDivInts(i1, i2),
                            ],
                        }),
                    ],
                }),
            ],
        });

        t.is(run(ir), "19");
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
                                i1 = new IrInstrGetInt(new IntValue(100n)),
                                i2 = new IrInstrGetInt(new IntValue(5n)),
                                new IrInstrModInts(i1, i2),
                            ],
                        }),
                    ],
                }),
            ],
        });

        t.is(run(ir), "0");
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
                                i1 = new IrInstrGetInt(new IntValue(102n)),
                                i2 = new IrInstrGetInt(new IntValue(5n)),
                                new IrInstrModInts(i1, i2),
                            ],
                        }),
                    ],
                }),
            ],
        });

        t.is(run(ir), "2");
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
                                i1 = new IrInstrGetInt(new IntValue(98n)),
                                i2 = new IrInstrGetInt(new IntValue(5n)),
                                new IrInstrModInts(i1, i2),
                            ],
                        }),
                    ],
                }),
            ],
        });

        t.is(run(ir), "3");
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
                                i2 = new IrInstrGetInt(new IntValue(0n)),
                                new IrInstrFloorDivInts(i1, i2),
                            ],
                        }),
                    ],
                }),
            ],
        });

        t.throws(() => run(ir), { instanceOf: E601_ZeroDivisionError });
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
                                i1 = new IrInstrGetInt(new IntValue(19n)),
                                i2 = new IrInstrGetInt(new IntValue(0n)),
                                new IrInstrModInts(i1, i2),
                            ],
                        }),
                    ],
                }),
            ],
        });

        t.throws(() => run(ir), { instanceOf: E601_ZeroDivisionError });
    }
});

