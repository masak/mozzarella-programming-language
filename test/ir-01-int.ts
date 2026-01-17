import test from "ava";
import {
    IrBasicBlock,
    IrCompUnit,
    IrFunc,
    IrInstrGetInt,
} from "../src/compiler/ir";
import {
    run,
} from "../src/go";
import {
    IntValue,
} from "../src/runtime/value";

test("IR: integer literals", (t) => {
    {
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                new IrInstrGetInt(new IntValue(12345n)),
                            ],
                        }),
                    ],
                }),
            ],
        });

        t.is(run(ir), "12345");
    }

    {
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                new IrInstrGetInt(new IntValue(0n)),
                            ],
                        }),
                    ],
                }),
            ],
        });

        t.is(run(ir), "0");
    }

    {
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                new IrInstrGetInt(new IntValue(654321n)),
                            ],
                        }),
                    ],
                }),
            ],
        });

        t.is(run(ir), "654321");
    }
});

