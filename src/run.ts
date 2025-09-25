import {
    runProgram,
} from "./evaluate";
import {
    Lexer,
} from "./lexer";
import {
    Parser,
} from "./parser";

export function run(source: string): string {
    let lexer = new Lexer(source);
    let parser = new Parser(lexer);
    let program = parser.parseProgram();
    let value = runProgram(program);
    return value.toString();
}

