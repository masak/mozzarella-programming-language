import {
    Lexer,
} from "./compiler/lex";
import {
    Parser,
} from "./compiler/parse";
import {
    validateProgram,
} from "./compiler/validate";
import {
    displayValue,
} from "./runtime/display";
import {
    runProgram,
} from "./runtime/evaluate";

export function run(source: string): string {
    let lexer = new Lexer(source);
    let parser = new Parser(lexer);
    let program = parser.parseProgram();
    validateProgram(program);
    let value = runProgram(program);
    return displayValue(value, new Set());
}

