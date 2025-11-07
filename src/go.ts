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
    runCompUnitWithFuel,
} from "./runtime/evaluate";

export {
    E201_SyntaxError,
} from "./compiler/error";
export {
    E500_OutOfFuel,
    E501_ZeroDivisionError,
    E502_UnchainableOpsError,
    E503_TypeError,
    E504_IndexError,
} from "./runtime/error";

export function run(source: string): string {
    let lexer = new Lexer(source);
    let parser = new Parser(lexer);
    let compUnit = parser.parseCompUnit();
    validateCompUnit(compUnit);
    let value = runCompUnit(compUnit);
    return displayValue(value, new Set());
}

export function runWithFuel(source: string, fuel: number): string {
    let lexer = new Lexer(source);
    let parser = new Parser(lexer);
    let compUnit = parser.parseCompUnit();
    validateCompUnit(compUnit);
    let value = runCompUnitWithFuel(compUnit, fuel);
    return displayValue(value, new Set());
}

