import {
    E000_InternalError,
    E201_SyntaxError,
} from "./error";
import {
    lex,
} from "./lex";
import {
    Argument,
    ArgumentList,
    ArrayInitializerExpr,
    Block,
    BlockStatement,
    BoolLitExpr,
    BoolNode,
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
    IfClauseList,
    IfStatement,
    IndexingExpr,
    InfixOpExpr,
    IntLitExpr,
    IntNode,
    LastStatement,
    MacroDecl,
    NextStatement,
    NoneLitExpr,
    Parameter,
    ParameterList,
    ParenExpr,
    PrefixOpExpr,
    QuoteExpr,
    ReturnStatement,
    Statement,
    StrLitExpr,
    StrNode,
    UnquoteExpr,
    VarDecl,
    VarRefExpr,
    WhileStatement,
} from "./syntax";
import {
    opTokenName,
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
        throw new E000_InternalError(
            "Precondition failed: unrecognized infix token"
        );
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
    TokenKind.Dollar,
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
    TokenKind.MacroKeyword,
]);

export class Parser {
    tokenStream: Generator<Token>;
    lookahead: Token;

    constructor(input: string) {
        this.tokenStream = lex(input);
        let next = this.tokenStream.next();
        if (next.done) {
            this.lookahead = new Token(TokenKind.Eof);
        }
        else {
            this.lookahead = next.value;
        }
    }

    // low-level helper methods:
    
    private advance() {
        let next = this.tokenStream.next();
        if (next.done) {
            this.lookahead = new Token(TokenKind.Eof);
        }
        else {
            this.lookahead = next.value;
        }
    }

    private parseFail(expectation: string): never {
        throw new E201_SyntaxError(
            `Expected ${expectation}, ` +
            `found ${this.lookahead.kind.kind}`
        );
    }

    private seeing(kind: TokenKind): boolean {
        return this.lookahead.kind === kind;
    }

    private seeingStartOfStatementOrDecl(): boolean {
        return this.seeingStartOfStatement() || this.seeingStartOfDecl();
    }

    private seeingStartOfStatement(): boolean {
        let lookaheadKind = this.lookahead.kind;
        return statementStartTokens.has(lookaheadKind);
    }

    private seeingStartOfDecl(): boolean {
        let lookaheadKind = this.lookahead.kind;
        return declStartTokens.has(lookaheadKind);
    }

    private seeingStartOfExpr(): boolean {
        let lookaheadKind = this.lookahead.kind;
        return termStartTokens.has(lookaheadKind);
    }

    private expect(kind: TokenKind): void {
        if (this.lookahead.kind !== kind) {
            this.parseFail(`token ${kind.kind}`);
        }
    }

    private accept(kind: TokenKind): Token | null {
        let token = this.lookahead;
        if (token.kind === kind) {
            this.advance();
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
        this.advance();
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

    parseStatementList(): Array<Statement | Decl> {
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
        return statements;
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
            let clauseList = new IfClauseList(clauses);
            let ifStatement = new IfStatement(clauseList, elseBlock);
            return [ifStatement, true];
        }
        else if (this.accept(TokenKind.ForKeyword)) {
            let nameToken = this.accept(TokenKind.Identifier)!;
            let name = new StrNode(nameToken.payload as string);
            this.advanceOver(TokenKind.InKeyword);
            let arrayExpr = this.parseExpr();
            let block = this.parseBlock();
            return [new ForStatement(name, arrayExpr, block), true];
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
            let name = new StrNode(nameToken.payload as string);
            if (this.accept(TokenKind.Assign)) {
                let initExpr = this.parseExpr();
                let sawSemi = Boolean(this.accept(TokenKind.Semi));
                return [new VarDecl(name, null, initExpr), sawSemi];
            }
            else {
                let sawSemi = Boolean(this.accept(TokenKind.Semi));
                return [new VarDecl(name, null, null), sawSemi];
            }
        }
        else if (this.accept(TokenKind.FuncKeyword)) {
            this.expect(TokenKind.Identifier);
            let nameToken = this.accept(TokenKind.Identifier)!;
            let name = new StrNode(nameToken.payload as string);
            this.advanceOver(TokenKind.ParenL);
            let paramList = this.parseParameterList();
            this.advanceOver(TokenKind.ParenR);
            let body = this.parseBlock();
            return [new FuncDecl(name, paramList, null, body), true];
        }
        else if (this.accept(TokenKind.MacroKeyword)) {
            this.expect(TokenKind.Identifier);
            let nameToken = this.accept(TokenKind.Identifier)!;
            let name = new StrNode(nameToken.payload as string);
            this.advanceOver(TokenKind.ParenL);
            let paramList = this.parseParameterList();
            this.advanceOver(TokenKind.ParenR);
            let body = this.parseBlock();
            return [new MacroDecl(name, paramList, null, body), true];
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
                throw new E000_InternalError(
                    "Precondition failed: unknown op type"
                );
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
                throw new E000_InternalError("Empty op stack during reduce");
            }
            let op = opStack.pop()!;
            if (op instanceof PrefixOp) {
                let operand = termStack.pop()!;
                let opName = new StrNode(opTokenName(op.token));
                termStack.push(new PrefixOpExpr(opName, operand));
            }
            else if (op instanceof InfixOp) {
                let rhs = termStack.pop()!;
                let lhs = termStack.pop()!;
                let opName = new StrNode(opTokenName(op.token));
                termStack.push(new InfixOpExpr(lhs, opName, rhs));
            }
            else {
                throw new E000_InternalError(
                    "Unknown kind of op during reduce"
                );
            }
        }

        while (true) {
            let token: Token;
            if (expectation === "term") {
                if (token = this.accept(TokenKind.IntLit)!) {
                    let intNode = new IntNode(token.payload as bigint);
                    termStack.push(new IntLitExpr(intNode));
                    expectation = "operator";
                }
                else if (token = this.accept(TokenKind.StrLit)!) {
                    let strNode = new StrNode(token.payload as string);
                    termStack.push(new StrLitExpr(strNode));
                    expectation = "operator";
                }
                else if (token = this.accept(TokenKind.FalseKeyword)!) {
                    let falseNode = new BoolNode(false);
                    termStack.push(new BoolLitExpr(falseNode));
                    expectation = "operator";
                }
                else if (token = this.accept(TokenKind.TrueKeyword)!) {
                    let trueNode = new BoolNode(true);
                    termStack.push(new BoolLitExpr(trueNode));
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
                       && !this.seeing(TokenKind.CurlyR)
                       && !this.seeing(TokenKind.ParenR)) {
                        this.parseFail("end of expression");
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
                    if (token.payload === "code"
                            && this.accept(TokenKind.Backquote)) {
                        let statementList = this.parseStatementList();
                        this.advanceOver(TokenKind.Backquote);
                        termStack.push(new QuoteExpr(statementList));
                    }
                    else {
                        let name = new StrNode(token.payload as string);
                        termStack.push(new VarRefExpr(name));
                    }
                    expectation = "operator";
                }
                else if (token = this.accept(TokenKind.Dollar)!) {
                    this.advanceOver(TokenKind.ParenL);
                    let innerExpr = this.parseExpr();
                    this.advanceOver(TokenKind.ParenR);
                    termStack.push(new UnquoteExpr(innerExpr));
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
            throw new E000_InternalError(
                "Precondition failed: multiple terms on term stack"
            );
        }
        else if (termStack.length < 1) {
            throw new E000_InternalError(
                "Precondition failed: term stack is empty"
            );
        }

        return termStack[0];
    }

    parseParameterList(): ParameterList {
        let params: Array<Parameter> = [];
        while (!this.seeing(TokenKind.ParenR)) {
            this.expect(TokenKind.Identifier);
            let nameToken = this.accept(TokenKind.Identifier)!;
            let name = new StrNode(nameToken.payload as string);
            let param = new Parameter(name, null);
            params.push(param);
            if (!this.accept(TokenKind.Comma)) {
                break;
            }
        }
        return new ParameterList(params);
    }

    parseArgumentList(): ArgumentList {
        let args: Array<Argument> = [];
        while (!this.seeing(TokenKind.ParenR)) {
            let expr = this.parseExpr();
            let arg = new Argument(expr);
            args.push(arg);
            if (!this.accept(TokenKind.Comma)) {
                break;
            }
        }
        return new ArgumentList(args);
    }
}

