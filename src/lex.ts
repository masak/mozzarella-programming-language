import {
    Token,
    TokenKind,
} from "./token";

const WHITESPACE = /^\s*/;

type ChoiceTree = Map<string, [TokenKind | null, [string, TokenKind] | null]>;

const choiceTree: ChoiceTree = new Map([
    ["+", [TokenKind.Plus, null]],
    ["-", [TokenKind.Minus, null]],
    ["*", [TokenKind.Mult, null]],
    ["/", [null,
        ["/", TokenKind.FloorDiv]]],
    ["%", [TokenKind.Mod, null]],
    ["~", [TokenKind.Tilde, null]],
    ["?", [TokenKind.Quest, null]],
    ["!", [TokenKind.Bang,
        ["=", TokenKind.BangEq]]],
    ["&", [null,
        ["&", TokenKind.AmpAmp]]],
    ["|", [null,
        ["|", TokenKind.PipePipe]]],
    ["<", [TokenKind.Less,
        ["=", TokenKind.LessEq]]],
    [">", [TokenKind.Greater,
        ["=", TokenKind.GreaterEq]]],
    ["=", [TokenKind.Assign,
        ["=", TokenKind.EqEq]]],
    ["(", [TokenKind.ParenL, null]],
    [")", [TokenKind.ParenR, null]],
    [";", [TokenKind.Semi, null]],
    ["{", [TokenKind.CurlyL, null]],
    ["}", [TokenKind.CurlyR, null]],
    ["[", [TokenKind.SquareL, null]],
    ["]", [TokenKind.SquareR, null]],
    [",", [TokenKind.Comma, null]],
]);

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
        return pos < this.input.length && /^[a-zA-Z]/.test(this.charAt(pos));
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
        let choice: [TokenKind | null, [string, TokenKind] | null];
        if (this.seeingEof(this.pos)) {
            return new Token(TokenKind.Eof);
        }
        else if (choice = choiceTree.get(this.charAt(this.pos))!) {
            let pos = this.pos + 1;
            let [tokenKind1, ch2Info] = choice;
            if (tokenKind1 === null) {
                if (ch2Info === null) {
                    throw new Error(
                        "Precondition failed: both components null"
                    );
                }
                let [ch2, tokenKind2] = ch2Info;
                if (!this.seeingChar(ch2, pos)) {
                    throw new Error(
                        "Unrecognized character after '" +
                            this.charAt(this.pos) + "'"
                    );
                }
                pos += 1;
                this.lookaheadPos = pos;
                return new Token(tokenKind2);
            }
            else {
                if (ch2Info === null) {
                    this.lookaheadPos = pos;
                    return new Token(tokenKind1);
                }
                else {
                    let [ch2, tokenKind2] = ch2Info;
                    if (this.seeingChar(ch2, pos)) {
                        pos += 1;
                        this.lookaheadPos = pos;
                        return new Token(tokenKind2);
                    }
                    this.lookaheadPos = pos;
                    return new Token(tokenKind1);
                }
            }
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
            else if (name === "do") {
                return new Token(TokenKind.DoKeyword);
            }
            else if (name === "if") {
                return new Token(TokenKind.IfKeyword);
            }
            else if (name === "else") {
                return new Token(TokenKind.ElseKeyword);
            }
            else if (name === "my") {
                return new Token(TokenKind.MyKeyword);
            }
            else {
                return new Token(TokenKind.Identifier, name);
            }
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

