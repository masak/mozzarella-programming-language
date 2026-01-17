import {
    E000_InternalError,
} from "./error";
import {
    IrBasicBlock,
    IrCompUnit,
    IrFunc,
    IrInstr,
    IrInstrGetInt,
} from "./ir";
import {
    CompUnit,
    ExprStatement,
    IntLitExpr,
} from "./syntax";
import {
    IntValue,
} from "../runtime/value";

export function syntaxToIr(compUnit: CompUnit): IrCompUnit {
    let instrs: Array<IrInstr> = [];
    for (let statement of compUnit.children) {
        if (statement === null) {
            // skip
        }
        else if (statement instanceof ExprStatement) {
            let expr = statement.expr;
            if (expr instanceof IntLitExpr) {
                let valueToken = expr.valueToken;
                let value = new IntValue(valueToken.payload as bigint);
                instrs.push(new IrInstrGetInt(value));
            }
            else {
                throw new E000_InternalError(
                    `Unrecognized expr ${expr.constructor.name}`
                );
            }
        }
        else {
            throw new E000_InternalError(
                `Unrecognized statement ${statement.constructor.name}`
            );
        }
    }

    let irCompUnit = new IrCompUnit({
        funcs: [
            new IrFunc({
                blocks: [
                    new IrBasicBlock({ instrs }),
                ],
            }),
        ],
    });

    return irCompUnit;
}

