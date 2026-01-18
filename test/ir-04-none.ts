import test from "ava";
import {
    IrBasicBlock,
    IrCompUnit,
    IrFunc,
    IrInstrGetNone,
} from "../src/compiler/ir";
import {
    run,
} from "../src/go";

test("IR: none literal", (t) => {
    {
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                new IrInstrGetNone(),
                            ],
                        }),
                    ],
                }),
            ],
        });

        t.is(run(ir), "none");
    }
});

