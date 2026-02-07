import {
    E101_LexerError,
} from "./error";
import {
    Token,
    TokenKind,
} from "./token";

const WHITESPACE = /^\s*/;

export function* lex(input: string): Generator<Token, undefined> {
    let pos: number = 0;

    function skipWhitespace(): void {
        let n = input.substring(pos).match(WHITESPACE)![0].length;
        pos += n;
    }
    
    function seeingEof(pos: number): boolean {
        return pos >= input.length;
    }

    function seeingDigit(pos: number): boolean {
        return pos < input.length && /^\d/.test(input.charAt(pos));
    }

    function seeingChar(char: string, pos: number): boolean {
        return pos < input.length && input.charAt(pos) === char;
    }
   
    function expected(char: string, pos: number): never {
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

        if (seeingEof(pos)) {
            return;
        }
        else if (seeingDigit(pos)) {
            let digits: Array<string> = [];
            while (seeingDigit(pos) || seeingChar("_", pos)) {
                if (seeingChar("_", pos)) {
                    pos += 1;
                }
                if (!seeingDigit(pos)) {
                    throw new E101_LexerError("Lexer: expected digit");
                }
                digits.push(input.charAt(pos));
                pos += 1;
            }
            let n = BigInt(digits.join(""));
            yield new Token(TokenKind.IntLit, n);
        }
        else if (seeingChar('"', pos)) {
            pos += 1;
            let characters: Array<string> = [];
            while (!seeingEof(pos) && !seeingChar('"', pos)) {
                if (seeingChar("\\", pos)) {   // escaped character
                    pos += 1;
                    if (seeingChar("n", pos)) {
                        characters.push("\n");
                    }
                    else if (seeingChar("r", pos)) {
                        characters.push("\r");
                    }
                    else if (seeingChar("t", pos)) {
                        characters.push("\t");
                    }
                    else if (seeingChar('"', pos)) {
                        characters.push('"');
                    }
                    else if (seeingChar("\\", pos)) {
                        characters.push("\\");
                        characters.push("\n");
                    }
                    else if (seeingChar("r", pos)) {
                        characters.push("\r");
                    }
                    else if (seeingChar("t", pos)) {
                        characters.push("\t");
                    }
                    else if (seeingChar('"', pos)) {
                        characters.push('"');
                    }
                    else if (seeingChar("\\", pos)) {
                        characters.push("\\");
                    }
                    else {
                        throw new Error("Unrecognized escape character");
                    }
                }
                else {
                    characters.push(input.charAt(pos));
                }
                pos += 1;
            }
            if (!seeingChar('"', pos)) {
                expected('"', pos);
            }
            pos += 1;
            let s = characters.join("");
            yield new Token(TokenKind.StrLit, s);
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

