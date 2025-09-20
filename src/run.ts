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
    let value = program.run();
    return value.toString();
}

