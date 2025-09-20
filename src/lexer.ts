import {
    Token,
    TokenKind,
} from "./token";

export class Lexer {
    input: string;
    pos: number = 0;
    lookaheadPos: number = 0;

    constructor(input: string) {
        this.input = input;
    }

    // low-level helper methods:
    
    private seeingEof(): boolean {
        return this.pos >= this.input.length;
    }
    
    private seeingDigit(pos: number): boolean {
        return pos < this.input.length && /^\d/.test(this.charAt(pos));
    }

    private seeingUnderscore(pos: number): boolean {
        return pos < this.input.length && this.charAt(pos) === "_";
    }

    private charAt(pos: number): string {
        if (pos >= this.input.length) {
            throw new Error("Character at end of string");
        }
        return this.input.charAt(pos);
    }

    // lex methods:

    lookahead(): Token {
        if (this.seeingEof()) {
            return new Token(TokenKind.Eof);
        }
        else if (this.seeingDigit(this.pos)) {
            let pos = this.pos;
            let digits: Array<string> = [];
            while (this.seeingDigit(pos) || this.seeingUnderscore(pos)) {
                if (this.seeingUnderscore(pos)) {
                    pos += 1;
                }
                if (!this.seeingDigit(pos)) {
                    throw new Error("Lexer: expected digit");
                }
                digits.push(this.charAt(pos));
                pos += 1;
            }
            let n = BigInt(digits.join(""));
            this.lookaheadPos = pos;
            return new Token(TokenKind.IntLit, n);
        }
        else {
            throw new Error("Unrecognized token");
        }
    }

    advance(): void {
        if (this.pos === this.lookaheadPos) {
            throw new Error("Trying to advance but nothing to advance to");
        }
        this.pos = this.lookaheadPos;
    }
}

