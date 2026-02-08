import {
    E000_InternalError,
    E101_LexerError,
} from "./error";
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
]);

export function* lex(input: string): Generator<Token> {
    let pos: number = 0;

    function skipWhitespace(): void {
        let n = input.substring(pos).match(WHITESPACE)![0].length;
        pos += n;
    }
    
    function seeingEof(pos: number): boolean {
        return pos >= input.length;
    }

    function seeingDigit(): boolean {
        return pos < input.length && /^\d/.test(input.charAt(pos));
    }

    function seeingLetter(): boolean {
        return pos < input.length && /^[a-zA-Z]/.test(input.charAt(pos));
    }

    function seeingChar(char: string): boolean {
        return pos < input.length && input.charAt(pos) === char;
    }
   
    function expected(char: string): never {
        if (pos >= input.length) {
            throw new E101_LexerError(`Expected '${char}', found eof`);
        }
        else {
            throw new E101_LexerError(
                `Expected '${char}', found ${input.charAt(pos)}`
            );
        }
    }

    while (true) {
        let oldPos = pos;

        skipWhitespace();

        let choice: [TokenKind | null, [string, TokenKind] | null];

        if (seeingEof(pos)) {
            return;
        }
        else if (choice = choiceTree.get(input.charAt(pos))!) {
            pos += 1;
            let [tokenKind1, ch2Info] = choice;
            if (tokenKind1 === null) {
                if (ch2Info === null) {
                    throw new E000_InternalError(
                        "Precondition failed: both components null"
                    );
                }
                let [ch2, tokenKind2] = ch2Info;
                if (!seeingChar(ch2)) {
                    throw new E101_LexerError(
                        "Unrecognized character after '" + input.charAt(pos)
                            + "'"
                    );
                }
                pos += 1;
                yield new Token(tokenKind2);
            }
            else {
                if (ch2Info === null) {
                    yield new Token(tokenKind1);
                }
                else {
                    let [ch2, tokenKind2] = ch2Info;
                    if (seeingChar(ch2)) {
                        pos += 1;
                        yield new Token(tokenKind2);
                    }
                    else {
                        yield new Token(tokenKind1);
                    }
                }
            }
        }
        else if (seeingDigit()) {
            let digits: Array<string> = [];
            while (seeingDigit() || seeingChar("_")) {
                if (seeingChar("_")) {
                    pos += 1;
                }
                if (!seeingDigit()) {
                    throw new E101_LexerError("Lexer: expected digit");
                }
                digits.push(input.charAt(pos));
                pos += 1;
            }
            let n = BigInt(digits.join(""));
            yield new Token(TokenKind.IntLit, n);
        }
        else if (seeingChar('"')) {
            pos += 1;
            let characters: Array<string> = [];
            while (!seeingEof(pos) && !seeingChar('"')) {
                if (seeingChar("\\")) {   // escaped character
                    pos += 1;
                    if (seeingChar("n")) {
                        characters.push("\n");
                    }
                    else if (seeingChar("r")) {
                        characters.push("\r");
                    }
                    else if (seeingChar("t")) {
                        characters.push("\t");
                    }
                    else if (seeingChar('"')) {
                        characters.push('"');
                    }
                    else if (seeingChar("r")) {
                        characters.push("\r");
                    }
                    else if (seeingChar("t")) {
                        characters.push("\t");
                    }
                    else if (seeingChar('"')) {
                        characters.push('"');
                    }
                    else if (seeingChar("\\")) {
                        characters.push("\\");
                    }
                    else {
                        throw new E000_InternalError(
                            "Unrecognized escape character"
                        );
                    }
                }
                else {
                    characters.push(input.charAt(pos));
                }
                pos += 1;
            }
            if (!seeingChar('"')) {
                expected('"');
            }
            pos += 1;
            let s = characters.join("");
            yield new Token(TokenKind.StrLit, s);
        }
        else if (seeingLetter() || seeingChar("_")) {
            let characters: Array<string> = [];
            while (seeingLetter() || seeingDigit() || seeingChar("_")) {
                characters.push(input.charAt(pos));
                pos += 1;
            }
            let name = characters.join("");
            if (name === "true") {
                yield new Token(TokenKind.TrueKeyword, true);
            }
            else if (name === "false") {
                yield new Token(TokenKind.FalseKeyword, false);
            }
            else if (name === "none") {
                yield new Token(TokenKind.NoneKeyword);
            }
            else {
                throw new Error(`Unexpected identifier ${name}`);
                // yield new Token(TokenKind.Identifier, name);
            }
        }
        else {
            let tokenGuess = input
                .substring(pos, pos + 10)
                .replace(/\s.*/, "")
                .replace(/\w+$/, "");
            throw new E101_LexerError(`Unrecognized token '${tokenGuess}'`);
        }

        if (pos === oldPos) {
            throw new E101_LexerError("Position didn't advance");
        }
    }
}

