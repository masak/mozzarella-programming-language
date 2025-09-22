import {
    evaluate,
} from "./evaluate";
import {
    Token,
} from "./token";
import {
    Value,
} from "./value";

export abstract class SyntaxNode {
    children: Array<SyntaxNode>;

    constructor(children: Array<SyntaxNode>) {
        this.children = children;
    }
}

export class Program extends SyntaxNode {
    constructor(expr: Expr) {
        super([expr]);
    }

    run(): Value {
        let expr = this.children[0] as Expr;
        let value = expr.evaluate();
        return value;
    }
}

export abstract class Expr extends SyntaxNode {
    evaluate(): Value {
        return evaluate(this);
    }
}

export class IntLitExpr extends Expr {
    constructor(token: Token) {
        super([token]);
    }
}

export class StrLitExpr extends Expr {
    constructor(token: Token) {
        super([token]);
    }
}

export class BoolLitExpr extends Expr {
    constructor(token: Token) {
        super([token]);
    }
}

