import {
    BoolValue,
    IntValue,
    NoneValue,
    StrValue,
    Value,
} from "./value";
import {
    BoolLitExpr,
    Expr,
    InfixOpExpr,
    IntLitExpr,
    NoneLitExpr,
    PrefixOpExpr,
    Program,
    StrLitExpr,
} from "./syntax";
import {
    Token,
    TokenKind,
} from "./token";

export function evaluate(expr: Expr): Value {
    if (expr instanceof IntLitExpr) {
        let payload = (expr.children[0] as Token).payload as bigint;
        return new IntValue(payload);
    }
    else if (expr instanceof StrLitExpr) {
        let payload = (expr.children[0] as Token).payload as string;
        return new StrValue(payload);
    }
    else if (expr instanceof BoolLitExpr) {
        let payload = (expr.children[0] as Token).payload as boolean;
        return new BoolValue(payload);
    }
    else if (expr instanceof NoneLitExpr) {
        return new NoneValue();
    }
    else if (expr instanceof PrefixOpExpr) {
        let token = expr.children[0] as Token;
        let operand = expr.children[1] as Expr;
        if (token.kind === TokenKind.Plus) {
            let operandValue = evaluate(operand);
            if (!(operandValue instanceof IntValue)) {
                throw new Error("Expected Int as operand of +");
            }
            return new IntValue(operandValue.payload);
        }
        else if (token.kind === TokenKind.Minus) {
            let operandValue = evaluate(operand);
            if (!(operandValue instanceof IntValue)) {
                throw new Error("Expected Int as operand of -");
            }
            return new IntValue(-operandValue.payload);
        }
        else {
            throw new Error(`Unknown prefix op type ${token.kind.kind}`);
        }
    }
    else if (expr instanceof InfixOpExpr) {
        let lhs = expr.children[0] as Expr;
        let token = expr.children[1] as Token;
        let rhs = expr.children[2] as Expr;
        if (token.kind === TokenKind.Plus) {
            let left = evaluate(lhs);
            if (!(left instanceof IntValue)) {
                throw new Error("Expected Int as lhs of +");
            }
            let right = evaluate(rhs);
            if (!(right instanceof IntValue)) {
                throw new Error("Expected Int as rhs of +");
            }
            return new IntValue(left.payload + right.payload);
        }
        else if (token.kind === TokenKind.Minus) {
            let left = evaluate(lhs);
            if (!(left instanceof IntValue)) {
                throw new Error("Expected Int as lhs of -");
            }
            let right = evaluate(rhs);
            if (!(right instanceof IntValue)) {
                throw new Error("Expected Int as rhs of -");
            }
            return new IntValue(left.payload - right.payload);
        }
        else if (token.kind === TokenKind.Mult) {
            let left = evaluate(lhs);
            if (!(left instanceof IntValue)) {
                throw new Error("Expected Int as lhs of *");
            }
            let right = evaluate(rhs);
            if (!(right instanceof IntValue)) {
                throw new Error("Expected Int as rhs of *");
            }
            return new IntValue(left.payload * right.payload);
        }
        else if (token.kind === TokenKind.FloorDiv) {
            let left = evaluate(lhs);
            if (!(left instanceof IntValue)) {
                throw new Error("Expected Int as lhs of //");
            }
            let right = evaluate(rhs);
            if (!(right instanceof IntValue)) {
                throw new Error("Expected Int as rhs of //");
            }
            if (right.payload === 0n) {
                throw new Error("Division by 0");
            }
            let negative = left.payload < 0n !== right.payload < 0n;
            let nonZeroMod = left.payload % right.payload !== 0n;
            let diff = negative && nonZeroMod ? 1n : 0n;
            return new IntValue(left.payload / right.payload - diff);
        }
        else if (token.kind === TokenKind.Mod) {
            let left = evaluate(lhs);
            if (!(left instanceof IntValue)) {
                throw new Error("Expected Int as lhs of %");
            }
            let right = evaluate(rhs);
            if (!(right instanceof IntValue)) {
                throw new Error("Expected Int as rhs of %");
            }
            if (right.payload === 0n) {
                throw new Error("Division by 0");
            }
            return new IntValue(left.payload % right.payload);
        }
        else {
            throw new Error(`Unknown infix op type ${token.kind.kind}`);
        }
    }
    else {
        throw new Error(`Unknown expr type ${expr.constructor.name}`);
    }
}

export function runProgram(program: Program): Value {
    let expr = program.children[0] as Expr;
    let value = evaluate(expr);
    return value;
}

