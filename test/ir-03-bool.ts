import test from "ava";
import {
    IrBasicBlock,
    IrCompUnit,
    IrFunc,
    IrInstrGetFalse,
    IrInstrGetTrue,
} from "../src/compiler/ir";
import {
    run,
} from "../src/go";

test("IR: boolean literals", (t) => {
    {
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                new IrInstrGetFalse(),
                            ],
                        }),
                    ],
                }),
            ],
        });

        t.is(run(ir), "false");
    }

    {
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                new IrInstrGetTrue(),
                            ],
                        }),
                    ],
                }),
            ],
        });

        t.is(run(ir), "true");
    }
});

