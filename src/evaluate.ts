import {
    IntValue,
    Value,
} from "./value";
import {
    Expr,
    IntLitExpr,
} from "./syntax";
import {
    Token,
} from "./token";

export function evaluate(expr: Expr): Value {
    if (expr instanceof IntLitExpr) {
        let payload = (expr.children[0] as Token).payload as bigint;
        return new IntValue(payload);
    }
    else {
        throw new Error(`Unknown expr type ${expr.constructor.name}`);
    }
}

