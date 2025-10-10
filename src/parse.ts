import {
    Lexer,
} from "./lex";
import {
    ArrayInitializerExpr,
    Block,
    BlockStatement,
    BoolLitExpr,
    Decl,
    DoExpr,
    EmptyStatement,
    Expr,
    ExprStatement,
    IfClause,
    IfStatement,
    IndexingExpr,
    InfixOpExpr,
    IntLitExpr,
    NoneLitExpr,
    ParenExpr,
    PrefixOpExpr,
    Program,
    Statement,
    StrLitExpr,
    VarDecl,
    VarRefExpr,
} from "./syntax";
import {
    Token,
    TokenKind,
} from "./token";

abstract class Op {
}

class PrefixOp extends Op {
    token: Token;

    constructor(token: Token) {
        super();
        this.token = token;
    }
}

class InfixOp extends Op {
    token: Token;

    constructor(token: Token) {
        super();
        this.token = token;
    }
}

class PostfixOp extends Op {
    token: Token;

    constructor(token: Token) {
        super();
        this.token = token;
    }
}

class ParenOp extends Op {
}

const comparisonOps = new Set([
    TokenKind.Less,
    TokenKind.LessEq,
    TokenKind.Greater,
    TokenKind.GreaterEq,
    TokenKind.EqEq,
    TokenKind.BangEq,
]);

const multiplicativeStrength = 90;
const additiveStrength = 80;
const concatenativeStrength = 70;
const comparativeStrength = 60;
const conjunctiveStrength = 50;
const disjunctiveStrength = 40;

// Binding strength of an infix token. Higher means tighter.
function strength(infixToken: Token): number {
    let kind = infixToken.kind;
    if ([TokenKind.Mult, TokenKind.FloorDiv, TokenKind.Mod].includes(kind)) {
        return multiplicativeStrength;
    }
    else if ([TokenKind.Plus, TokenKind.Minus].includes(kind)) {
        return additiveStrength;
    }
    else if (kind === TokenKind.Tilde) {
        return concatenativeStrength;
    }
    else if (comparisonOps.has(kind)) {
        return comparativeStrength;
    }
    else if (kind === TokenKind.AmpAmp) {
        return conjunctiveStrength;
    }
    else if (kind === TokenKind.PipePipe) {
        return disjunctiveStrength;
    }
    else {
        throw new Error("Precondition error: unrecognized infix token");
    }
}

// Returns whether this precedence level/strength has operators associating to
// the left or to the right. Currently we only have left-associating operators.
function associativity(strength: number): "left" | "right" {
    return "left";
}

const prefixOps = new Set([
    TokenKind.Plus,
    TokenKind.Minus,
    TokenKind.Tilde,
    TokenKind.Quest,
    TokenKind.Bang,
]);

const infixOps = new Set([
    TokenKind.Plus,
    TokenKind.Minus,
    TokenKind.Mult,
    TokenKind.FloorDiv,
    TokenKind.Mod,
    TokenKind.Tilde,
    TokenKind.AmpAmp,
    TokenKind.PipePipe,
    ...comparisonOps,
]);

const termStartTokens = new Set([
    TokenKind.IntLit,
    TokenKind.StrLit,
    TokenKind.FalseKeyword,
    TokenKind.TrueKeyword,
    TokenKind.NoneKeyword,
    TokenKind.ParenL,
    ...prefixOps,
    TokenKind.DoKeyword,
    TokenKind.SquareL,
    TokenKind.Identifier,
]);

export class Parser {
    lexer: Lexer;

    constructor(lexer: Lexer) {
        this.lexer = lexer;
    }

    // low-level helper methods:

    private parseFail(expectation: string): never {
        throw new Error(
            `Expected ${expectation}, ` +
            `found ${this.lexer.lookahead().kind.kind}`
        );
    }

    private seeing(kind: TokenKind): boolean {
        return this.lexer.lookahead().kind === kind;
    }

    private seeingStartOfStatementOrDecl(): boolean {
        return this.seeingStartOfStatement() || this.seeingStartOfDecl();
    }

    private seeingStartOfStatement(): boolean {
        return this.seeingStartOfExpr() || this.seeing(TokenKind.Semi) ||
            this.seeing(TokenKind.CurlyL) || this.seeing(TokenKind.IfKeyword);
    }

    private seeingStartOfDecl(): boolean {
        return this.seeing(TokenKind.MyKeyword);
    }

    private seeingStartOfExpr(): boolean {
        let lookahead = this.lexer.lookahead().kind;
        return termStartTokens.has(lookahead);
    }

    private expect(kind: TokenKind): void {
        if (this.lexer.lookahead().kind !== kind) {
            this.parseFail(`token ${kind.kind}`);
        }
    }

    private accept(kind: TokenKind): Token | null {
        let token = this.lexer.lookahead();
        if (token.kind === kind) {
            this.lexer.advance();
            return token;
        }
        return null;
    }

    private acceptAny(kinds: Set<TokenKind>): Token | null {
        for (let kind of kinds) {
            let token = this.accept(kind);
            if (token !== null) {
                return token;
            }
        }
        return null;
    }

    private advanceOver(kind: TokenKind): void {
        this.expect(kind);
        this.lexer.advance();
    }

    // parse methods:

    parseProgram(): Program {
        let statements: Array<Statement | Decl> = [];
        while (this.seeingStartOfStatementOrDecl()) {
            if (this.seeingStartOfStatement()) {
                let [statement, sawSemi] = this.parseStatement();
                statements.push(statement);
                if (!sawSemi) {
                    break;
                }
            }
            else {  // declaration
                let [decl, sawSemi] = this.parseDecl();
                statements.push(decl);
                if (!sawSemi) {
                    break;
                }
            }
        }
        this.expect(TokenKind.Eof);
        return new Program(statements);
    }

    parseStatement(): [Statement, boolean] {
        if (this.accept(TokenKind.Semi)) {
            return [new EmptyStatement(), true];
        }
        else if (this.seeingStartOfExpr()) {
            let expr = this.parseExpr();
            let sawSemi = Boolean(this.accept(TokenKind.Semi));
            return [new ExprStatement(expr), sawSemi];
        }
        else if (this.seeing(TokenKind.CurlyL)) {
            let block = this.parseBlock();
            return [new BlockStatement(block), true];
        }
        else if (this.accept(TokenKind.IfKeyword)) {
            let condExpr = this.parseExpr();
            let thenBlock = this.parseBlock();
            let clauses: Array<IfClause> = [new IfClause(condExpr, thenBlock)];
            let elseBlock: Block | null = null;
            while (this.accept(TokenKind.ElseKeyword)) {
                if (this.accept(TokenKind.IfKeyword)) {
                    let condExpr = this.parseExpr();
                    let thenBlock = this.parseBlock();
                    clauses.push(new IfClause(condExpr, thenBlock));
                }
                else if (this.seeing(TokenKind.CurlyL)) {
                    elseBlock = this.parseBlock();
                }
                else {
                    this.parseFail("'if' or block after 'else'");
                }
            }
            let ifStatement = elseBlock
                ? new IfStatement(clauses, elseBlock)
                : new IfStatement(clauses);
            return [ifStatement, true];
        }
        else {
            this.parseFail("statement");
        }
    }

    parseBlock(): Block {
        this.advanceOver(TokenKind.CurlyL);
        let statements: Array<Statement | Decl> = [];
        while (this.seeingStartOfStatementOrDecl()) {
            if (this.seeingStartOfStatement()) {
                let [statement, sawSemi] = this.parseStatement();
                statements.push(statement);
                if (!sawSemi) {
                    break;
                }
            }
            else {  // declaration
                let [decl, sawSemi] = this.parseDecl();
                statements.push(decl);
                if (!sawSemi) {
                    break;
                }
            }
        }
        this.advanceOver(TokenKind.CurlyR);
        return new Block(statements);
    }

    parseDecl(): [Decl, boolean] {
        if (this.accept(TokenKind.MyKeyword)) {
            this.expect(TokenKind.Identifier);
            let nameToken = this.accept(TokenKind.Identifier)!;
            if (this.accept(TokenKind.Assign)) {
                let initExpr = this.parseExpr();
                let sawSemi = Boolean(this.accept(TokenKind.Semi));
                return [new VarDecl(nameToken, initExpr), sawSemi];
            }
            else {
                let sawSemi = Boolean(this.accept(TokenKind.Semi));
                return [new VarDecl(nameToken), sawSemi];
            }
        }
        else {
            this.parseFail("declaration");
        }
    }

    parseExpr(): Expr {
        let expectation: "term" | "operator" = "term";
        let termStack: Array<Expr> = [];
        let opStack: Array<Op> = [];

        function topOfStackIsTighterThan(incomingToken: Token): boolean {
            if (opStack.length === 0) { // vacuously false
                return false;
            }
            let topOfStack = opStack[opStack.length - 1]; // guaranteed
            if (topOfStack instanceof PrefixOp) { // always tighter
                return true;
            }
            else if (topOfStack instanceof ParenOp) { // not really an op
                return false;
            }
            else if (topOfStack instanceof PostfixOp) {
                throw new Error("Precondition failed: postfix op on stack");
            }
            if (!(topOfStack instanceof InfixOp)) {
                throw new Error("Precondition failed: unknown op type");
            }
            let topOpToken = topOfStack.token;
            let topOpStrength = strength(topOpToken);
            let incomingStrength = strength(incomingToken);
            return topOpStrength > incomingStrength /* tighter */ ||
                (topOpStrength === incomingStrength
                     && associativity(topOpStrength) === "left");
        }

        function reduce(): void {
            if (opStack.length === 0) {
                throw new Error("Empty op stack during reduce");
            }
            let op = opStack.pop()!;
            if (op instanceof PrefixOp) {
                let operand = termStack.pop()!;
                termStack.push(new PrefixOpExpr(op.token, operand));
            }
            else if (op instanceof InfixOp) {
                let rhs = termStack.pop()!;
                let lhs = termStack.pop()!;
                termStack.push(new InfixOpExpr(lhs, op.token, rhs));
            }
            else if (op instanceof PostfixOp) {
                if (op.token.kind === TokenKind.SquareL) {
                    let index = termStack.pop()!;
                    let array = termStack.pop()!;
                    termStack.push(new IndexingExpr(array, index));
                }
                else {
                    throw new Error("Unknown postfix op");
                }
            }
            else {
                throw new Error("Unknown kind of op during reduce");
            }
        }

        while (true) {
            let token: Token;
            if (expectation === "term") {
                if (token = this.accept(TokenKind.IntLit)!) {
                    termStack.push(new IntLitExpr(token));
                    expectation = "operator";
                }
                else if (token = this.accept(TokenKind.StrLit)!) {
                    termStack.push(new StrLitExpr(token));
                    expectation = "operator";
                }
                else if (token = this.accept(TokenKind.FalseKeyword)!) {
                    termStack.push(new BoolLitExpr(token));
                    expectation = "operator";
                }
                else if (token = this.accept(TokenKind.TrueKeyword)!) {
                    termStack.push(new BoolLitExpr(token));
                    expectation = "operator";
                }
                else if (token = this.accept(TokenKind.NoneKeyword)!) {
                    termStack.push(new NoneLitExpr());
                    expectation = "operator";
                }
                else if (token = this.acceptAny(prefixOps)!) {
                    opStack.push(new PrefixOp(token));
                    expectation = "term";
                }
                else if (token = this.accept(TokenKind.ParenL)!) {
                    opStack.push(new ParenOp());
                    expectation = "term";
                }
                else if (token = this.accept(TokenKind.ParenR)!) {
                    this.parseFail("term");
                }
                else if (token = this.accept(TokenKind.DoKeyword)!) {
                    let [statement, sawSemi] = this.parseStatement();
                    if (!sawSemi && !this.seeing(TokenKind.Eof)
                       && !this.seeing(TokenKind.CurlyR)) {
                        this.parseFail("semicolon or closing curly brace");
                    }
                    termStack.push(new DoExpr(statement));
                    expectation = "operator";
                }
                else if (token = this.accept(TokenKind.SquareL)!) {
                    let elements: Array<Expr> = [];
                    while (!this.seeing(TokenKind.SquareR)) {
                        let expr = this.parseExpr();
                        elements.push(expr);
                        if (!this.accept(TokenKind.Comma)) {
                            break;
                        }
                    }
                    this.advanceOver(TokenKind.SquareR);
                    termStack.push(new ArrayInitializerExpr(elements));
                    expectation = "operator";
                }
                else if (token = this.accept(TokenKind.Identifier)!) {
                    termStack.push(new VarRefExpr(token));
                    expectation = "operator";
                }
                else {
                    this.parseFail("expression");
                }
            }
            else {  // expectation === "operator"
                if (token = this.acceptAny(infixOps)!) {
                    while (topOfStackIsTighterThan(token)) {
                        reduce();
                    }
                    opStack.push(new InfixOp(token));
                    expectation = "term";
                }
                else if (token = this.accept(TokenKind.ParenR)!) {
                    if (!opStack.some((op) => op instanceof ParenOp)) {
                        throw new Error("')' without '('");
                    }
                    while (!(opStack[opStack.length - 1] instanceof ParenOp)) {
                        reduce();
                    }
                    opStack.pop();  // the ParenL
                    let inner = termStack.pop()!;
                    termStack.push(new ParenExpr(inner));
                    expectation = "operator";
                }
                else if (token = this.accept(TokenKind.SquareL)!) {
                    let indexExpr = this.parseExpr();
                    this.advanceOver(TokenKind.SquareR);
                    opStack.push(new PostfixOp(token));
                    termStack.push(indexExpr);
                    reduce();
                    expectation = "operator";
                }
                else if (termStartTokens.has(token)) {
                    throw new Error("Two terms in a row");
                }
                else {
                    break;  // anything unknown in op pos means we're done
                }
            }
        }

        while (opStack.length > 0) {
            reduce();
        }

        if (termStack.length > 1) {
            throw new Error("Too many terms left -- impossible");
        }
        else if (termStack.length < 1) {
            throw new Error("Not enough terms left -- impossible");
        }

        return termStack[0];
    }
}

