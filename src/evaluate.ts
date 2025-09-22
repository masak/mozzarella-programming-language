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
    IntLitExpr,
    NoneLitExpr,
    StrLitExpr,
} from "./syntax";
import {
    Token,
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
    else {
        throw new Error(`Unknown expr type ${expr.constructor.name}`);
    }
}

