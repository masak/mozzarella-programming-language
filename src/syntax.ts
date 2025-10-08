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
    constructor(statements: Array<Statement | Decl>) {
        super(statements);
    }
}

export class Block extends SyntaxNode {
    constructor(statements: Array<Statement | Decl>) {
        super(statements);
    }
}

export abstract class Statement extends SyntaxNode {
}

export class ExprStatement extends Statement {
    constructor(expr: Expr) {
        super([expr]);
    }
}

export class EmptyStatement extends Statement {
    constructor() {
        super([]);
    }
}

export class BlockStatement extends Statement {
    constructor(block: Block) {
        super([block]);
    }
}

export class IfClause extends SyntaxNode {
    constructor(condExpr: Expr, block: Block) {
        super([condExpr, block]);
    }
}

class IfClauseList extends SyntaxNode {
}

export class IfStatement extends Statement {
    constructor(clauses: Array<IfClause>, elseBlock?: Block) {
        super(elseBlock
          ? [new IfClauseList(clauses), elseBlock]
          : [new IfClauseList(clauses)]);
    }
}

export abstract class Decl extends SyntaxNode {
}

export class VarDecl extends Decl {
    constructor(name: Token, initExpr?: Expr) {
        super(initExpr
            ? [name, initExpr]
            : [name]);
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

export class PrefixOpExpr extends Expr {
    constructor(token: Token, operand: Expr) {
        super([token, operand]);
    }
}

export class InfixOpExpr extends Expr {
    constructor(lhs: Expr, token: Token, rhs: Expr) {
        super([lhs, token, rhs]);
    }
}

export class ParenExpr extends Expr {
    constructor(inner: Expr) {
        super([inner]);
    }
}

export class DoExpr extends Expr {
    constructor(statement: Statement) {
        super([statement]);
    }
}

export class ArrayInitializerExpr extends Expr {
    constructor(elements: Array<Expr>) {
        super(elements);
    }
}

export class IndexingExpr extends Expr {
    constructor(array: Expr, index: Expr) {
        super([array, index]);
    }
}

