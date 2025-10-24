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
    constructor(nameToken: Token, arrayExpr: Expr, body: Block) {
        super([nameToken, arrayExpr, body]);
    }

    get nameToken(): Token {
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
    constructor(nameToken: Token, initExpr: Expr | null) {
        super([nameToken, initExpr]);
    }

    get nameToken(): Token {
        return this.children[0] as Token;
    }

    get initExpr(): Expr | null {
        return this.children[1] as Expr | null;
    }
}

export abstract class Expr extends SyntaxNode {
}

export class IntLitExpr extends Expr {
    constructor(valueToken: Token) {
        super([valueToken]);
    }

    get valueToken(): Token {
        return this.children[0] as Token;
    }
}

export class StrLitExpr extends Expr {
    constructor(valueToken: Token) {
        super([valueToken]);
    }

    get valueToken(): Token {
        return this.children[0] as Token;
    }
}

export class BoolLitExpr extends Expr {
    constructor(valueToken: Token) {
        super([valueToken]);
    }

    get valueToken(): Token {
        return this.children[0] as Token;
    }
}

export class NoneLitExpr extends Expr {
    constructor() {
        super([]);
    }
}

export class PrefixOpExpr extends Expr {
    constructor(opToken: Token, operand: Expr) {
        super([opToken, operand]);
    }

    get opToken(): Token {
        return this.children[0] as Token;
    }

    get operand(): Expr {
        return this.children[1] as Expr;
    }
}

export class InfixOpExpr extends Expr {
    constructor(lhs: Expr, opToken: Token, rhs: Expr) {
        super([lhs, opToken, rhs]);
    }

    get lhs(): Expr {
        return this.children[0] as Expr;
    }

    get opToken(): Token {
        return this.children[1] as Token;
    }

    get rhs(): Expr {
        return this.children[2] as Expr;
    }
}

export class ParenExpr extends Expr {
    constructor(innerExpr: Expr) {
        super([innerExpr]);
    }

    get innerExpr(): Expr {
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
    constructor(arrayExpr: Expr, indexExpr: Expr) {
        super([arrayExpr, indexExpr]);
    }

    get arrayExpr(): Expr {
        return this.children[0] as Expr;
    }

    get indexExpr(): Expr {
        return this.children[1] as Expr;
    }
}

export class VarRefExpr extends Expr {
    constructor(nameToken: Token) {
        super([nameToken]);
    }

    get nameToken(): Token {
        return this.children[0] as Token;
    }
}

