import {
    Token,
} from "./token";

export abstract class SyntaxNode {
    children: Array<SyntaxNode | null>;

    constructor(children: Array<SyntaxNode | null>) {
        this.children = children;
    }
}

export class CompUnit extends SyntaxNode {
    constructor(statements: Array<Statement | Decl>) {
        super(statements);
    }

    get statements(): Array<Statement | Decl> {
        return this.children as Array<Statement | Decl>;
    }
}

export class Block extends SyntaxNode {
    constructor(statements: Array<Statement | Decl>) {
        super(statements);
    }

    get statements(): Array<Statement | Decl> {
        return this.children as Array<Statement | Decl>;
    }
}

export abstract class Statement extends SyntaxNode {
}

export class ExprStatement extends Statement {
    constructor(expr: Expr) {
        super([expr]);
    }

    get expr(): Expr {
        return this.children[0] as Expr;
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

    get block(): Block {
        return this.children[0] as Block;
    }
}

export class IfClause extends SyntaxNode {
    constructor(condExpr: Expr, block: Block) {
        super([condExpr, block]);
    }

    get condExpr(): Expr {
        return this.children[0] as Expr;
    }

    get block(): Block {
        return this.children[1] as Block;
    }
}

export class IfClauseList extends SyntaxNode {
    get clauses(): Array<IfClause> {
        return this.children as Array<IfClause>;
    }
}

export class IfStatement extends Statement {
    constructor(clauses: Array<IfClause>, elseBlock: Block | null) {
        super([new IfClauseList(clauses), elseBlock]);
    }

    get clauseList(): IfClauseList {
        return this.children[0] as IfClauseList;
    }

    get elseBlock(): Block | null {
        return this.children[1] as Block | null;
    }
}

export class ForStatement extends Statement {
    constructor(name: Token, arrayExpr: Expr, body: Block) {
        super([name, arrayExpr, body]);
    }

    get name(): Token {
        return this.children[0] as Token;
    }

    get arrayExpr(): Expr {
        return this.children[1] as Expr;
    }

    get body(): Block {
        return this.children[2] as Block;
    }
}

export class WhileStatement extends Statement {
    constructor(condExpr: Expr, body: Block) {
        super([condExpr, body]);
    }

    get condExpr(): Expr {
        return this.children[0] as Expr;
    }

    get body(): Block {
        return this.children[1] as Block;
    }
}

export abstract class Decl extends SyntaxNode {
}

export class VarDecl extends Decl {
    constructor(name: Token, initExpr: Expr | null) {
        super([name, initExpr]);
    }

    get name(): Token {
        return this.children[0] as Token;
    }

    get initExpr(): Expr | null {
        return this.children[1] as Expr | null;
    }
}

export abstract class Expr extends SyntaxNode {
}

export class IntLitExpr extends Expr {
    constructor(token: Token) {
        super([token]);
    }

    get token(): Token {
        return this.children[0] as Token;
    }
}

export class StrLitExpr extends Expr {
    constructor(token: Token) {
        super([token]);
    }

    get token(): Token {
        return this.children[0] as Token;
    }
}

export class BoolLitExpr extends Expr {
    constructor(token: Token) {
        super([token]);
    }

    get token(): Token {
        return this.children[0] as Token;
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

    get token(): Token {
        return this.children[0] as Token;
    }

    get operand(): Expr {
        return this.children[1] as Expr;
    }
}

export class InfixOpExpr extends Expr {
    constructor(lhs: Expr, token: Token, rhs: Expr) {
        super([lhs, token, rhs]);
    }

    get lhs(): Expr {
        return this.children[0] as Expr;
    }

    get token(): Token {
        return this.children[1] as Token;
    }

    get rhs(): Expr {
        return this.children[2] as Expr;
    }
}

export class ParenExpr extends Expr {
    constructor(inner: Expr) {
        super([inner]);
    }

    get inner(): Expr {
        return this.children[0] as Expr;
    }
}

export class DoExpr extends Expr {
    constructor(statement: Statement) {
        super([statement]);
    }

    get statement(): Statement {
        return this.children[0] as Statement;
    }
}

export class ArrayInitializerExpr extends Expr {
    constructor(elements: Array<Expr>) {
        super(elements);
    }

    get elements(): Array<Expr> {
        return this.children as Array<Expr>;
    }
}

export class IndexingExpr extends Expr {
    constructor(array: Expr, index: Expr) {
        super([array, index]);
    }

    get array(): Expr {
        return this.children[0] as Expr;
    }

    get index(): Expr {
        return this.children[1] as Expr;
    }
}

export class VarRefExpr extends Expr {
    constructor(token: Token) {
        super([token]);
    }

    get token(): Token {
        return this.children[0] as Token;
    }
}

