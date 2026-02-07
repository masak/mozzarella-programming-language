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

