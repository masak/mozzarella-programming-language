import {
    runProgram,
} from "./evaluate";
import {
    Lexer,
} from "./lex";
import {
    Parser,
} from "./parse";
import {
    validateProgram,
} from "./validate";

export function run(source: string): string {
    let lexer = new Lexer(source);
    let parser = new Parser(lexer);
    let program = parser.parseProgram();
    validateProgram(program);
    let value = runProgram(program);
    return value.toString();
}

