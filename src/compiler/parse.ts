import {
    E201_SyntaxError,
} from "./error";
import {
    Lexer,
} from "./lex";
import {
    ArgumentList,
    ArrayInitializerExpr,
    Block,
    BlockStatement,
    BoolLitExpr,
    CallExpr,
    CompUnit,
    Decl,
    DoExpr,
    EmptyStatement,
    Expr,
    ExprStatement,
    ForStatement,
    FuncDecl,
    IfClause,
    IfStatement,
    IndexingExpr,
    InfixOpExpr,
    IntLitExpr,
    LastStatement,
    NextStatement,
    NoneLitExpr,
    Parameter,
    ParameterList,
    ParenExpr,
    PrefixOpExpr,
    ReturnStatement,
    Statement,
    StrLitExpr,
    VarDecl,
    VarRefExpr,
    WhileStatement,
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
const assignmentStrength = 30;

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
    else if (kind === TokenKind.Assign) {
        return assignmentStrength;
    }
    else {
        throw new Error("Precondition error: unrecognized infix token");
    }
}

// Returns whether this precedence level/strength has operators associating to
// the left or to the right. The assignment operator is the only right-
// associative operator currently; all the others are left-associative.
function associativity(strength: number): "left" | "right" {
    return strength === assignmentStrength ? "right" : "left";
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
    TokenKind.Assign,
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

const statementStartTokens = new Set([
    ...termStartTokens,
    TokenKind.Semi,
    TokenKind.CurlyL,
    TokenKind.IfKeyword,
    TokenKind.ForKeyword,
    TokenKind.WhileKeyword,
    TokenKind.LastKeyword,
    TokenKind.NextKeyword,
    TokenKind.ReturnKeyword,
]);

const declStartTokens = new Set([
    TokenKind.MyKeyword,
    TokenKind.FuncKeyword,
]);

export class Parser {
    lexer: Lexer;

    constructor(lexer: Lexer) {
        this.lexer = lexer;
    }

    // low-level helper methods:

    private parseFail(expectation: string): never {
        throw new E201_SyntaxError(
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
        let lookahead = this.lexer.lookahead().kind;
        return statementStartTokens.has(lookahead);
    }

    private seeingStartOfDecl(): boolean {
        let lookahead = this.lexer.lookahead().kind;
        return declStartTokens.has(lookahead);
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

    parseCompUnit(): CompUnit {
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
        return new CompUnit(statements);
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
            let ifStatement = new IfStatement(clauses, elseBlock);
            return [ifStatement, true];
        }
        else if (this.accept(TokenKind.ForKeyword)) {
            let nameToken = this.accept(TokenKind.Identifier)!;
            this.advanceOver(TokenKind.InKeyword);
            let arrayExpr = this.parseExpr();
            let block = this.parseBlock();
            return [new ForStatement(nameToken, arrayExpr, block), true];
        }
        else if (this.accept(TokenKind.WhileKeyword)) {
            let condExpr = this.parseExpr();
            let block = this.parseBlock();
            return [new WhileStatement(condExpr, block), true];
        }
        else if (this.accept(TokenKind.LastKeyword)) {
            let sawSemi = Boolean(this.accept(TokenKind.Semi));
            return [new LastStatement(), sawSemi];
        }
        else if (this.accept(TokenKind.NextKeyword)) {
            let sawSemi = Boolean(this.accept(TokenKind.Semi));
            return [new NextStatement(), sawSemi];
        }
        else if (this.accept(TokenKind.ReturnKeyword)) {
            let expr: Expr | null = null;
            if (this.seeingStartOfExpr()) {
                expr = this.parseExpr();
            }
            let sawSemi = Boolean(this.accept(TokenKind.Semi));
            return [new ReturnStatement(expr), sawSemi];
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
                return [new VarDecl(nameToken, null, initExpr), sawSemi];
            }
            else {
                let sawSemi = Boolean(this.accept(TokenKind.Semi));
                return [new VarDecl(nameToken, null, null), sawSemi];
            }
        }
        else if (this.accept(TokenKind.FuncKeyword)) {
            this.expect(TokenKind.Identifier);
            let nameToken = this.accept(TokenKind.Identifier)!;
            this.advanceOver(TokenKind.ParenL);
            let paramList = this.parseParameterList();
            this.advanceOver(TokenKind.ParenR);
            let body = this.parseBlock();
            return [new FuncDecl(nameToken, paramList, null, body), true];
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
                    let inner = this.parseExpr();
                    this.advanceOver(TokenKind.ParenR);
                    termStack.push(new ParenExpr(inner));
                    expectation = "operator";
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
                else if (token = this.accept(TokenKind.SquareL)!) {
                    let indexExpr = this.parseExpr();
                    this.advanceOver(TokenKind.SquareR);
                    let array = termStack.pop()!;
                    termStack.push(new IndexingExpr(array, indexExpr));
                    expectation = "operator";
                }
                else if (token = this.accept(TokenKind.ParenL)!) {
                    let argList = this.parseArgumentList();
                    this.advanceOver(TokenKind.ParenR);
                    let func = termStack.pop()!;
                    termStack.push(new CallExpr(func, argList));
                    expectation = "operator";
                }
                else if (termStartTokens.has(token)) {
                    throw new E201_SyntaxError("Two terms in a row");
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

    parseParameterList(): ParameterList {
        let params: Array<Parameter> = [];
        while (!this.seeing(TokenKind.ParenR)) {
            this.expect(TokenKind.Identifier);
            let nameToken = this.accept(TokenKind.Identifier)!;
            let param = new Parameter(nameToken, null);
            params.push(param);
            if (!this.accept(TokenKind.Comma)) {
                break;
            }
        }
        return new ParameterList(params);
    }

    parseArgumentList(): ArgumentList {
        let args: Array<Expr> = [];
        while (!this.seeing(TokenKind.ParenR)) {
            let expr = this.parseExpr();
            args.push(expr);
            if (!this.accept(TokenKind.Comma)) {
                break;
            }
        }
        return new ArgumentList(args);
    }
}

