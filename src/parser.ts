import {
    Lexer,
} from "./lexer";
import {
    BoolLitExpr,
    Expr,
    InfixOpExpr,
    IntLitExpr,
    NoneLitExpr,
    PrefixOpExpr,
    Program,
    StrLitExpr,
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

    // parse methods:

    parseProgram(): Program {
        let expr = this.parseExpr();
        this.expect(TokenKind.Eof);
        return new Program(expr);
    }

    parseExpr(): Expr {
        let expectation: "term" | "operator" = "term";
        let termStack: Array<Expr> = [];
        let opStack: Array<Op> = [];

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
                else if (token = this.accept(TokenKind.Plus)!
                            || this.accept(TokenKind.Minus)!) {
                    opStack.push(new PrefixOp(token));
                    expectation = "term";
                }
                else {
                    this.parseFail("expression");
                }
            }
            else {  // expectation === "operator"
                if (token = this.accept(TokenKind.Plus)!
                    || this.accept(TokenKind.Minus)!
                    || this.accept(TokenKind.Mult)!
                    || this.accept(TokenKind.FloorDiv)!
                    || this.accept(TokenKind.Mod)!) {
                    opStack.push(new InfixOp(token));
                }
                else {
                    break;  // anything unknown in op pos means we're done
                }
                expectation = "term";
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

