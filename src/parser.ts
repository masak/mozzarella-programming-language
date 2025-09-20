import {
    Lexer,
} from "./lexer";
import {
    Expr,
    IntLitExpr,
    Program,
} from "./syntax";
import {
    Token,
    TokenKind,
} from "./token";

export class Parser {
    lexer: Lexer;

    constructor(lexer: Lexer) {
        this.lexer = lexer;
    }

    // low-level helper methods:

    private parseFail(expectation: string): never {
        throw new Error(
            `Expected ${expectation}, found ${this.lexer.lookahead().kind}`
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
        let token: Token;
        if (token = this.accept(TokenKind.IntLit)!) {
            return new IntLitExpr(token);
        }
        else {
            this.parseFail("expression");
        }
    }
}

