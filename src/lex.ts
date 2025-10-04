import {
    Token,
    TokenKind,
} from "./token";

const WHITESPACE = /^\s*/;

export class Lexer {
    input: string;
    pos: number = 0;
    lookaheadPos: number = 0;

    constructor(input: string) {
        this.input = input;
    }

    // low-level helper methods:

    private skipWhitespace(): void {
        let n = this.input.substring(this.pos).match(WHITESPACE)![0].length;
        this.pos += n;
        this.lookaheadPos = this.pos;
    }
    
    private seeingEof(pos: number): boolean {
        return pos >= this.input.length;
    }
    
    private seeingDigit(pos: number): boolean {
        return pos < this.input.length && /^\d/.test(this.charAt(pos));
    }

    private seeingLetter(pos: number): boolean {
        return pos < this.input.length && /^[a-zA-z]/.test(this.charAt(pos));
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
        this.skipWhitespace();
        if (this.seeingEof(this.pos)) {
            return new Token(TokenKind.Eof);
        }
        else if (this.seeingDigit(this.pos)) {
            let pos = this.pos;
            let digits: Array<string> = [];
            while (this.seeingDigit(pos) || this.seeingChar("_", pos)) {
                if (this.seeingChar("_", pos)) {
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
        else if (this.seeingLetter(this.pos)) {
            let pos = this.pos;
            let characters: Array<string> = [];
            while (this.seeingLetter(pos)) {
                characters.push(this.charAt(pos));
                pos += 1;
            }
            this.lookaheadPos = pos;
            let name = characters.join("");
            if (name === "true") {
                return new Token(TokenKind.TrueKeyword, true);
            }
            else if (name === "false") {
                return new Token(TokenKind.FalseKeyword, false);
            }
            else if (name === "none") {
                return new Token(TokenKind.NoneKeyword);
            }
            else {
                throw new Error("Identifiers not supported yet");
            }
        }
        else if (this.seeingChar("+", this.pos)) {
            this.lookaheadPos = this.pos + 1;
            return new Token(TokenKind.Plus);
        }
        else if (this.seeingChar("-", this.pos)) {
            this.lookaheadPos = this.pos + 1;
            return new Token(TokenKind.Minus);
        }
        else if (this.seeingChar("*", this.pos)) {
            this.lookaheadPos = this.pos + 1;
            return new Token(TokenKind.Mult);
        }
        else if (this.seeingChar("/", this.pos)) {
            let pos = this.pos + 1;
            if (!this.seeingChar("/", pos)) {
                throw new Error("Unrecognized character after '/'");
            }
            pos += 1;
            this.lookaheadPos = pos;
            return new Token(TokenKind.FloorDiv);
        }
        else if (this.seeingChar("%", this.pos)) {
            this.lookaheadPos = this.pos + 1;
            return new Token(TokenKind.Mod);
        }
        else if (this.seeingChar("~", this.pos)) {
            this.lookaheadPos = this.pos + 1;
            return new Token(TokenKind.Tilde);
        }
        else if (this.seeingChar("?", this.pos)) {
            this.lookaheadPos = this.pos + 1;
            return new Token(TokenKind.Quest);
        }
        else if (this.seeingChar("!", this.pos)) {
            let pos = this.pos + 1;
            if (this.seeingChar("=", pos)) {
                pos += 1;
                this.lookaheadPos = pos;
                return new Token(TokenKind.BangEq);
            }
            this.lookaheadPos = pos;
            return new Token(TokenKind.Bang);
        }
        else if (this.seeingChar("&", this.pos)) {
            let pos = this.pos + 1;
            if (!this.seeingChar("&", pos)) {
                throw new Error("Unrecognized character after '&'");
            }
            pos += 1;
            this.lookaheadPos = pos;
            return new Token(TokenKind.AmpAmp);
        }
        else if (this.seeingChar("|", this.pos)) {
            let pos = this.pos + 1;
            if (!this.seeingChar("|", pos)) {
                throw new Error("Unrecognized character after '|'");
            }
            pos += 1;
            this.lookaheadPos = pos;
            return new Token(TokenKind.PipePipe);
        }
        else if (this.seeingChar("<", this.pos)) {
            let pos = this.pos + 1;
            if (this.seeingChar("=", pos)) {
                pos += 1;
                this.lookaheadPos = pos;
                return new Token(TokenKind.LessEq);
            }
            this.lookaheadPos = pos;
            return new Token(TokenKind.Less);
        }
        else if (this.seeingChar(">", this.pos)) {
            let pos = this.pos + 1;
            if (this.seeingChar("=", pos)) {
                pos += 1;
                this.lookaheadPos = pos;
                return new Token(TokenKind.GreaterEq);
            }
            this.lookaheadPos = pos;
            return new Token(TokenKind.Greater);
        }
        else if (this.seeingChar("=", this.pos)) {
            let pos = this.pos + 1;
            if (!this.seeingChar("=", pos)) {
                throw new Error("Unrecognized character after '='");
            }
            pos += 1;
            this.lookaheadPos = pos;
            return new Token(TokenKind.EqEq);
        }
        else if (this.seeingChar("(", this.pos)) {
            this.lookaheadPos = this.pos + 1;
            return new Token(TokenKind.ParenL);
        }
        else if (this.seeingChar(")", this.pos)) {
            this.lookaheadPos = this.pos + 1;
            return new Token(TokenKind.ParenR);
        }
        else if (this.seeingChar(";", this.pos)) {
            this.lookaheadPos = this.pos + 1;
            return new Token(TokenKind.Semi);
        }
        else {
            let tokenGuess = this.input
                .substring(this.pos, this.pos + 10)
                .replace(/\s.*/, "")
                .replace(/\w+$/, "");
            throw new Error(`Unrecognized token '${tokenGuess}'`);
        }
    }

    advance(): void {
        if (this.pos === this.lookaheadPos) {
            throw new Error("Trying to advance but nothing to advance to");
        }
        this.pos = this.lookaheadPos;
    }
}

