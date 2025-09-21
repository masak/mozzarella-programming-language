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
    
    private seeingEof(pos: number): boolean {
        return pos >= this.input.length;
    }
    
    private seeingDigit(pos: number): boolean {
        return pos < this.input.length && /^\d/.test(this.charAt(pos));
    }

    private seeingUnderscore(pos: number): boolean {
        return pos < this.input.length && this.charAt(pos) === "_";
    }

    private seeingChar(char: string, pos: number): boolean {
        return pos < this.input.length && this.charAt(pos) === char;
    }

    private charAt(pos: number): string {
        if (pos >= this.input.length) {
            throw new Error("Character at end of string");
        }
        return this.input.charAt(pos);
    }

    private expected(char: string, pos: number): never {
        if (pos >= this.input.length) {
            throw new Error(`Expected '${char}', found eof`);
        }
        else {
            throw new Error(`Expected '${char}', found ${this.charAt(pos)}`);
        }
    }

    // lex methods:

    lookahead(): Token {
        if (this.seeingEof(this.pos)) {
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
        else if (this.seeingChar('"', this.pos)) {
            let pos = this.pos + 1;
            let characters: Array<string> = [];
            while (!this.seeingEof(pos) && !this.seeingChar('"', pos)) {
                if (this.seeingChar("\\", pos)) {   // escaped character
                    pos += 1;
                    if (this.seeingChar("n", pos)) {
                        characters.push("\n");
                    }
                    else if (this.seeingChar("r", pos)) {
                        characters.push("\r");
                    }
                    else if (this.seeingChar("t", pos)) {
                        characters.push("\t");
                    }
                    else if (this.seeingChar('"', pos)) {
                        characters.push('"');
                    }
                    else if (this.seeingChar("\\", pos)) {
                        characters.push("\\");
                    }
                    else {
                        throw new Error("Unrecognized escape character");
                    }
                }
                else {
                    characters.push(this.charAt(pos));
                }
                pos += 1;
            }
            if (!this.seeingChar('"', pos)) {
                this.expected('"', pos);
            }
            pos += 1;
            let s = characters.join("");
            this.lookaheadPos = pos;
            return new Token(TokenKind.StrLit, s);
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

