import {
    Lexer,
} from "./compiler/lex";
import {
    Parser,
} from "./compiler/parse";
import {
    validateCompUnit,
} from "./compiler/validate";
import {
    displayValue,
} from "./runtime/display";
import {
    runCompUnit,
} from "./runtime/evaluate";

export function run(source: string): string {
    let lexer = new Lexer(source);
    let parser = new Parser(lexer);
    let compUnit = parser.parseCompUnit();
    validateCompUnit(compUnit);
    let value = runCompUnit(compUnit);
    return displayValue(value, new Set());
}

