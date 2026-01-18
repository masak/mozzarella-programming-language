import {
    E000_InternalError,
} from "./error";
import {
    IrBasicBlock,
    IrCompUnit,
    IrFunc,
    IrInstr,
    IrInstrAddInts,
    IrInstrConcat,
    IrInstrFloorDivInts,
    IrInstrGetFalse,
    IrInstrGetInt,
    IrInstrGetNone,
    IrInstrGetStr,
    IrInstrGetTrue,
    IrInstrModInts,
    IrInstrMulInts,
    IrInstrNegInt,
    IrInstrPosInt,
    IrInstrSubInts,
    IrInstrToStr,
} from "./ir";
import {
    BoolLitExpr,
    CompUnit,
    Expr,
    ExprStatement,
    InfixOpExpr,
    IntLitExpr,
    NoneLitExpr,
    PrefixOpExpr,
    StrLitExpr,
} from "./syntax";
import {
    TokenKind,
} from "./token";
import {
    IntValue,
    StrValue,
} from "../runtime/value";

export function syntaxToIr(compUnit: CompUnit): IrCompUnit {
    let instrs: Array<IrInstr> = [];

    function convertExpr(expr: Expr): IrInstr {
        let oldLength = instrs.length;

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
        else if (expr instanceof PrefixOpExpr) {
            let token = expr.opToken;
            if (token.kind === TokenKind.Plus) {
                let operand = convertExpr(expr.operand);
                instrs.push(new IrInstrPosInt(operand));
            }
            else if (token.kind === TokenKind.Minus) {
                let operand = convertExpr(expr.operand);
                instrs.push(new IrInstrNegInt(operand));
            }
            else if (token.kind === TokenKind.Tilde) {
                let operand = convertExpr(expr.operand);
                instrs.push(new IrInstrToStr(operand));
            }
            else {
                throw new E000_InternalError(
                    `Unknown prefix op type ${token.kind.kind}`
                );
            }
        }
        else if (expr instanceof InfixOpExpr) {
            let token = expr.opToken;
            if (token.kind === TokenKind.Plus) {
                let left = convertExpr(expr.lhs);
                let right = convertExpr(expr.rhs);
                instrs.push(new IrInstrAddInts(left, right));
            }
            else if (token.kind === TokenKind.Minus) {
                let left = convertExpr(expr.lhs);
                let right = convertExpr(expr.rhs);
                instrs.push(new IrInstrSubInts(left, right));
            }
            else if (token.kind === TokenKind.Mult) {
                let left = convertExpr(expr.lhs);
                let right = convertExpr(expr.rhs);
                instrs.push(new IrInstrMulInts(left, right));
            }
            else if (token.kind === TokenKind.FloorDiv) {
                let left = convertExpr(expr.lhs);
                let right = convertExpr(expr.rhs);
                instrs.push(new IrInstrFloorDivInts(left, right));
            }
            else if (token.kind === TokenKind.Mod) {
                let left = convertExpr(expr.lhs);
                let right = convertExpr(expr.rhs);
                instrs.push(new IrInstrModInts(left, right));
            }
            else if (token.kind === TokenKind.Tilde) {
                let left = convertExpr(expr.lhs);
                let right = convertExpr(expr.rhs);
                instrs.push(new IrInstrConcat(left, right));
            }
            else {
                throw new E000_InternalError(
                    `Unknown prefix op type ${token.kind.kind}`
                );
            }
        }
        else {
            throw new E000_InternalError(
                `Unrecognized expr ${expr.constructor.name}`
            );
        }

        if (instrs.length <= oldLength) {
            throw new E000_InternalError("No instructions added");
        }
        return instrs[instrs.length - 1];
    }

    for (let statement of compUnit.children) {
        if (statement === null) {
            // skip
        }
        else if (statement instanceof ExprStatement) {
            let expr = statement.expr;
            /* ignore */ convertExpr(expr);
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

