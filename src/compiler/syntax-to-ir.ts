import {
    E000_InternalError,
} from "./error";
import {
    IrBasicBlock,
    IrCompUnit,
    IrFunc,
    IrInstr,
    IrInstrGetFalse,
    IrInstrGetInt,
    IrInstrGetNone,
    IrInstrGetStr,
    IrInstrGetTrue,
} from "./ir";
import {
    BoolLitExpr,
    CompUnit,
    ExprStatement,
    IntLitExpr,
    NoneLitExpr,
    StrLitExpr,
} from "./syntax";
import {
    IntValue,
    StrValue,
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
            else if (expr instanceof StrLitExpr) {
                let valueToken = expr.valueToken;
                let value = new StrValue(valueToken.payload as string);
                instrs.push(new IrInstrGetStr(value));
            }
            else if (expr instanceof BoolLitExpr) {
                let valueToken = expr.valueToken;
                if (valueToken.payload as boolean) {
                    instrs.push(new IrInstrGetTrue());
                }
                else {
                    instrs.push(new IrInstrGetFalse());
                }
            }
            else if (expr instanceof NoneLitExpr) {
                instrs.push(new IrInstrGetNone());
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

