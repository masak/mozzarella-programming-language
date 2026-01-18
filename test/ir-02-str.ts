import test from "ava";
import {
    IrBasicBlock,
    IrCompUnit,
    IrFunc,
    IrInstrGetStr,
} from "../src/compiler/ir";
import {
    run,
} from "../src/go";
import {
    StrValue,
} from "../src/runtime/value";

test("IR: string literals", (t) => {
    {
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                new IrInstrGetStr(new StrValue("")),
                            ],
                        }),
                    ],
                }),
            ],
        });

        t.is(run(ir), '""');
    }

    {
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                new IrInstrGetStr(new StrValue("abc")),
                            ],
                        }),
                    ],
                }),
            ],
        });

        t.is(run(ir), '"abc"');
    }

    {
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                new IrInstrGetStr(new StrValue("x\n\r\"y")),
                            ],
                        }),
                    ],
                }),
            ],
        });

        t.is(run(ir), '"x\\n\\r\\"y"');
    }

    {
        let ir = new IrCompUnit({
            funcs: [
                new IrFunc({
                    blocks: [
                        new IrBasicBlock({
                            instrs: [
                                new IrInstrGetStr(new StrValue("tabs\ttabs")),
                            ],
                        }),
                    ],
                }),
            ],
        });

        t.is(run(ir), '"tabs\\ttabs"');
    }
});

