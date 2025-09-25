import {
    Token,
} from "./token";

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
}

export abstract class Expr extends SyntaxNode {
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

export class NoneLitExpr extends Expr {
    constructor() {
        super([]);
    }
}

